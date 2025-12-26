/**
 * Mimic - The invisible developer in your menu bar
 *
 * Paste a screenshot. Get Tailwind CSS code. That's it.
 */

import { useState, useEffect } from "react";
import { Settings, Copy, RefreshCw, HelpCircle, X, History, Trash2, Monitor, Smartphone } from "lucide-react";
import { Store } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emitTo } from "@tauri-apps/api/event";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { GhostIcon } from "./GhostIcon";

interface HistoryItem {
  id: string;
  timestamp: number;
  image: string;
  code: string;
  parentId?: string; // For tracking refinements of the same generation
  isRefinement?: boolean;
}

function App() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);
  const [refinementInstruction, setRefinementInstruction] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinementDialog, setShowRefinementDialog] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(380);
  const [imageHeight, setImageHeight] = useState<number>(380);

  /**
   * Calculate aspect ratio from an image
   */
  const setImageDimensions = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setImageHeight(img.height);
      setImageWidth(img.width);

    };
    img.src = imageUrl;
  };

  /**
   * Remove markdown code fences from GPT response
   * GPT sometimes wraps code in ```html...``` blocks
   */
  const cleanCodeResponse = (code: string): string => {
    let cleaned = code.trim();
    cleaned = cleaned.replace(/^```html\n?/i, '');
    cleaned = cleaned.replace(/^```\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
    return cleaned.trim();
  };

  /**
   * Wrap generated code in a full HTML document with Tailwind CDN
   * This allows the preview iframe to render Tailwind styles correctly
   */
  const getPreviewHTML = (code: string): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${code}
</body>
</html>`;
  };

  /**
   * Main code generation function
   * Sends screenshot to OpenAI API via Tauri backend and processes response
   */
  const generateCode = async (base64: string) => {
    console.log("generateCode called with image data length:", base64.length);

    if (!apiKey) {
      console.warn("No API key set");
      setError("Please enter your OpenAI API key in settings");
      setShowSettings(true);
      return;
    }

    console.log("Starting code generation...");
    setLoading(true);
    setGeneratedCode("");
    setError(null);

    try {
      console.log("Invoking Tauri command...");
      // Call Rust backend which handles the OpenAI API request
      const code = await invoke("generate_code", {
        apiKey,
        imageData: base64,
      });
      console.log("Code generated successfully, length:", (code as string).length);
      const cleanedCode = cleanCodeResponse(code as string);
      setGeneratedCode(cleanedCode);
      setActiveTab("preview"); // Auto-switch to preview to show the result

      // Save to history and track generation ID
      const generationId = await saveToHistory(base64, cleanedCode);
      setCurrentGenerationId(generationId);
    } catch (error) {
      console.error("Error generating code:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refine existing code with natural language instructions
   * Sends current code + instruction to GPT for modification
   */
  const refineCode = async () => {
    if (!apiKey) {
      setError("Please enter your OpenAI API key in settings");
      setShowSettings(true);
      return;
    }

    if (!refinementInstruction.trim()) {
      setError("Please enter refinement instructions");
      return;
    }

    if (!generatedCode) {
      setError("No code to refine");
      return;
    }

    console.log("Starting code refinement...");
    setIsRefining(true);
    setError(null);

    try {
      console.log("Invoking Tauri refine_code command...");
      const refinedCode = await invoke("refine_code", {
        apiKey,
        currentCode: generatedCode,
        instruction: refinementInstruction,
      });
      console.log("Code refined successfully, length:", (refinedCode as string).length);
      const cleanedCode = cleanCodeResponse(refinedCode as string);
      setGeneratedCode(cleanedCode);
      setRefinementInstruction(""); // Clear the instruction after success
      setShowRefinementDialog(false); // Close the dialog
      setActiveTab("preview"); // Auto-switch to preview to show the result

      // Save refinement to history
      if (pastedImage) {
        const refinementId = await saveToHistory(
          pastedImage,
          cleanedCode,
          currentGenerationId || undefined,
          true
        );
        setCurrentGenerationId(refinementId);
      }
    } catch (error) {
      console.error("Error refining code:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRefining(false);
    }
  };

  useEffect(() => {
    if (pastedImage && !loading && !generatedCode) {
      generateCode(pastedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastedImage]);

  /**
   * Close refinement dialog on ESC key press
   */
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showRefinementDialog) {
        setShowRefinementDialog(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [showRefinementDialog]);

  /**
   * Setup effect: Load stored API key and register global paste/drop event listeners
   */
  useEffect(() => {
    const loadStore = async () => {
      const store = await Store.load("settings.json");
      setStore(store);
      const storedApiKey = await store.get<string>("apiKey");
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
      // Load history
      const savedHistory = await store.get<HistoryItem[]>("history");
      if (savedHistory) {
        setHistory(savedHistory);
      }
    };
    loadStore();

    // Handle drag-and-drop of image files
    const handleWindowDrop = (event: DragEvent) => {
      console.log("Window drop event fired");
      event.preventDefault(); // Prevent default browser behavior
      const file = event.dataTransfer?.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setPastedImage(base64);
          setImageDimensions(base64);
        };
        reader.readAsDataURL(file);
      }
    };

    // Handle paste events (Cmd+V / Ctrl+V) for images from clipboard
    const handleWindowPaste = (event: ClipboardEvent) => {
      console.log("Window paste event fired");
      const items = event.clipboardData?.items;
      if (items) {
        for (const item of items) {
          console.log("Clipboard item type:", item.type);
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              console.log("Image file found, reading...");
              const reader = new FileReader();
              reader.onload = (e) => {
                const base64 = e.target?.result as string;
                console.log("Image loaded as base64, length:", base64.length);
                setPastedImage(base64);
                setImageDimensions(base64);
              };
              reader.readAsDataURL(file);
            }
          }
        }
      }
    };

    window.addEventListener("drop", handleWindowDrop);
    window.addEventListener("paste", handleWindowPaste);
    window.addEventListener("dragover", (e) => e.preventDefault()); // Prevent default to allow drop

    return () => {
      window.removeEventListener("drop", handleWindowDrop);
      window.removeEventListener("paste", handleWindowPaste);
      window.removeEventListener("dragover", (e) => e.preventDefault());
    };
  }, [apiKey]);


  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    if (store) {
      store.set("apiKey", newApiKey);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTryAnother = () => {
    setPastedImage(null);
    setGeneratedCode("");
    setError(null);
    setLoading(false); // Ensure loading state is cleared
    setIsRefining(false); // Clear refinement state too
    setActiveTab("code");
    setCurrentGenerationId(null);
    setRefinementInstruction(""); // Clear any pending instructions
    setShowRefinementDialog(false); // Close refinement dialog
  };

  const openMobilePreview = async () => {
    if (!generatedCode) {
      setError('No code to preview');
      return;
    }

    // Create a complete HTML document with the generated code
    const previewHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mobile Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${generatedCode}
      </body>
      </html>
    `;

    const dataUrl = `data:text/html,${encodeURIComponent(previewHTML)}`;

    const mobileWindow = new WebviewWindow(`mobile-preview-${Date.now()}`, {
      url: dataUrl,
      title: 'Mobile Preview',
      width: 420,
      height: 844,
      resizable: true,
      center: true,
    });

    mobileWindow.once('tauri://created', () => {
      console.log('Mobile preview window opened successfully!');
    });

    mobileWindow.once('tauri://error', (e) => {
      console.error('Error opening mobile preview window:', e);
      setError('Failed to open mobile preview window');
    });
  };

  const openDesktopPreview = async () => {
    if (!generatedCode) {
      setError('No code to preview');
      return;
    }

    // Create a complete HTML document with the generated code
    const previewHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Desktop Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${generatedCode}
      </body>
      </html>
    `;

    const dataUrl = `data:text/html,${encodeURIComponent(previewHTML)}`;

    const desktopWindow = new WebviewWindow(`desktop-preview-${Date.now()}`, {
      url: dataUrl,
      title: 'Desktop Preview',
      width: 1080,
      height: 675,
      resizable: true,
      center: true,
    });

    desktopWindow.once('tauri://created', () => {
      console.log('Desktop preview window opened successfully!');
    });

    desktopWindow.once('tauri://error', (e) => {
      console.error('Error opening desktop preview window:', e);
      setError('Failed to open desktop preview window');
    });
  };

  /**
   * Save a generation to history
   */
  const saveToHistory = async (
    image: string,
    code: string,
    parentId?: string,
    isRefinement = false
  ): Promise<string> => {
    if (!store) return Date.now().toString();

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      image,
      code,
      parentId,
      isRefinement,
    };

    setHistory((prevHistory) => {
      const updatedHistory = [newItem, ...prevHistory].slice(0, 30); // Keep last 30 (more room for refinements)
      store.set("history", updatedHistory);
      store.save();
      return updatedHistory;
    });

    return newItem.id;
  };

  /**
   * Load history from store
   */
  const loadHistory = async () => {
    if (!store) return;
    const savedHistory = await store.get<HistoryItem[]>("history");
    if (savedHistory) {
      setHistory(savedHistory);
    }
  };

  /**
   * Restore a generation from history
   */
  const restoreFromHistory = (item: HistoryItem) => {
    setPastedImage(item.image);
    setGeneratedCode(item.code);
    setActiveTab("preview");
    setShowHistory(false);
    setCurrentGenerationId(item.id);
    setImageDimensions(item.image);
  };

  /**
   * Clear all history
   */
  const clearHistory = async () => {
    if (!store) return;
    setHistory([]);
    await store.set("history", []);
    await store.save();
  };

  return (
    <div
      className="bg-zinc-950 text-white min-h-screen flex flex-col items-center py-6 px-8"
    >
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GhostIcon className="w-7 h-7" />
            Mimic
          </h1>
          <div className="flex items-center gap-2">
            {(generatedCode || pastedImage || loading) && (
              <button
                onClick={handleTryAnother}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-sm"
                title={loading ? "Cancel and reset" : "Try another screenshot"}
              >
                <RefreshCw className="w-4 h-4" />
                {loading ? "Reset" : "Try Another"}
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-zinc-800 rounded-md transition-colors relative"
              title="History"
            >
              <History className="w-6 h-6" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="grid grid-cols-5 gap-3 text-xs text-zinc-300 mb-2">
              <div><strong>1.</strong> Add API key</div>
              <div><strong>2.</strong> Paste screenshot</div>
              <div><strong>3.</strong> Wait for GPT</div>
              <div><strong>4.</strong> View code/preview</div>
              <div><strong>5.</strong> Copy code</div>
            </div>
            <p className="text-xs text-zinc-500">
              No cloud storage. No tracking. Just screenshots → code.
            </p>
          </div>
        )}

        {showSettings && (
          <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={apiKey}
              onChange={handleApiKeyChange}
            />
            <p className="text-xs text-zinc-500 mt-2">
              Your API key is stored locally and never sent anywhere except OpenAI.
            </p>
          </div>
        )}

        {showHistory && (
          <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Generation History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-zinc-500">No generations yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => restoreFromHistory(item)}
                    className={`w-full p-3 bg-zinc-950 hover:bg-zinc-800 border rounded-md transition-colors text-left flex items-center gap-3 ${
                      item.isRefinement
                        ? "border-blue-900 ml-4"
                        : "border-zinc-800"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt="Thumbnail"
                      className="w-16 h-16 object-cover rounded border border-zinc-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.isRefinement && (
                          <RefreshCw className="w-3 h-3 text-blue-400" />
                        )}
                        <p className="text-xs text-zinc-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-zinc-300 truncate mt-1">
                        {item.code.substring(0, 60)}...
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-md text-red-400 relative">
            <button
              onClick={() => setError(null)}
              className="absolute top-2 right-2 p-1 hover:bg-red-800/30 rounded transition-colors"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="font-semibold">Error:</p>
            <p className="pr-8">{error}</p>
            <button
              onClick={handleTryAnother}
              className="mt-3 px-3 py-1.5 bg-red-800/40 hover:bg-red-800/60 rounded text-sm transition-colors"
            >
              Start Over
            </button>
          </div>
        )}

        {loading ? (
          <div className="border border-zinc-800 rounded-lg w-full h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-lg">Generating code from screenshot...</p>
            <p className="text-sm text-zinc-500">This may take a few moments</p>
            <p className="text-xs text-zinc-600 mt-2">Stuck? Click the "Reset" button above</p>
          </div>
        ) : generatedCode ? (
          <div className="space-y-4">
            {/* Split Layout: Image on left, Code/Preview on right */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Original Screenshot */}
              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800">
                  <h3 className="text-sm font-semibold">Original Screenshot</h3>
                </div>
                <div className="p-4 bg-zinc-950 h-[380px] flex items-center justify-center">
                  {pastedImage && (
                    <img
                      src={pastedImage}
                      alt="Original Screenshot"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Right: Code/Preview Tabs */}
              <div className="border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
                {/* Tab Headers */}
                <div className="bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex">
                    <button
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${
                        activeTab === "code"
                          ? "bg-zinc-950 text-white border-b-2 border-blue-500"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("code")}
                    >
                      Code
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${
                        activeTab === "preview"
                          ? "bg-zinc-950 text-white border-b-2 border-blue-500"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("preview")}
                    >
                      Preview
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mr-3">
                    {activeTab === "preview" && generatedCode && (
                      <>
                        <button
                          onClick={openMobilePreview}
                          className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                          title="Open mobile preview"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={openDesktopPreview}
                          className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                          title="Open desktop preview"
                        >
                          <Monitor className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {activeTab === "code" && generatedCode && (
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                        title="Copy code"
                      >
                        {copied ? (
                          <span className="text-xs text-green-400 px-1">Copied!</span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-zinc-950 h-[380px] flex items-center justify-center">
                  {activeTab === "code" ? (
                    <div className="w-full h-full overflow-auto">
                      <CodeMirror
                        value={generatedCode}
                        height="380px"
                        theme={vscodeDark}
                        extensions={[html()]}
                        onChange={(value) => setGeneratedCode(value)}
                        basicSetup={{
                          lineNumbers: true,
                          highlightActiveLineGutter: true,
                          highlightActiveLine: true,
                          foldGutter: true,
                          dropCursor: true,
                          indentOnInput: true,
                          bracketMatching: true,
                          closeBrackets: true,
                          autocompletion: true,
                          highlightSelectionMatches: true,
                        }}
                        style={{
                          fontSize: "14px",
                          height: "100%",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-950 h-[380px] flex items-center justify-center">
                      <div className="relative" style={{
                        width: `${imageWidth}px`,
                        height: `${imageHeight}px`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}>
                        {/* Device Frame */}
                        <div className="absolute inset-0 rounded-xl border-[8px] border-zinc-800 shadow-2xl pointer-events-none" />

                        {/* Browser Chrome */}
                        <div className="absolute top-2 left-2 right-2 h-6 bg-zinc-900 rounded-t-lg flex items-center px-2 gap-1.5 pointer-events-none z-10">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        </div>

                        <iframe
                          srcDoc={getPreviewHTML(generatedCode)}
                          className="w-full h-full border-0 bg-white rounded-lg"
                          title="Preview"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Floating AI Assistant Button */}
            <button
              onClick={() => setShowRefinementDialog(true)}
              className="fixed bottom-8 right-8 w-16 h-16 text-white hover:scale-110 transition-all duration-200 flex items-center justify-center group filter drop-shadow-lg hover:drop-shadow-2xl ghost-float cursor-pointer"
              title="AI Assistant - Refine your code"
            >
              <GhostIcon className="w-full h-full" />
            </button>

            {/* AI Chat Popup */}
            {showRefinementDialog && (
              <>
                {/* Backdrop (subtle) */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRefinementDialog(false)}
                />

                {/* Chat Bubble */}
                <div className="fixed bottom-28 right-8 z-50 w-96 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <GhostIcon className="w-7 h-7 text-white" />
                      <h3 className="text-sm font-semibold">mimic ghost</h3>
                    </div>
                    <button
                      onClick={() => setShowRefinementDialog(false)}
                      className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Chat Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-zinc-400">
                      What should I change?
                    </p>

                    <input
                      type="text"
                      placeholder="make it responsive, add dark mode, etc..."
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-zinc-600"
                      value={refinementInstruction}
                      onChange={(e) => setRefinementInstruction(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isRefining) {
                          refineCode();
                        }
                      }}
                      disabled={isRefining}
                      autoFocus
                    />

                    {/* Quick Chips */}
                    <div className="space-y-1.5">
                      <p className="text-xs text-zinc-600">Try these:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "make responsive",
                          "add dark mode",
                          "use grid",
                          "add animations",
                        ].map((example) => (
                          <button
                            key={example}
                            onClick={() => setRefinementInstruction(example)}
                            className="px-2.5 py-1 bg-zinc-800/60 hover:bg-zinc-800 text-xs rounded-full transition-colors"
                            disabled={isRefining}
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={refineCode}
                      disabled={isRefining || !refinementInstruction.trim()}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {isRefining ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          doing the thing...
                        </>
                      ) : (
                        <>
                          <GhostIcon className="w-4 h-4" />
                          ship it
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : pastedImage ? (
          <div className="space-y-4">
            <div className="border border-zinc-800 rounded-lg w-full h-[400px] flex items-center justify-center p-4 bg-zinc-900">
              <img src={pastedImage} alt="Pasted" className="max-w-full max-h-full object-contain" />
            </div>
            <p className="text-center text-zinc-400 text-sm">Processing your screenshot...</p>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-zinc-700 rounded-lg w-full h-64 flex items-center justify-center"
          >
            <p className="text-zinc-500">Drop Screenshot Here or Paste (Cmd+V)</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

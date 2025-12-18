/**
 * Mimic - The invisible developer in your menu bar
 *
 * Paste a screenshot. Get Tailwind CSS code. That's it.
 */

import { useState, useEffect } from "react";
import { Settings, Copy, RefreshCw, HelpCircle } from "lucide-react";
import { Store } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";

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
    } catch (error) {
      console.error("Error generating code:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pastedImage && !loading && !generatedCode) {
      generateCode(pastedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastedImage]);

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
    setActiveTab("code");
  };

  return (
    <div
      className="bg-zinc-950 text-white min-h-screen flex flex-col items-center py-6 px-8"
    >
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">👻 Mimic</h1>
          <div className="flex items-center gap-2">
            {generatedCode && (
              <button
                onClick={handleTryAnother}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Another
              </button>
            )}
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

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-md text-red-400">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="border border-zinc-800 rounded-lg w-full h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-lg">Generating code from screenshot...</p>
            <p className="text-sm text-zinc-500">This may take a few moments</p>
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
                  {activeTab === "code" && (
                    <button
                      onClick={handleCopyCode}
                      className="mr-3 p-1.5 hover:bg-zinc-800 rounded transition-colors"
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

                {/* Tab Content */}
                <div className="overflow-auto bg-zinc-950 h-[380px]">
                  {activeTab === "code" ? (
                    <pre className="p-4 text-sm">
                      <code className="text-zinc-100">{generatedCode}</code>
                    </pre>
                  ) : (
                    <iframe
                      srcDoc={getPreviewHTML(generatedCode)}
                      className="w-full h-full border-0 bg-white"
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  )}
                </div>
              </div>
            </div>
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

import { Copy, Monitor, Smartphone } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

interface PreviewPaneProps {
  activeTab: "code" | "preview";
  generatedCode: string;
  copied: boolean;
  imageWidth: number;
  imageHeight: number;
  onTabChange: (tab: "code" | "preview") => void;
  onCodeChange: (value: string) => void;
  onCopy: () => void;
  onOpenMobilePreview: () => void;
  onOpenDesktopPreview: () => void;
  getPreviewHTML: (code: string) => string;
}

export function PreviewPane({
  activeTab,
  generatedCode,
  copied,
  imageWidth,
  imageHeight,
  onTabChange,
  onCodeChange,
  onCopy,
  onOpenMobilePreview,
  onOpenDesktopPreview,
  getPreviewHTML,
}: PreviewPaneProps) {
  return (
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
            onClick={() => onTabChange("code")}
          >
            Code
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "preview"
                ? "bg-zinc-950 text-white border-b-2 border-blue-500"
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => onTabChange("preview")}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2 mr-3">
          {activeTab === "preview" && generatedCode && (
            <>
              <button
                onClick={onOpenMobilePreview}
                className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                title="Open mobile preview"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenDesktopPreview}
                className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                title="Open desktop preview"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </>
          )}
          {activeTab === "code" && generatedCode && (
            <button
              onClick={onCopy}
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
              onChange={onCodeChange}
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
  );
}

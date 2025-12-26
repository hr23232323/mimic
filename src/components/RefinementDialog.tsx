import { X } from "lucide-react";
import { GhostIcon } from "../GhostIcon";

interface RefinementDialogProps {
  isOpen: boolean;
  isRefining: boolean;
  instruction: string;
  onClose: () => void;
  onInstructionChange: (value: string) => void;
  onSubmit: () => void;
}

const EXAMPLE_PROMPTS = [
  "make responsive",
  "add dark mode",
  "use grid",
  "add animations",
];

export function RefinementDialog({
  isOpen,
  isRefining,
  instruction,
  onClose,
  onInstructionChange,
  onSubmit,
}: RefinementDialogProps) {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRefining) {
      onSubmit();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
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
            onClick={onClose}
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
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRefining}
            autoFocus
          />

          {/* Quick Chips */}
          <div className="space-y-1.5">
            <p className="text-xs text-zinc-600">Try these:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  onClick={() => onInstructionChange(example)}
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
            onClick={onSubmit}
            disabled={isRefining || !instruction.trim()}
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
  );
}

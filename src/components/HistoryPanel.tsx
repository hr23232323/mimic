import { RefreshCw, Trash2 } from "lucide-react";

export interface HistoryItem {
  id: string;
  timestamp: number;
  image: string;
  code: string;
  parentId?: string;
  isRefinement?: boolean;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClearAll: () => void;
}

export function HistoryPanel({ history, onRestore, onClearAll }: HistoryPanelProps) {
  return (
    <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Generation History</h3>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
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
              onClick={() => onRestore(item)}
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
  );
}

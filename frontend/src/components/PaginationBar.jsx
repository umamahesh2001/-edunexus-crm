import { ChevronLeft, ChevronRight } from 'lucide-react';

const LIMIT_OPTIONS = [5, 10, 25, 50, 100];

const PaginationBar = ({ page, totalPages, total, limit, onPageChange, onLimitChange }) => {
  return (
    <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-wrap rounded-b-3xl">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center px-3 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
      >
        <ChevronLeft size={16} className="mr-1" /> Prev
      </button>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span className="text-xs font-bold text-slate-500">
          Page <span className="text-slate-900">{page}</span> / <span className="text-slate-900">{totalPages || 1}</span>
          <span className="ml-2 text-slate-400">({total} total)</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Rows:</span>
          {LIMIT_OPTIONS.map((n, idx, arr) => {
            const prevLimit = idx === 0 ? 0 : arr[idx - 1];
            const isDisabled = total <= prevLimit;
            return (
              <button
                key={n}
                disabled={isDisabled}
                onClick={() => { onLimitChange(n); onPageChange(1); }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all shadow-sm ${
                  isDisabled
                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                    : limit === n
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center px-3 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
      >
        Next <ChevronRight size={16} className="ml-1" />
      </button>
    </div>
  );
};

export default PaginationBar;

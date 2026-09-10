import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-6 px-8 py-6 bg-[#FDF3E4] border border-red-200 rounded-2xl shadow-xl shadow-red-900/5">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
        <AlertCircle size={24} />
      </div>
      <div className="flex-1">
        <span className="text-[10px] font-black text-red-500/40 uppercase tracking-widest block mb-1">Interrupt</span>
        <span className="text-sm font-serif italic text-[#34170A]">{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FDF3E4] bg-[#A35100] rounded-full">
          Retry <RefreshCcw size={12} />
        </button>
      )}
    </div>
  );
}
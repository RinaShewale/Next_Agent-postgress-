export default function IconButton({ onClick, children, active = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A35100]/40 focus-visible:ring-offset-1
        ${active ? 'bg-[#A35100] text-[#FDF3E4]' : 'text-[#A35100]/40 hover:bg-[#A35100]/5 hover:text-[#A35100]'}
        ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
    >
      {children}
      {active && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#A35100] shadow-[0_0_8px_#A35100]" />}
    </button>
  );
}
const variants = {
  green:  'bg-green-500/10 text-green-700 border-green-500/20',
  red:    'bg-red-500/10 text-red-700 border-red-500/20',
  // 'accent' and 'blue' are identical — blue kept for backward compat
  accent: 'bg-[#A35100]/10 text-[#A35100] border-[#A35100]/20',
  blue:   'bg-[#A35100]/10 text-[#A35100] border-[#A35100]/20',
  zinc:   'bg-[#34170A]/5 text-[#34170A]/60 border-[#34170A]/10',
};

export default function Badge({ label, variant = 'zinc' }) {
  return (
    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border ${variants[variant]}`}>
      {label}
    </span>
  );
}
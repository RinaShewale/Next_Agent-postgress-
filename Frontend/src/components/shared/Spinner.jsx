import { motion } from 'framer-motion';

export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className={`${sizes[size]} relative`}>
      <svg viewBox="0 0 24 24" className="w-full h-full opacity-10">
        <circle cx="12" cy="12" r="10" stroke="#A35100" strokeWidth="2" fill="none" />
      </svg>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#A35100" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </motion.div>
    </div>
  );
}
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-sm font-medium text-slate-600"
      >
        Sandbox ready
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Tell the agent what to build
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-xl text-lg text-slate-500"
      >
        This project starts empty on purpose. Describe the site you want in
        the chat — landing page, portfolio, dashboard — and the agent will
        build it here, live.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
      >
        Waiting for your first prompt…
      </motion.div>
    </section>
  );
}
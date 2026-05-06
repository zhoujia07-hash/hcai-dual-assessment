
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-10">
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-center text-slate-800 mb-10"
      >
        Human-Centered AI Dual Assessment Framework
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-6 max-w-6xl w-full"
      >
        <img
          src="/framework.png"
          alt="HCAI Framework"
          className="rounded-2xl w-full object-contain"
        />

        <div className="flex flex-col md:flex-row gap-6 justify-center mt-10">
          
          <Link href="/end-user">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold px-10 py-5 rounded-2xl shadow-lg transition-all"
            >
              End User
            </motion.button>
          </Link>

          <Link href="/organization">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="bg-green-600 hover:bg-green-700 text-white text-xl font-semibold px-10 py-5 rounded-2xl shadow-lg transition-all"
            >
              Organization User
            </motion.button>
          </Link>

        </div>
      </motion.div>

      <p className="mt-8 text-slate-500 text-sm text-center max-w-3xl">
        A research-oriented interactive framework for integrating
        end-user perception assessment and organizational maturity
        evaluation in Human-Centered AI systems.
      </p>
    </main>
  );
}


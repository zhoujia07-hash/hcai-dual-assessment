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

        <p className="mt-8 text-slate-500 text-sm text-center max-w-3xl mx-auto leading-relaxed">
          A lifecycle-oriented dual-assessment framework: integrating objective organizational hcai capabilities and subjective end-user perceptions.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center mt-10">

  <Link href="/organization">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="bg-green-600 hover:bg-green-700 text-white text-xl font-semibold px-10 py-5 rounded-2xl shadow-lg transition-all"
    >
      Organization User
    </motion.button>
  </Link>

  <Link href="/end-user">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold px-10 py-5 rounded-2xl shadow-lg transition-all"
    >
      End User
    </motion.button>
  </Link>

</div>

        <p className="mt-8 text-purple-600 text-sm font-semibold text-center max-w-3xl mx-auto">
          Complete both  Organization User and End User assessments before using
          "Diagnose the Impact Gap" to generate integrated insights.
        </p>

        <div className="flex justify-center mt-5">
          <Link href="/results">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xl font-semibold px-10 py-5 rounded-2xl shadow-lg transition-all"
            >
              Diagnose the Impact Gap
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
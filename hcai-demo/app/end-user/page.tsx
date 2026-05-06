"use client";

import { useState } from "react";
import Link from "next/link";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const questions = [
  // Trust
  {
    factor: "Trust",
    question:
      "I trust the AI system to keep my data private and secure.",
  },
  {
    factor: "Trust",
    question:
      "I believe the AI system is honestly working to accomplish my goals and not pursuing any other agenda.",
  },
  {
    factor: "Trust",
    question:
      "I value the AI system’s recommendations, and I trust that together we are able to make the right decisions.",
  },
  {
    factor: "Trust",
    question:
      "I feel confident and safe that the AI system’s recommendations are aligned to the best interest of those potentially affected.",
  },

  // Transparency
  {
    factor: "Transparency",
    question:
      "I have easy access to sufficient information about how the AI system works, including the rules or logic it follows.",
  },
  {
    factor: "Transparency",
    question:
      "I know the strengths and weaknesses of the AI system, including what it can and cannot do.",
  },
  {
    factor: "Transparency",
    question:
      "It is clear and understandable to me what information the AI system uses and how it makes its suggestions or decisions.",
  },
  {
    factor: "Transparency",
    question:
      "The strengths and weaknesses of the AI system, including when and why it might make mistakes, are clearly explained to me.",
  },

  // Explainability
  {
    factor: "Explainability",
    question:
      "The AI system provides clear explanations for its recommendations or actions.",
  },
  {
    factor: "Explainability",
    question:
      "I can confidently interpret how the AI system has chosen each recommendation.",
  },
  {
    factor: "Explainability",
    question:
      "The AI system understands and adapts to the cultural context where its recommendations will be applied.",
  },
  {
    factor: "Explainability",
    question:
      "I understand why the AI system gives certain suggestions or decisions.",
  },

  // Human Control
  {
    factor: "Human Control",
    question:
      "I am satisfied with my control of the AI system.",
  },
  {
    factor: "Human Control",
    question:
      "I can easily intervene in the behavior of the AI system.",
  },
  {
    factor: "Human Control",
    question:
      "I have sufficient knowledge to provide feedback and maintain control.",
  },
  {
    factor: "Human Control",
    question:
      "I am in control of the results when using the AI system.",
  },

  // Adaptability
  {
    factor: "Adaptability",
    question:
      "The AI system understands and adapts to individual and cultural backgrounds.",
  },
  {
    factor: "Adaptability",
    question:
      "The AI system understands and supports my needs and skills.",
  },
  {
    factor: "Adaptability",
    question:
      "The AI system understands the context where recommendations are applied.",
  },
  {
    factor: "Adaptability",
    question:
      "The AI system adjusts to my personal preferences and way of working.",
  },

  // Formal Fairness
  {
    factor: "Formal Fairness",
    question:
      "The AI gives everyone the same chances and choices.",
  },
  {
    factor: "Formal Fairness",
    question:
      "I have not noticed unfair treatment from the AI system.",
  },
  {
    factor: "Formal Fairness",
    question:
      "The AI system treats all users equally.",
  },
  {
    factor: "Formal Fairness",
    question:
      "The AI system does not discriminate against any person or group.",
  },

  // Substantive Fairness
  {
    factor: "Substantive Fairness",
    question:
      "The AI system’s recommendations are fair and reasonable.",
  },
  {
    factor: "Substantive Fairness",
    question:
      "The AI system listens to feedback about unfairness and improves.",
  },
  {
    factor: "Substantive Fairness",
    question:
      "The AI adapts its criteria to match each person’s circumstances.",
  },
  {
    factor: "Substantive Fairness",
    question:
      "The AI system considers the needs of people from different backgrounds.",
  },
];

export default function EndUserPage() {
  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(4)
  );

  const [results, setResults] = useState<
    { factor: string; score: number }[]
  >([]);

  const handleChange = (index: number, value: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const autoComplete = () => {
    const randomAnswers = questions.map(
      () => Math.floor(Math.random() * 3) + 5
    );

    setAnswers(randomAnswers);
  };

  const submitAssessment = () => {
    const factorScores: Record<string, number[]> = {};

    questions.forEach((q, index) => {
      if (!factorScores[q.factor]) {
        factorScores[q.factor] = [];
      }

      factorScores[q.factor].push(answers[index]);
    });

    const computedResults = Object.entries(factorScores).map(
      ([factor, values]) => ({
        factor,
        score:
          values.reduce((sum, value) => sum + value, 0) /
          values.length,
      })
    );

    setResults(computedResults);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              End-User Assessment (HuCAS)
            </h1>

            <p className="text-slate-500 mt-2">
              Human-Centered AI Capability Assessment Scale
            </p>
          </div>

          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back Home
          </Link>
        </div>

        {/* Intro */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
          <p className="text-slate-700 leading-relaxed">
            Please evaluate your perception of the AI system using the
            following statements. Rate each item from 1 (strongly disagree)
            to 7 (strongly agree).
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div
              key={index}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
            >
              <div className="mb-4">
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  {q.factor}
                </span>

                <h2 className="text-xl font-medium text-slate-800 mt-2">
                  {q.question}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleChange(index, num)}
                    className={`w-12 h-12 rounded-full border text-lg font-medium transition-all duration-200 ${
                      answers[index] === num
                        ? "bg-blue-600 text-white border-blue-600 scale-110"
                        : "bg-white hover:bg-slate-200 border-slate-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-3 max-w-md">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-12">

          <button
            onClick={autoComplete}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl transition-all"
          >
            Auto Complete All Questions
          </button>

          <button
            onClick={submitAssessment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
          >
            Submit Assessment
          </button>

        </div>

        {/* Radar Chart */}
        {results.length > 0 && (
          <div className="mt-16">

            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              HuCAS Factor Profile
            </h2>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">

              <div className="w-full h-[500px]">

                <ResponsiveContainer width="100%" height="100%">

                  <RadarChart data={results}>

                    <PolarGrid />

                    <PolarAngleAxis dataKey="factor" />

                    <PolarRadiusAxis domain={[0, 7]} />

                    <Radar
                      name="HuCAS"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.45}
                    />

                  </RadarChart>

                </ResponsiveContainer>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}
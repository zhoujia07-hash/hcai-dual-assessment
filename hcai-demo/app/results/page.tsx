"use client";

import Link from "next/link";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const hucasResults = [
  { factor: "Trust", score: 5.8 },
  { factor: "Transparency", score: 4.2 },
  { factor: "Explainability", score: 3.9 },
  { factor: "Human Control", score: 4.8 },
  { factor: "Adaptability", score: 5.1 },
  { factor: "Formal Fairness", score: 5.5 },
  { factor: "Substantive Fairness", score: 4.4 },
];

const maturityResults = [
  { topic: "Governance", pre: 3, post: 2 },
  { topic: "HCD Integration", pre: 4, post: 3 },
  { topic: "Fairness", pre: 3, post: 2 },
  { topic: "Security", pre: 4, post: 4 },
  { topic: "Explainability", pre: 4, post: 2 },
  { topic: "Human Control", pre: 3, post: 2 },
  { topic: "Societal Impact", pre: 2, post: 1 },
  { topic: "Performance", pre: 4, post: 3 },
  { topic: "Traceability", pre: 3, post: 2 },
  { topic: "Lifecycle", pre: 3, post: 2 },
];

const gapInsights = [
  {
    title: "Design Intent vs. User Perception Gap",
    detail:
      "The organization reports relatively high maturity in Explainability, but end-user explainability perception is low.",
  },
  {
    title: "Lifecycle Drift",
    detail:
      "Several topics show lower post-deployment maturity than pre-deployment maturity, suggesting possible degradation after deployment.",
  },
  {
    title: "Consistent Weakness",
    detail:
      "Societal Impact shows low maturity across lifecycle phases and should be prioritized for improvement.",
  },
];

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Integrated Results Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Dual assessment integration: HuCAS × HCAI Maturity Model
            </p>
          </div>

          <Link href="/" className="text-slate-600 hover:underline">
            ← Back Home
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-blue-50 border border-blue-100 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              End-User Assessment: HuCAS
            </h2>

            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={hucasResults}>
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
          </section>

          <section className="bg-green-50 border border-green-100 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Organization Assessment: Lifecycle Maturity
            </h2>

            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maturityResults}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="pre" name="Pre-deployment" fill="#16a34a" />
                  <Bar dataKey="post" name="Post-deployment" fill="#86efac" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="mt-10 bg-slate-50 border border-slate-200 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Gap Diagnosis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gapInsights.map((insight) => (
              <div
                key={insight.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {insight.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {insight.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Research Interpretation
          </h2>

          <p className="text-slate-700 leading-relaxed">
            This dashboard illustrates how outside-in end-user perceptions can
            be compared with inside-out organizational maturity. High
            organizational maturity combined with low user perception indicates
            a potential translation gap between design intent and operational
            reality.
          </p>
        </section>
      </div>
    </main>
  );
}
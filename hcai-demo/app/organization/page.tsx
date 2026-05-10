"use client";

import { useState } from "react";
import Link from "next/link";

type Phase = "pre" | "post";

const levelLabels = [
  "Level 0: Absent",
  "Level 1: Initial / Ad hoc",
  "Level 2: Defined",
  "Level 3: Participatory",
  "Level 4: Measured",
  "Level 5: Continuous Evaluation",
];

const topics = [
  "Governance & Accountability",
  "Human-Centered Design Integration",
  "Fairness, Ethics & Diversity",
  "Security, Privacy & Safety",
  "Explainability & Transparency",
  "Human Oversight & Control",
  "Environmental Impact & Societal Well-Being",
  "Performance, Robustness & Reliability",
  "Responsibility, Traceability & Contestability",
  "Lifecycle Planning",
];

const levelDescriptions = [
  "The organization is not aware of these activities or does not perform them.",
  "Relevant activities are recognized or performed on an initial or ad-hoc basis.",
  "Internal practices are defined and applied for some AI systems.",
  "End users and impacted stakeholders are systematically involved for most AI systems.",
  "Approved metrics are applied with measured evidence.",
  "Captured results are systematically used for continuous improvement.",
];

const defaultWeights = Array(topics.length).fill(1);

function calculateWeightedScore(levels: number[], weights: number[]) {
  const validItems = levels
    .map((level, index) => ({
      level,
      weight: weights[index],
    }))
    .filter((item) => item.level >= 0);

  if (validItems.length === 0) return 0;

  const weightedSum = validItems.reduce(
    (sum, item) => sum + item.level * item.weight,
    0
  );

  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0);

  return weightedSum / totalWeight;
}

export default function OrganizationPage() {
  const [phase, setPhase] = useState<Phase>("pre");

  const [answers, setAnswers] = useState<Record<Phase, number[]>>({
    pre: Array(topics.length).fill(-1),
    post: Array(topics.length).fill(-1),
  });

  const [submitted, setSubmitted] = useState(false);

  const weights = defaultWeights;

  const selectLevel = (topicIndex: number, level: number) => {
    setAnswers((prev) => {
      const updated = [...prev[phase]];
      updated[topicIndex] = level;

      return {
        ...prev,
        [phase]: updated,
      };
    });

    setSubmitted(false);
  };

  const autoComplete = () => {
    setAnswers((prev) => ({
      ...prev,
      [phase]: topics.map(() => Math.floor(Math.random() * 6)),
    }));

    setSubmitted(false);
  };

  const submitAssessment = () => {
    const preScore = calculateWeightedScore(answers.pre, weights);
    const postScore = calculateWeightedScore(answers.post, weights);
    const overallScore = (preScore + postScore) / 2;

    setSubmitted(true);

    localStorage.setItem(
      "organizationResults",
      JSON.stringify({
        phase,
        pre: answers.pre,
        post: answers.post,
        weights,
        preScore,
        postScore,
        overallScore,
      })
    );
  };

  const currentAnswers = answers[phase];

  const preScore = calculateWeightedScore(answers.pre, weights);
  const postScore = calculateWeightedScore(answers.post, weights);
  const overallScore = (preScore + postScore) / 2;

  const currentCompletedCount = currentAnswers.filter((v) => v >= 0).length;
  const preCompletedCount = answers.pre.filter((v) => v >= 0).length;
  const postCompletedCount = answers.post.filter((v) => v >= 0).length;

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Organization Assessment
            </h1>

            <p className="text-slate-500 mt-2">
              HCAI Maturity Model: 10 Topics × 6 Levels × 2 Phases
            </p>
          </div>

          <Link href="/" className="text-green-600 hover:underline">
            ← Back Home
          </Link>
        </div>

        <section className="bg-green-50 border border-green-100 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Guided Instructions for Organization Users
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-green-100">
              <div className="font-bold text-green-700 mb-2">Step 1</div>
              <p className="text-slate-700">
                Assemble a cross-functional evaluation panel, including UX,
                engineering, compliance, operations, and domain experts.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-green-100">
              <div className="font-bold text-green-700 mb-2">Step 2</div>
              <p className="text-slate-700">
                Review evidence such as audit logs, red-teaming reports, user
                feedback, governance records, and monitoring data.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-green-100">
              <div className="font-bold text-green-700 mb-2">Step 3</div>
              <p className="text-slate-700">
                Select one consensus maturity level from 0 to 5 for each topic
                and lifecycle phase.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-green-100">
              <div className="font-bold text-green-700 mb-2">Step 4</div>
              <p className="text-slate-700">
                Apply topic weights based on the organization&apos;s risk
                profile. 
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-green-100">
              <div className="font-bold text-green-700 mb-2">Step 5</div>
              <p className="text-slate-700">
                Compute pre-deployment, post-deployment, and overall maturity
                scores.
              </p>
            </div>
          </div>
        </section>

       <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-10">
  <h2 className="text-3xl font-bold text-slate-800 mb-4">
    Maturity Score Formula
  </h2>

  <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
    <p>
      After the organization selects a consensus maturity level for each topic
      in both lifecycle phases, the system computes phase-specific maturity
      scores using a weighted linear additive model. The overall organizational
      maturity score is then calculated by averaging the pre-deployment and
      post-deployment scores.
    </p>

    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">
        Mathematical Formulation
      </h3>

      <div className="bg-slate-100 rounded-xl p-5 font-mono text-slate-900 text-base space-y-3">
        <div>
          lᵢ,ₚ = Consensus(lᵢ,ₚ,₁, lᵢ,ₚ,₂, ..., lᵢ,ₚ,ₙ)
        </div>

        <div>
          Mₚ = Σᵢ₌₁¹⁰(wᵢ × lᵢ,ₚ) / Σᵢ₌₁¹⁰wᵢ
        </div>

        <div>
          M_pre = Σᵢ₌₁¹⁰(wᵢ × lᵢ,pre) / Σᵢ₌₁¹⁰wᵢ
        </div>

        <div>
          M_post = Σᵢ₌₁¹⁰(wᵢ × lᵢ,post) / Σᵢ₌₁¹⁰wᵢ
        </div>

        <div>
          M_overall = (M_pre + M_post) / 2
        </div>
      </div>

     
    </div>

    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">
        Symbol Definitions
      </h3>

      <ul className="space-y-3 text-slate-700">
        <li>
          <strong>p</strong>: lifecycle phase, where p ∈ {"{pre, post}"}
        </li>

        <li>
          <strong>i</strong>: HCAI topic index, where i ∈ {"{1, ..., 10}"}
        </li>

        <li>
          <strong>j</strong>: expert index, where j ∈ {"{1, ..., N}"}
        </li>

        <li>
          <strong>N</strong>: total number of experts in the organizational
          evaluation panel
        </li>

        <li>
          <strong>lᵢ,ₚ,ⱼ</strong>: maturity level assigned by expert j for
          topic i in phase p
        </li>

        <li>
          <strong>lᵢ,ₚ</strong>: consensus maturity level for topic i in
          phase p
        </li>

        <li>
          <strong>wᵢ</strong>: weight assigned to topic i
        </li>

        <li>
          <strong>Mₚ</strong>: maturity score for phase p
        </li>

        <li>
          <strong>M_pre</strong>: pre-deployment maturity score
        </li>

        <li>
          <strong>M_post</strong>: post-deployment maturity score
        </li>

        <li>
          <strong>M_overall</strong>: overall organizational maturity score
        </li>
      </ul>
    </div>
  </div>
</section>

        <div className="flex gap-4 mb-10">
          <button
            onClick={() => {
              setPhase("pre");
              setSubmitted(false);
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              phase === "pre"
                ? "bg-green-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Pre-deployment
          </button>

          <button
            onClick={() => {
              setPhase("post");
              setSubmitted(false);
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              phase === "post"
                ? "bg-green-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Post-deployment
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 space-y-3">
  <p className="text-slate-700">
    Current phase:{" "}
    <strong>
      {phase === "pre" ? "Pre-deployment" : "Post-deployment"}
    </strong>
    . Completed topics in this phase:{" "}
    <strong>{currentCompletedCount}/10</strong>. Pre completed:{" "}
    <strong>{preCompletedCount}/10</strong>. Post completed:{" "}
    <strong>{postCompletedCount}/10</strong>.
  </p>

  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-slate-700 text-sm leading-relaxed">
    <strong>Demo simplification note:</strong> In a full organizational
    assessment, multiple experts (N-expert panel) would independently assess
    evidence and produce consensus maturity levels. To support dynamic
    interaction and real-time visualization, this demo simulates the input of
    a single expert only. This demo uses equal weights by default.
  </div>
</div>

        <div className="space-y-8">
          {topics.map((topic, topicIndex) => (
            <div
              key={topic}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
            >
              <div className="mb-5">
                <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                  Topic {topicIndex + 1}
                </span>

                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                  {topic}
                </h2>

                <p className="text-slate-600 mt-3">
                  Select the consensus maturity level for this topic in the{" "}
                  <strong>
                    {phase === "pre" ? "pre-deployment" : "post-deployment"}
                  </strong>{" "}
                  phase.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => selectLevel(topicIndex, level)}
                    className={`text-left rounded-2xl border p-5 transition-all ${
                      currentAnswers[topicIndex] === level
                        ? "bg-green-600 text-white border-green-600 shadow-lg scale-[1.02]"
                        : "bg-white border-slate-200 hover:bg-green-50"
                    }`}
                  >
                    <div
                      className={`text-2xl font-extrabold mb-3 ${
                        currentAnswers[topicIndex] === level
                          ? "text-white"
                          : "text-black"
                      }`}
                    >
                      {levelLabels[level]}
                    </div>

                    <p
                      className={`text-base leading-relaxed font-medium ${
                        currentAnswers[topicIndex] === level
                          ? "text-green-50"
                          : "text-slate-800"
                      }`}
                    >
                      {levelDescriptions[level]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-12">
          <button
            onClick={autoComplete}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl transition-all"
          >
            Auto Complete All Questions
          </button>

          <button
            onClick={submitAssessment}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all"
          >
            Submit Assessment
          </button>
        </div>

        {submitted && (
          <section className="mt-12 bg-green-50 border border-green-200 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Maturity Score Calculation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-green-100 rounded-2xl p-6">
                <div className="text-sm text-slate-500 mb-2">
                  Pre-deployment Score
                </div>
                <div className="text-4xl font-extrabold text-green-700">
                  {preScore.toFixed(2)}
                </div>
              </div>

              <div className="bg-white border border-green-100 rounded-2xl p-6">
                <div className="text-sm text-slate-500 mb-2">
                  Post-deployment Score
                </div>
                <div className="text-4xl font-extrabold text-green-700">
                  {postScore.toFixed(2)}
                </div>
              </div>

              <div className="bg-white border border-green-100 rounded-2xl p-6">
                <div className="text-sm text-slate-500 mb-2">
                  Overall Maturity Score
                </div>
                <div className="text-4xl font-extrabold text-green-700">
                  {overallScore.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-white border border-green-100 rounded-2xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Calculation Explanation
              </h3>

              <p className="text-slate-700 leading-relaxed">
                The current calculation uses equal weights for all 10 topics.
                The pre-deployment maturity score is the weighted average of all
                selected pre-deployment levels. The post-deployment maturity
                score is calculated in the same way. The overall organizational
                maturity score is the arithmetic mean of the pre-deployment and
                post-deployment scores.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm bg-white rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-green-100">
                    <th className="p-3 text-left text-black font-bold">
                      Topic
                    </th>
                    <th className="p-3 text-center text-black font-bold">
                      Weight
                    </th>
                    <th className="p-3 text-center text-black font-bold">
                      Pre Level
                    </th>
                    <th className="p-3 text-center text-black font-bold">
                      Post Level
                    </th>
                    <th className="p-3 text-center text-black font-bold">
                      Weighted Pre
                    </th>
                    <th className="p-3 text-center text-black font-bold">
                      Weighted Post
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topics.map((topic, index) => {
                    const preLevel = answers.pre[index];
                    const postLevel = answers.post[index];
                    const weight = weights[index];

                    return (
                      <tr key={topic} className="border-b border-green-100">
                        <td className="p-3 font-medium text-slate-800">
                          {topic}
                        </td>

                        <td className="p-3 text-center">{weight}</td>

                        <td className="p-3 text-center">
                          {preLevel >= 0 ? preLevel : "Not selected"}
                        </td>

                        <td className="p-3 text-center">
                          {postLevel >= 0 ? postLevel : "Not selected"}
                        </td>

                        <td className="p-3 text-center">
                          {preLevel >= 0
                            ? (preLevel * weight).toFixed(2)
                            : "-"}
                        </td>

                        <td className="p-3 text-center">
                          {postLevel >= 0
                            ? (postLevel * weight).toFixed(2)
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/results"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Diagnose the Impact Gap
              </Link>

              <Link
                href="/"
                className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all"
              >
                Back Home
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
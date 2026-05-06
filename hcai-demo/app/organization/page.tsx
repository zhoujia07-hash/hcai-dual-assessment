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
  "Level 5: Continuous Improvement",
];

const topics = [
  {
    id: 1,
    title: "Governance & Accountability",
    preDefinition:
      "My organization has well-established formal policies and practices that ensure the development process of the AI system is human-centered, prioritize human needs, values, and benefits, as well as effective means to hold people accountable who are involved in the development process.",
    postDefinition:
      "My organization has well-established, formal policies and practices to ensure that the deployed AI system is continuously monitored for compliance with human-centered practices, standards or regulations, and that monitoring feedback is used to guide product and process improvement and innovation.",
  },
  {
    id: 2,
    title: "Human-Centered Design Integration",
    preDefinition:
      "My organization has established a culture of human-centered AI and applies its methodology for the development of AI systems. End users and impacted stakeholders are involved in activities during the lifecycle of an AI system to achieve utility, usability, and trustworthiness.",
    postDefinition:
      "My organization monitors and assesses the utility, usability, and trustworthiness of deployed AI systems for end users and impacted stakeholders and uses the results to guide product and process improvement and innovation.",
  },
  {
    id: 3,
    title: "Fairness, Ethics & Diversity",
    preDefinition:
      "My organization develops AI systems in a way that ensures end users and affected stakeholders are treated fairly and ethically, accounts for a broad range of human diversity, and proactively identifies and mitigates potential bias and exclusion.",
    postDefinition:
      "My organization monitors the use of deployed AI systems to identify issues related to fairness, ethics, and diversity, addresses any issues appropriately, and uses the insights to guide product and process improvements and innovation.",
  },
  {
    id: 4,
    title: "Security, Privacy & Safety",
    preDefinition:
      "My organization develops AI systems in a way that ensures the security, privacy, and safety of the AI model, the data it uses, the AI system’s outputs and decisions, and the supporting infrastructure, in order to mitigate misuse and harmful effects.",
    postDefinition:
      "My organization monitors deployed AI systems to ensure the security, privacy, and safety of the AI model, the data it uses, the AI system’s outputs and decisions, and the supporting infrastructure, and uses the findings to guide product and process improvements and innovation.",
  },
  {
    id: 5,
    title: "Explainability & Transparency",
    preDefinition:
      "My organization develops AI systems in a way that provides end users and affected stakeholders with understandable reasons for the system’s outputs and ensures they understand how the model was developed, what data it uses, what decisions it can make, and how its components relate to one another.",
    postDefinition:
      "My organization assesses deployed AI systems for explainability and transparency, with the participation of end users and affected stakeholders, to guide product and process improvements and innovation.",
  },
  {
    id: 6,
    title: "Human Oversight & Control",
    preDefinition:
      "My organization develops AI systems with the participation of end users and affected stakeholders, ensuring they can understand system limitations, avoid overreliance, interpret and override outputs, and safely intervene when needed.",
    postDefinition:
      "My organization monitors deployed AI systems to evaluate the effectiveness of human oversight and control and uses user feedback to guide product and process improvements and innovation.",
  },
  {
    id: 7,
    title: "Environmental Impact & Societal Well-Being",
    preDefinition:
      "My organization embeds a systematic process for measuring and improving the environmental impact and societal well-being of its AI systems throughout the development lifecycle.",
    postDefinition:
      "My organization embeds a systematic process for monitoring the environmental impact and societal well-being of its deployed AI systems and uses the results to guide product and process improvements and innovation.",
  },
  {
    id: 8,
    title: "Performance, Robustness & Reliability",
    preDefinition:
      "My organization designs and develops AI systems to deliver high-quality outcomes that are assessed by end users and affected stakeholders, ensuring performance, robustness, and reliability that fits the intended purpose.",
    postDefinition:
      "My organization tracks and logs AI systems, makes performance visible to end users and affected stakeholders, and collects their feedback on output quality to guide improvement.",
  },
  {
    id: 9,
    title: "Responsibility, Traceability & Contestability",
    preDefinition:
      "My organization has well-established practices and technologies to ensure that AI decisions and outcomes can be systematically traced to their sources and attributed to responsible roles.",
    postDefinition:
      "My organization tracks model update lineage, data drift, system changes, decision-making process, and operational context so end users and affected stakeholders can challenge AI decisions.",
  },
  {
    id: 10,
    title: "Lifecycle Planning",
    preDefinition:
      "My organization has a well-established formal pre-deployment lifecycle plan, consisting of processes, practices, and metrics, to ensure that AI system quality and value for end users and affected stakeholders are realized.",
    postDefinition:
      "My organization has a well-established formal post-deployment lifecycle plan, consisting of processes, practices, and metrics, to ensure that AI system quality and value for end users and affected stakeholders do not degrade.",
  },
];

const levelDescriptions = [
  "My organization is not aware of these activities or does not perform these activities.",
  "My organization performs or recognizes relevant activities on an initial or ad-hoc basis.",
  "Level 1 applies and my organization has proactively defined internal practices for some AI systems.",
  "Level 2 applies and my organization systematically involves end users and impacted stakeholders for most AI systems.",
  "Level 3 applies and my organization has defined and approved metrics and applies them with measured evidence.",
  "Level 4 applies and my organization systematically uses captured results to continuously improve AI systems and organizational processes.",
];

export default function OrganizationPage() {
  const [phase, setPhase] = useState<Phase>("pre");

  const [answers, setAnswers] = useState<Record<Phase, number[]>>({
    pre: Array(topics.length).fill(-1),
    post: Array(topics.length).fill(-1),
  });

  const [submitted, setSubmitted] = useState(false);

  const selectLevel = (topicIndex: number, level: number) => {
    setAnswers((prev) => {
      const updated = [...prev[phase]];
      updated[topicIndex] = level;

      return {
        ...prev,
        [phase]: updated,
      };
    });
  };

  const autoComplete = () => {
    setAnswers((prev) => ({
      ...prev,
      [phase]: topics.map(() => Math.floor(Math.random() * 6)),
    }));
  };

  const submitAssessment = () => {
    setSubmitted(true);

  localStorage.setItem(
  "organizationResults",
  JSON.stringify({
    phase,
    pre: answers.pre,
    post: answers.post,
  })
  );
  };

  const currentAnswers = answers[phase];

  const completedCount = currentAnswers.filter((value) => value >= 0).length;

  const average =
    completedCount > 0
      ? currentAnswers
          .filter((value) => value >= 0)
          .reduce((sum, value) => sum + value, 0) / completedCount
      : 0;

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

        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-8">
          <p className="text-slate-700 leading-relaxed">
            Select a lifecycle phase, then choose one maturity level from Level
            0 to Level 5 for each topic.
          </p>
        </div>

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

        <div className="space-y-8">
          {topics.map((topic, topicIndex) => {
            const definition =
              phase === "pre" ? topic.preDefinition : topic.postDefinition;

            return (
              <div
                key={topic.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
              >
                <div className="mb-5">
                  <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                    Topic {topic.id}
                  </span>

                  <h2 className="text-2xl font-bold text-slate-800 mt-1">
                    {topic.title}
                  </h2>

                  <p className="text-slate-600 mt-3 leading-relaxed">
                    {definition}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => selectLevel(topicIndex, level)}
                      className={`text-left rounded-2xl border p-4 transition-all ${
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
      ? "text-white"
      : "text-slate-800"
  }`}
>
  {levelDescriptions[level]}
</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
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
          <div className="mt-12 bg-green-50 border border-green-200 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Maturity Summary
            </h2>

            <p className="text-slate-700 mb-4">
              Phase:{" "}
              <strong>
                {phase === "pre" ? "Pre-deployment" : "Post-deployment"}
              </strong>
            </p>

            <p className="text-slate-700 mb-4">
              Completed topics: <strong>{completedCount}/10</strong>
            </p>

            <p className="text-slate-700 mb-6">
              Average maturity level: <strong>{average.toFixed(2)}</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="bg-white border border-green-100 rounded-xl p-4"
                >
                  <div className="font-semibold text-slate-800">
                    Topic {topic.id}: {topic.title}
                  </div>

                  <div className="text-green-700 mt-1">
                    Selected Level:{" "}
                    {currentAnswers[index] >= 0
                      ? currentAnswers[index]
                      : "Not selected"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
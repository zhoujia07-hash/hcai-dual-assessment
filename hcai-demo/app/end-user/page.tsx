"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type FactorScore = {
  factor: string;
  score: number;
};

type Participant = {
  id: string;
  type: string;
  answers: number[];
  factors: FactorScore[];
};

const factors = [
  "Trust",
  "Transparency",
  "Explainability",
  "Human Control",
  "Adaptability",
  "Formal Fairness",
  "Substantive Fairness",
];

const questions = [
  "I trust the AI system to keep my data private and secure.",
  "I believe the AI system is honestly working to accomplish my goals and not pursuing any other agenda.",
  "I value the AI system’s recommendations, and I trust that together we are able to make the right decisions.",
  "I feel confident and safe that the AI system’s recommendations are aligned to the best interest of those potentially affected.",
  "I have easy access to sufficient information about how the AI system works, including the rules or logic it follows.",
  "I know the strengths and weaknesses of the AI system, including what it can and cannot do.",
  "It is clear and understandable to me what information the AI system uses and how it makes its suggestions or decisions.",
  "The strengths and weaknesses of the AI system, including when and why it might make mistakes, are clearly explained to me.",
  "The AI system provides clear explanations for its recommendations or actions, enabling me to assess whether its reasoning for each specific recommendation is valid.",
  "I can confidently interpret how the AI system has chosen each of its recommendations based on the explanations it provides.",
  "The AI system understands and adapts to the cultural context where its recommendations will be applied.",
  "I understand why the AI system gives certain suggestions or decisions.",
  "I am satisfied with my control of the AI system.",
  "I can easily intervene in the behavior of the AI system at any time by correcting, changing, or stopping what the AI system is currently doing.",
  "I have sufficient knowledge and access to information to provide feedback to the AI system, enabling me to adjust its behavior and maintain control.",
  "I am in control of the results when using the AI system.",
  "The AI system understands and adapts to individual and cultural backgrounds.",
  "The AI system understands and supports my needs and skills.",
  "The AI system understands and adapts to the cultural context where its recommendations will be applied.",
  "The AI system adjusts to my personal preferences, needs, or way of working.",
  "The AI gives everyone the same chances and choices when using the system.",
  "I have not noticed any unfair treatment or results from the AI system.",
  "The AI system treats all users equally.",
  "The AI system does not discriminate against any person or group.",
  "The AI system’s recommendations are fair and reasonable.",
  "The AI system not only listens to feedback about unfairness but also tries to improve.",
  "The AI adapts its criteria to match each person’s unique qualities and circumstances, ensuring recommendations reflect the true fit with the activity’s goals.",
  "The AI system considers the needs of people from different backgrounds, abilities, and situations.",
];

const factorQuestionMap = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  [16, 17, 18, 19],
  [20, 21, 22, 23],
  [24, 25, 26, 27],
];

function calculateFactors(answers: number[]) {
  return factors.map((factor, index) => {
    const questionIndexes = factorQuestionMap[index];
    const validScores = questionIndexes
      .map((questionIndex) => answers[questionIndex])
      .filter((score) => score > 0);

    const score =
      validScores.length > 0
        ? validScores.reduce((sum, value) => sum + value, 0) /
          validScores.length
        : 0;

    return {
      factor,
      score: Number(score.toFixed(2)),
    };
  });
}

function generateAnswers(type: string) {
  return questions.map(() => {
    if (type === "High-trust users") {
      return Math.floor(Math.random() * 2) + 6;
    }

    if (type === "Critical users") {
      return Math.floor(Math.random() * 3) + 1;
    }

    if (type === "Polarized users") {
      return Math.random() > 0.5
        ? Math.floor(Math.random() * 2) + 6
        : Math.floor(Math.random() * 2) + 1;
    }

    return Math.floor(Math.random() * 7) + 1;
  });
}

function calculateAggregatedFactors(participants: Participant[]) {
  return factors.map((factor) => {
    const values = participants.map(
      (participant) =>
        participant.factors.find((item) => item.factor === factor)?.score ?? 0
    );

    const mean =
      values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

    return {
      factor,
      score: Number(mean.toFixed(2)),
    };
  });
}

function getFactorStats(participants: Participant[], factor: string) {
  const values = participants.map(
    (participant) =>
      participant.factors.find((item) => item.factor === factor)?.score ?? 0
  );

  if (values.length === 0) {
    return {
      mean: 0,
      min: 0,
      max: 0,
      variance: 0,
    };
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    values.length;

  return {
    mean: Number(mean.toFixed(2)),
    min: Number(Math.min(...values).toFixed(2)),
    max: Number(Math.max(...values).toFixed(2)),
    variance: Number(variance.toFixed(2)),
  };
}

function getHeatmapStyle(score: number) {
  if (score >= 6) return "bg-blue-700 text-white";
  if (score >= 5) return "bg-blue-500 text-white";
  if (score >= 4) return "bg-blue-300 text-slate-900";
  if (score >= 3) return "bg-yellow-300 text-slate-900";
  if (score >= 2) return "bg-orange-300 text-slate-900";
  return "bg-red-400 text-white";
}

export default function EndUserPage() {
  const [answers, setAnswers] = useState<number[]>(
    Array(questions.length).fill(0)
  );
  const [results, setResults] = useState<FactorScore[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(5);
  const [simulationType, setSimulationType] = useState("Balanced users");

  const selectAnswer = (questionIndex: number, value: number) => {
    const updated = [...answers];
    updated[questionIndex] = value;
    setAnswers(updated);
  };

  const autoComplete = () => {
    setAnswers(questions.map(() => Math.floor(Math.random() * 7) + 1));
  };

  const submitSingleUser = () => {
    const factorScores = calculateFactors(answers);

    const singleParticipant = {
      id: "User 1",
      type: "Single end user input",
      answers,
      factors: factorScores,
    };

    setResults(factorScores);
    setParticipants([singleParticipant]);

    localStorage.setItem("hucasResults", JSON.stringify(factorScores));
    localStorage.setItem(
      "hucasParticipants",
      JSON.stringify([singleParticipant])
    );
  };

  const simulateParticipants = () => {
    const boundedCount = Math.min(Math.max(participantCount, 1), 50);

    const simulated = Array.from({ length: boundedCount }, (_, index) => {
      const simulatedAnswers = generateAnswers(simulationType);
      const factorScores = calculateFactors(simulatedAnswers);

      return {
        id: `User ${index + 1}`,
        type: simulationType,
        answers: simulatedAnswers,
        factors: factorScores,
      };
    });

    const aggregated = calculateAggregatedFactors(simulated);

    setParticipantCount(boundedCount);
    setParticipants(simulated);
    setResults(aggregated);

    localStorage.setItem("hucasParticipants", JSON.stringify(simulated));
    localStorage.setItem("hucasResults", JSON.stringify(aggregated));
  };

  const submitEndUserResults = () => {
    localStorage.setItem("hucasResults", JSON.stringify(results));
    localStorage.setItem("hucasParticipants", JSON.stringify(participants));
    alert("End-user results submitted successfully.");
  };

  const varianceData = factors.map((factor) => {
    const stats = getFactorStats(participants, factor);

    return {
      factor,
      variance: stats.variance,
    };
  });

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              End User Assessment
            </h1>

            <p className="text-slate-500 mt-2">
              HuCAS Assessment: 28 items × 7 human-centered AI factors
            </p>
          </div>

          <Link href="/" className="text-blue-600 hover:underline">
            ← Back Home
          </Link>
        </div>

        <section className="bg-blue-50 border border-blue-100 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Single End User Input
          </h2>

          <p className="text-slate-700 leading-relaxed">
            Complete the questionnaire as one end user. Each item is rated from
            1 to 7, where higher scores indicate more positive end-user
            perception. After submission, the system calculates seven HuCAS
            factor scores.
          </p>
        </section>

        <div className="space-y-6">
          {questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Question {questionIndex + 1}
              </h2>

              <p className="text-slate-700 mb-5">{question}</p>

              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    onClick={() => selectAnswer(questionIndex, value)}
                    className={`w-12 h-12 rounded-xl font-bold transition-all ${
                      answers[questionIndex] === value
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : "bg-white border border-slate-300 text-black hover:bg-blue-50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-10 mb-10">
          <button
            onClick={autoComplete}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl transition-all"
          >
            Auto Complete Current User
          </button>

          <button
            onClick={submitSingleUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
          >
            Submit Current End User Assessment
          </button>
        </div>

        <section className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Optional End User Simulation
          </h2>

          <p className="text-slate-700 mb-6">
            This optional section simulates multiple end users. The system keeps
            each participant&apos;s raw 28-item response matrix and HuCAS factor
            profile, while also generating an aggregated profile for the current
            results dashboard.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="bg-white border border-indigo-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Number of End Users
              </h3>

              <label className="block text-slate-700 mb-2">
                Enter participant size M
              </label>

              <input
                type="number"
                min={1}
                max={50}
                value={participantCount}
                onChange={(event) =>
                  setParticipantCount(
                    Math.min(Math.max(Number(event.target.value), 1), 50)
                  )
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-black"
              />

              <p className="text-sm text-slate-500 mt-3">
                Recommended demo range: 1-50 end users.
              </p>

              <button
                onClick={simulateParticipants}
                className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Simulate M End Users
              </button>
            </div>

            <div className="xl:col-span-2 bg-white border border-indigo-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Simulation Type
              </h3>

              <select
                value={simulationType}
                onChange={(event) => setSimulationType(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-lg text-black"
              >
                <option>Balanced users</option>
                <option>High-trust users</option>
                <option>Critical users</option>
                <option>Polarized users</option>
              </select>

              <div className="mt-5 text-slate-700 leading-relaxed">
                <p>
                  <strong>Balanced users:</strong> mixed responses across the
                  full 1-7 range.
                </p>
                <p>
                  <strong>High-trust users:</strong> generally positive
                  perceptions.
                </p>
                <p>
                  <strong>Critical users:</strong> generally lower perceptions.
                </p>
                <p>
                  <strong>Polarized users:</strong> simulated disagreement
                  between very positive and very negative responses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {results.length > 0 && (
          <section className="mt-10 bg-blue-50 border border-blue-200 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              HuCAS Results
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-blue-100 p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Aggregated HuCAS Radar
                </h3>

                <div className="h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={results}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="factor" />
                      <PolarRadiusAxis domain={[1, 7]} />
                      <Tooltip />
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

              <div className="bg-white rounded-2xl border border-blue-100 p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Factor Variance Bar Chart
                </h3>

                <p className="text-slate-600 mb-4">
                  Higher variance indicates stronger disagreement among end
                  users for that HuCAS factor.
                </p>

                <div className="h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={varianceData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="factor"
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={90}
                        tick={{ fill: "#111827", fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="variance" name="Variance" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white border border-blue-100 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                User × Factor Heatmap
              </h3>

              <p className="text-slate-600 mb-5">
                Each row represents one end user and each column represents one
                HuCAS factor. Darker blue indicates more positive perception,
                while orange/red indicates lower perception.
              </p>

              <div className="overflow-x-auto pb-2">
                <table className="min-w-[1200px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-3 text-left text-black font-bold min-w-[120px]">
                        User
                      </th>
                      <th className="p-3 text-left text-black font-bold min-w-[180px]">
                        Type
                      </th>
                      {factors.map((factor) => (
                        <th
                          key={factor}
                          className="p-3 text-center text-black font-bold min-w-[140px]"
                        >
                          {factor}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {participants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="border-b border-blue-100"
                      >
                        <td className="p-3 font-semibold text-slate-800">
                          {participant.id}
                        </td>

                        <td className="p-3 text-slate-700">
                          {participant.type}
                        </td>

                        {factors.map((factor) => {
                          const score =
                            participant.factors.find(
                              (item) => item.factor === factor
                            )?.score ?? 0;

                          return (
                            <td key={factor} className="p-2 text-center">
                              <div
                                className={`rounded-xl px-3 py-3 font-bold ${getHeatmapStyle(
                                  score
                                )}`}
                              >
                                {score.toFixed(2)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 bg-white border border-blue-100 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Descriptive Summary
              </h3>

              <div className="overflow-x-auto pb-2">
                <table className="min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-3 text-left text-black font-bold">
                        Factor
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Mean
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Min
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Max
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Variance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {factors.map((factor) => {
                      const stats = getFactorStats(participants, factor);

                      return (
                        <tr key={factor} className="border-b border-blue-100">
                          <td className="p-3 font-semibold text-slate-800">
                            {factor}
                          </td>
                          <td className="p-3 text-center text-black font-semibold">
                            {stats.mean.toFixed(2)}
                          </td>
                          <td className="p-3 text-center text-black font-semibold">
                            {stats.min.toFixed(2)}
                          </td>
                          <td className="p-3 text-center text-black font-semibold">
                            {stats.max.toFixed(2)}
                          </td>
                          <td className="p-3 text-center text-black font-semibold">
                            {stats.variance.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={submitEndUserResults}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Submit End User Results
              </button>

              <Link
                href="/"
                className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all inline-block"
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
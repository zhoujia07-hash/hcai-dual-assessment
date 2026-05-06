"use client";

import { useEffect, useState } from "react";
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
  Legend,
  CartesianGrid,
} from "recharts";

const topicNames = [
  "Governance",
  "HCD Integration",
  "Fairness",
  "Security",
  "Explainability",
  "Human Control",
  "Societal Impact",
  "Performance",
  "Traceability",
  "Lifecycle",
];

function getGapStyle(value: number) {
  if (value >= 0.35) return "bg-red-500 text-white";
  if (value >= 0.18) return "bg-yellow-300 text-slate-900";
  return "bg-green-300 text-slate-900";
}

function getGapLabel(value: number) {
  if (value >= 0.35) return "High";
  if (value >= 0.18) return "Medium";
  return "Low";
}

export default function ResultsPage() {
  const [hucasResults, setHucasResults] = useState<any[]>([]);
  const [maturityResults, setMaturityResults] = useState<any[]>([]);
  const [gapInsights, setGapInsights] = useState<any[]>([]);

  useEffect(() => {
    const savedHucas = localStorage.getItem("hucasResults");
    const savedOrg = localStorage.getItem("organizationResults");

    if (!savedHucas || !savedOrg) return;

    const parsedHucas = JSON.parse(savedHucas);
    const parsedOrg = JSON.parse(savedOrg);

    setHucasResults(parsedHucas);

    const maturityData = topicNames.map((topic, index) => ({
      topic,
      pre: parsedOrg.pre[index] ?? 0,
      post: parsedOrg.post[index] ?? 0,
    }));

    setMaturityResults(maturityData);

    const insights: { title: string; detail: string }[] = [];

    const getFactor = (factor: string) =>
      parsedHucas.find((item: any) => item.factor === factor)?.score ?? 0;

    const getOrgAvg = (index: number) =>
      (maturityData[index].pre + maturityData[index].post) / 2;

    const explainabilityScore = getFactor("Explainability");
    const humanControlScore = getFactor("Human Control");
    const formalFairnessScore = getFactor("Formal Fairness");
    const substantiveFairnessScore = getFactor("Substantive Fairness");
    const trustScore = getFactor("Trust");
    const transparencyScore = getFactor("Transparency");

    const fairnessOrg = getOrgAvg(2);
    const explainabilityOrg = getOrgAvg(4);
    const humanControlOrg = getOrgAvg(5);
    const governanceOrg = getOrgAvg(0);

    const translationGapTexts: string[] = [];

    if (humanControlOrg <= 2.5 && humanControlScore >= 5) {
      translationGapTexts.push(
        "The organization reports relatively low Human Oversight & Control maturity, but end users report high perceived Human Control."
      );
    }

    if (
      fairnessOrg >= 4 &&
      (formalFairnessScore <= 4 || substantiveFairnessScore <= 4)
    ) {
      translationGapTexts.push(
        "The organization reports relatively high Fairness, Ethics & Diversity maturity, but end users report low Formal Fairness and/or low Substantive Fairness."
      );
    }

    if (explainabilityOrg >= 4 && explainabilityScore <= 4) {
      translationGapTexts.push(
        "The organization reports relatively high Explainability & Transparency maturity, but end users report low perceived Explainability."
      );
    }

    if (governanceOrg >= 4 && trustScore <= 4) {
      translationGapTexts.push(
        "The organization reports relatively high Governance & Accountability maturity, but end users report low Trust."
      );
    }

    if (translationGapTexts.length > 0) {
      insights.push({
        title: "Design Intent vs. User Perception Gap",
        detail: translationGapTexts.join(" "),
      });
    } else {
      insights.push({
        title: "Capability-Experience Alignment",
        detail:
          "No strong design-intent versus user-perception gap was detected under the current rule thresholds. Organizational maturity and end-user perception appear broadly aligned.",
      });
    }

    const lifecycleDrops = maturityData.filter((item) => item.post < item.pre);

    if (lifecycleDrops.length > 0) {
      const droppedTopics = lifecycleDrops
        .map((item) => `${item.topic} (${item.pre} -> ${item.post})`)
        .join(", ");

      insights.push({
        title: "Lifecycle Drift",
        detail: `Post-deployment maturity is lower than pre-deployment maturity in: ${droppedTopics}. This suggests possible degradation after deployment.`,
      });
    }

    const lowAreas = maturityData.filter(
      (item) => (item.pre + item.post) / 2 <= 2
    );

    if (lowAreas.length > 0) {
      const weakTopics = lowAreas.map((item) => item.topic).join(", ");

      insights.push({
        title: "Consistent Weakness",
        detail: `The following organizational capability areas remain relatively weak across lifecycle phases: ${weakTopics}.`,
      });
    }

    if (trustScore >= 5.5 && explainabilityOrg <= 2) {
      insights.push({
        title: "Potential Over-Reliance Risk",
        detail:
          "End users report relatively high Trust despite limited organizational Explainability & Transparency maturity. This may indicate over-reliance or insufficient awareness of system limitations.",
      });
    }

    if (transparencyScore <= 4 && explainabilityOrg >= 3.5) {
      insights.push({
        title: "Transparency Translation Gap",
        detail:
          "The organization reports moderate to high Explainability & Transparency maturity, but end users report low Transparency. User-facing communication may not be sufficiently clear or actionable.",
      });
    }

    setGapInsights(insights);
  }, []);

  const computeGap = (orgValue: number, userValue: number) => {
    const normalizedOrg = orgValue / 5;
    const normalizedUser = userValue / 7;
    return Math.abs(normalizedOrg - normalizedUser);
  };

  const strongestMaturity = [...maturityResults].sort(
    (a, b) => (b.pre + b.post) / 2 - (a.pre + a.post) / 2
  )[0];

  const weakestMaturity = [...maturityResults].sort(
    (a, b) => (a.pre + a.post) / 2 - (b.pre + b.post) / 2
  )[0];

  const strongestUserFactor = [...hucasResults].sort(
    (a, b) => b.score - a.score
  )[0];

  const weakestUserFactor = [...hucasResults].sort(
    (a, b) => a.score - b.score
  )[0];

  if (hucasResults.length === 0 || maturityResults.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-10">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-6">
            Results Dashboard
          </h1>

          <p className="text-slate-600 leading-relaxed mb-8">
            Please complete both the End User Assessment and the Organization
            Assessment before generating integrated diagnostic results.
          </p>

          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl inline-block"
          >
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Integrated Results Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Real-time integration of HuCAS and organizational maturity
              assessment
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

            <div className="h-[460px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={maturityResults}
                  margin={{ top: 20, right: 30, left: 10, bottom: 90 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="topic"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={90}
                    tick={{ fill: "#111827", fontSize: 12 }}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{
                      color: "#000000",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                    }}
                    labelStyle={{
                      color: "#000000",
                      fontWeight: "bold",
                    }}
                    itemStyle={{ color: "#000000" }}
                  />
                  <Legend />
                  <Bar dataKey="pre" name="Pre-deployment" fill="#16a34a" />
                  <Bar dataKey="post" name="Post-deployment" fill="#86efac" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="mt-10 bg-slate-50 border border-slate-200 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Dynamic Gap Diagnosis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gapInsights.map((insight, index) => (
              <div
                key={index}
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Gap Heatmap
              </h2>

              <p className="text-slate-500 mt-2">
                Real-time 10 × 7 impact gap matrix
              </p>
            </div>

            <div className="flex gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-green-300">
                Low Gap
              </span>

              <span className="px-3 py-1 rounded-full bg-yellow-300">
                Medium Gap
              </span>

              <span className="px-3 py-1 rounded-full bg-red-500 text-white">
                High Gap
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white text-left p-3 border-b border-slate-200 min-w-[180px] text-black font-bold">
                    Organization Topic
                  </th>

                  {hucasResults.map((factor) => (
                    <th
                      key={factor.factor}
                      className="p-3 border-b border-slate-200 text-center min-w-[140px] text-black font-bold"
                    >
                      {factor.factor}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {maturityResults.map((topicRow, topicIndex) => (
                  <tr key={topicIndex} className="border-b border-slate-100">
                    <td className="sticky left-0 bg-white p-3 font-semibold text-slate-800">
                      {topicRow.topic}
                    </td>

                    {hucasResults.map((factorRow, factorIndex) => {
                      const orgValue = (topicRow.pre + topicRow.post) / 2;
                      const userValue = factorRow.score;
                      const gap = computeGap(orgValue, userValue);
                      const label = getGapLabel(gap);

                      return (
                        <td key={factorIndex} className="p-2 text-center">
                          <div
                            title={`${topicRow.topic} x ${
                              factorRow.factor
                            }: ${label} gap (${gap.toFixed(2)})`}
                            className={`rounded-xl px-3 py-4 font-bold ${getGapStyle(
                              gap
                            )}`}
                          >
                            {label}

                            <div className="text-xs mt-1">
                              {gap.toFixed(2)}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 bg-indigo-50 border border-indigo-200 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Research Insight Summary
          </h2>

          <div className="space-y-5 text-slate-700 leading-relaxed text-lg">
            <p>
              The integrated assessment reveals how organizational
              Human-Centered AI maturity aligns, or fails to align, with
              end-user perceptions across critical socio-technical dimensions.
            </p>

            <p>
              The strongest organizational maturity was observed in:
              <span className="font-bold text-slate-900">
                {" "}
                {strongestMaturity?.topic}
              </span>
              .
            </p>

            <p>
              The lowest organizational maturity was observed in:
              <span className="font-bold text-slate-900">
                {" "}
                {weakestMaturity?.topic}
              </span>
              .
            </p>

            <p>
              End users reported the strongest perception in:
              <span className="font-bold text-slate-900">
                {" "}
                {strongestUserFactor?.factor}
              </span>
              .
            </p>

            <p>
              End users reported the weakest perception in:
              <span className="font-bold text-slate-900">
                {" "}
                {weakestUserFactor?.factor}
              </span>
              .
            </p>

            <p>
              Overall findings suggest that important translation gaps may exist
              between organizational governance mechanisms and real-world user
              experience, particularly in areas where organizational maturity
              remains high but user perception remains comparatively low.
            </p>

            <p>
              These findings demonstrate the importance of combining outside-in
              user assessment with inside-out organizational maturity evaluation
              when assessing Human-Centered AI systems.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
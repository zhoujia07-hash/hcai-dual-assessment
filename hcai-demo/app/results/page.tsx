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
  Tooltip,
  Legend,
} from "recharts";

const topicNames = [
  "Governance",
  "HCD Integration",
  "Fairness, Ethics & Diversity",
  "Security",
  "Transparency & Explainability",
  "Human Oversight & Control",
  "Societal Impact",
  "Performance",
  "Traceability",
  "Lifecycle",
];

function normalizeUser(score: number) {
  return (score - 1) / 6;
}

function normalizeOrg(level: number) {
  return level / 5;
}

function isCriticalConflict(orgLevel: number, userScore: number) {
  const org = normalizeOrg(orgLevel);
  const user = normalizeUser(userScore);

  return (
    (org >= 0.67 && user <= 0.33) ||
    (org <= 0.33 && user >= 0.67)
  );
}

function computeGap(orgLevel: number, userScore: number) {
  const org = normalizeOrg(orgLevel);
  const user = normalizeUser(userScore);

  if (isCriticalConflict(orgLevel, userScore)) {
    return 1.0;
  }

  return Math.abs(org - user);
}

function getGapStyle(value: number) {
  if (value >= 0.67) return "bg-red-500 text-white";
  if (value >= 0.34) return "bg-yellow-300 text-slate-900";
  return "bg-green-300 text-slate-900";
}

function getGapLabel(value: number) {
  if (value >= 0.67) return "High";
  if (value >= 0.34) return "Medium";
  return "Low";
}

function WrappedPolarTick(props: any) {
  const { x, y, payload, textAnchor } = props;
  const label = payload.value;

  const lines =
    label === "Substantive Fairness"
      ? ["Substantive", "Fairness"]
      : label === "Formal Fairness"
      ? ["Formal", "Fairness"]
      : label === "Human Control"
      ? ["Human", "Control"]
      : label === "Transparency & Explainability"
      ? ["Transparency &", "Explainability"]
      : label === "Human Oversight & Control"
      ? ["Human Oversight", "& Control"]
      : label === "Fairness, Ethics & Diversity"
      ? ["Fairness, Ethics", "& Diversity"]
      : label.split(" ");

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#111827"
      fontSize={12}
      fontWeight={700}
    >
      {lines.map((line: string, index: number) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export default function ResultsPage() {
  const [hucasResults, setHucasResults] = useState<any[]>([]);
  const [maturityResults, setMaturityResults] = useState<any[]>([]);
  const [gapInsights, setGapInsights] = useState<any[]>([]);
  const [criticalConflicts, setCriticalConflicts] = useState<any[]>([]);

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

    const getFactor = (factor: string) =>
      parsedHucas.find((item: any) => item.factor === factor)?.score ?? 0;

    const getOrgAvg = (index: number) =>
      (maturityData[index].pre + maturityData[index].post) / 2;

    const insights: { title: string; detail: string }[] = [];
    const conflicts: {
      topic: string;
      factor: string;
      orgLevel: number;
      userScore: number;
      direction: string;
    }[] = [];

    maturityData.forEach((topicRow) => {
      const orgLevel = (topicRow.pre + topicRow.post) / 2;

      parsedHucas.forEach((factorRow: any) => {
        const userScore = factorRow.score;

        if (isCriticalConflict(orgLevel, userScore)) {
          const direction =
            normalizeOrg(orgLevel) >= 0.67
              ? "High organizational maturity but low end-user perception"
              : "Low organizational maturity but high end-user perception";

          conflicts.push({
            topic: topicRow.topic,
            factor: factorRow.factor,
            orgLevel,
            userScore,
            direction,
          });
        }
      });
    });

    setCriticalConflicts(conflicts);

    if (conflicts.length > 0) {
      const topConflicts = conflicts
        .slice(0, 5)
        .map((item) => `${item.topic} vs. ${item.factor} (${item.direction})`)
        .join("; ");

      insights.push({
        title: "Critical Perspective Conflict",
        detail: `The assessment detected opposite evaluations between organizational maturity and end-user perception. These conflicts require high organizational attention: ${topConflicts}.`,
      });
    }

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
      (formalFairnessScore <= 3 || substantiveFairnessScore <= 3)
    ) {
      translationGapTexts.push(
        "The organization reports relatively high Fairness, Ethics & Diversity maturity, but end users report low Formal Fairness and/or low Substantive Fairness."
      );
    }

    if (explainabilityOrg >= 4 && explainabilityScore <= 3) {
      translationGapTexts.push(
        "The organization reports relatively high Transparency & Explainability maturity, but end users report low perceived Explainability."
      );
    }

    if (governanceOrg >= 4 && trustScore <= 3) {
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
          "No strong design-intent versus user-perception gap was detected under the current thresholds. Organizational maturity and end-user perception appear broadly aligned.",
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
      (item) => (item.pre + item.post) / 2 <= 1.5
    );

    if (lowAreas.length > 0) {
      const weakTopics = lowAreas.map((item) => item.topic).join(", ");

      insights.push({
        title: "Consistent Weakness",
        detail: `The following organizational capability areas remain relatively weak across lifecycle phases: ${weakTopics}.`,
      });
    }

    if (trustScore >= 5.5 && explainabilityOrg <= 1.5) {
      insights.push({
        title: "Potential Over-Reliance Risk",
        detail:
          "End users report relatively high Trust despite limited organizational Transparency & Explainability maturity. This may indicate over-reliance or insufficient awareness of system limitations.",
      });
    }

    if (transparencyScore <= 3 && explainabilityOrg >= 3.5) {
      insights.push({
        title: "Transparency Translation Gap",
        detail:
          "The organization reports moderate to high Transparency & Explainability maturity, but end users report low Transparency. User-facing communication may not be sufficiently clear or actionable.",
      });
    }

    setGapInsights(insights);
  }, []);

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
          <section className="bg-green-50 border border-green-100 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Organization Assessment: Pre vs. Post Maturity
            </h2>

            <div className="h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={maturityResults}
                  margin={{ top: 45, right: 70, bottom: 45, left: 70 }}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="topic" tick={<WrappedPolarTick />} />
                  <PolarRadiusAxis domain={[0, 5]} />

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

                  <Radar
                    name="Pre-deployment"
                    dataKey="pre"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.25}
                  />

                  <Radar
                    name="Post-deployment"
                    dataKey="post"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-100 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              End-User Assessment: HuCAS
            </h2>

            <div className="h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={hucasResults}
                  margin={{ top: 55, right: 90, bottom: 55, left: 90 }}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="factor" tick={<WrappedPolarTick />} />
                  <PolarRadiusAxis domain={[1, 7]} />
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
                Conflict-aware 10 × 7 impact gap matrix using normalized
                organization scores and end-user scores.
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
                High
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-slate-700 leading-relaxed">
            <p>
              <strong>Low Gap:</strong> Organizational maturity and end-user
              perception are relatively aligned after normalization.
            </p>
            <p className="mt-2">
              <strong>Medium Gap:</strong> The two perspectives show a moderate
              difference and may require further interpretation.
            </p>
            <p className="mt-2">
              <strong>High Gap:</strong> The two perspectives are strongly
              misaligned. This includes critical conflicts where one side is
              high while the other side is low.
            </p>
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
                      const conflict = isCriticalConflict(orgValue, userValue);

                      return (
                        <td key={factorIndex} className="p-2 text-center">
                          <div
                            title={`${topicRow.topic} x ${
                              factorRow.factor
                            }: ${label} gap (${gap.toFixed(2)})${
                              conflict ? " - Critical Perspective Conflict" : ""
                            }`}
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

            {criticalConflicts.length > 0 && (
              <p className="font-semibold text-red-700">
                Critical perspective conflicts were detected. These indicate
                cases where organizational maturity and end-user perception
                point in opposite directions, requiring high organizational
                attention.
              </p>
            )}

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
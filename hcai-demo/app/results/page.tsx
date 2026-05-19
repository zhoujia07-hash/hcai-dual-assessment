"use client";

import { useEffect, useMemo, useState } from "react";
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

type EndUserParticipant = {
  id: string;
  type: string;
  answers: number[];
  factors: FactorScore[];
};

type Expert = {
  id: string;
  role: string;
  pre: number[];
  post: number[];
};

type OrganizationResults = {
  pre: number[];
  post: number[];
  weights?: number[];
  experts?: Expert[];
  expertCount?: number;
  mode?: string;
  preScore?: number;
  postScore?: number;
  overallScore?: number;
};

const maturityTopics = [
  "Governance",
  "HCD Integration",
  "Fairness, Ethics & Diversity",
  "Security, Privacy & Safety",
  "Transparency & Explainability",
  "Human Oversight & Control",
  "Societal Impact",
  "Performance & Reliability",
  "Responsibility & Traceability",
  "Lifecycle Planning",
];

const hucasFactors = [
  "Trust",
  "Transparency",
  "Explainability",
  "Human Control",
  "Adaptability",
  "Formal Fairness",
  "Substantive Fairness",
];

const alignmentMappings = [
  {
    topicIndex: 4,
    topic: "Transparency & Explainability",
    factor: "Transparency",
  },
  {
    topicIndex: 4,
    topic: "Transparency & Explainability",
    factor: "Explainability",
  },
  {
    topicIndex: 5,
    topic: "Human Oversight & Control",
    factor: "Human Control",
  },
  {
    topicIndex: 2,
    topic: "Fairness, Ethics & Diversity",
    factor: "Formal Fairness",
  },
  {
    topicIndex: 2,
    topic: "Fairness, Ethics & Diversity",
    factor: "Substantive Fairness",
  },
  {
    topicIndex: 0,
    topic: "Governance",
    factor: "Trust",
  },
  {
    topicIndex: 1,
    topic: "HCD Integration",
    factor: "Adaptability",
  },
];

function normalizeOrg(level: number) {
  return Math.max(0, Math.min(1, level / 5));
}

function normalizeUser(score: number) {
  return Math.max(0, Math.min(1, (score - 1) / 6));
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: number[]) {
  if (values.length === 0) return 0;
  const avg = mean(values);
  return mean(values.map((value) => Math.pow(value - avg, 2)));
}

function getFactorScore(results: FactorScore[], factor: string) {
  return results.find((item) => item.factor === factor)?.score ?? 0;
}

function calculateWeightedScore(levels: number[], weights: number[]) {
  const valid = levels
    .map((level, index) => ({
      level,
      weight: weights[index] ?? 1,
    }))
    .filter((item) => item.level >= 0);

  if (valid.length === 0) return 0;

  const weightedSum = valid.reduce(
    (sum, item) => sum + item.level * item.weight,
    0
  );

  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);

  return weightedSum / totalWeight;
}

function getDriftLabel(delta: number) {
  if (delta <= -1.5) return "Severe decline";
  if (delta < -0.5) return "Moderate decline";
  if (delta <= 0.5) return "Stable";
  if (delta <= 1.5) return "Moderate improvement";
  return "Strong improvement";
}

function getDriftStyle(delta: number) {
  if (delta <= -1.5) return "bg-red-500 text-white";
  if (delta < -0.5) return "bg-orange-300 text-slate-900";
  if (delta <= 0.5) return "bg-slate-200 text-slate-900";
  if (delta <= 1.5) return "bg-green-300 text-slate-900";
  return "bg-green-600 text-white";
}

function classifyAlignment(orgPost: number, userScore: number) {
  const org = normalizeOrg(orgPost);
  const user = normalizeUser(userScore);
  const gap = Math.abs(org - user);

  if (org >= 0.67 && user <= 0.33) {
    return {
      label: "Critical mismatch",
      detail: "High post-deployment maturity but low user perception",
      gap,
      style: "bg-red-500 text-white",
    };
  }

  if (org <= 0.33 && user >= 0.67) {
    return {
      label: "Under-recognized experience",
      detail: "Low post-deployment maturity but high user perception",
      gap,
      style: "bg-purple-500 text-white",
    };
  }

  if (gap < 0.25) {
    return {
      label: "Aligned",
      detail: "Organizational maturity and user perception are similar",
      gap,
      style: "bg-green-300 text-slate-900",
    };
  }

  if (org > user) {
    return {
      label: "Organizational overestimation",
      detail: "Internal maturity is higher than user perception",
      gap,
      style: "bg-yellow-300 text-slate-900",
    };
  }

  return {
    label: "User-perceived strength",
    detail: "User perception is higher than internal maturity",
    gap,
    style: "bg-blue-300 text-slate-900",
  };
}

function getParticipantFactorValues(
  participants: EndUserParticipant[],
  factor: string
) {
  return participants
    .map((participant) => {
      const found = participant.factors.find((item) => item.factor === factor);
      return found?.score ?? 0;
    })
    .filter((value) => value > 0);
}

function getExpertTopicValues(experts: Expert[], topicIndex: number) {
  return experts.map((expert) => {
    const pre = expert.pre[topicIndex] ?? 0;
    const post = expert.post[topicIndex] ?? 0;
    return (pre + post) / 2;
  });
}

function WrappedTick(props: any) {
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
      : label === "Fairness, Ethics & Diversity"
      ? ["Fairness, Ethics", "& Diversity"]
      : label === "Human Oversight & Control"
      ? ["Human Oversight", "& Control"]
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
  const [hucasResults, setHucasResults] = useState<FactorScore[]>([]);
  const [hucasParticipants, setHucasParticipants] = useState<
    EndUserParticipant[]
  >([]);
  const [organizationResults, setOrganizationResults] =
    useState<OrganizationResults | null>(null);
  const [organizationExperts, setOrganizationExperts] = useState<Expert[]>([]);

  useEffect(() => {
    const savedHucasResults = localStorage.getItem("hucasResults");
    const savedHucasParticipants = localStorage.getItem("hucasParticipants");
    const savedOrganizationResults = localStorage.getItem("organizationResults");
    const savedOrganizationExperts = localStorage.getItem("organizationExperts");

    if (savedHucasResults) {
      setHucasResults(JSON.parse(savedHucasResults));
    }

    if (savedHucasParticipants) {
      setHucasParticipants(JSON.parse(savedHucasParticipants));
    }

    if (savedOrganizationResults) {
      setOrganizationResults(JSON.parse(savedOrganizationResults));
    }

    if (savedOrganizationExperts) {
      setOrganizationExperts(JSON.parse(savedOrganizationExperts));
    }
  }, []);

  const weights = organizationResults?.weights ?? Array(10).fill(1);
  const orgPre = organizationResults?.pre ?? [];
  const orgPost = organizationResults?.post ?? [];

  const maturityRadarData = useMemo(() => {
    return maturityTopics.map((topic, index) => ({
      topic,
      pre: orgPre[index] ?? 0,
      post: orgPost[index] ?? 0,
    }));
  }, [orgPre, orgPost]);

  const driftData = useMemo(() => {
    return maturityTopics.map((topic, index) => {
      const pre = orgPre[index] ?? 0;
      const post = orgPost[index] ?? 0;
      const delta = post - pre;

      return {
        topic,
        pre,
        post,
        delta,
        label: getDriftLabel(delta),
      };
    });
  }, [orgPre, orgPost]);

  const alignmentData = useMemo(() => {
    return alignmentMappings.map((mapping) => {
      const orgPostValue = orgPost[mapping.topicIndex] ?? 0;
      const userValue = getFactorScore(hucasResults, mapping.factor);
      const classification = classifyAlignment(orgPostValue, userValue);

      return {
        ...mapping,
        orgPost: orgPostValue,
        userScore: userValue,
        ...classification,
      };
    });
  }, [orgPost, hucasResults]);

  const userVarianceData = useMemo(() => {
    return hucasFactors.map((factor) => {
      const values = getParticipantFactorValues(hucasParticipants, factor);

      return {
        factor,
        variance: Number(variance(values).toFixed(2)),
        mean: Number(mean(values).toFixed(2)),
      };
    });
  }, [hucasParticipants]);

  const expertDisagreementData = useMemo(() => {
    return maturityTopics.map((topic, index) => {
      const values = getExpertTopicValues(organizationExperts, index);

      return {
        topic,
        variance: Number(variance(values).toFixed(2)),
      };
    });
  }, [organizationExperts]);

  const preScore =
    organizationResults?.preScore ?? calculateWeightedScore(orgPre, weights);

  const postScore =
    organizationResults?.postScore ?? calculateWeightedScore(orgPost, weights);

  const overallScore =
    organizationResults?.overallScore ?? (preScore + postScore) / 2;

  const averageUserScore =
    hucasResults.length > 0
      ? mean(hucasResults.map((item) => item.score))
      : 0;

  const severeDrifts = driftData.filter((item) => item.delta <= -1);

  const strongestDriftDecline = [...driftData].sort(
    (a, b) => a.delta - b.delta
  )[0];

  const biggestAlignmentGap = [...alignmentData].sort(
    (a, b) => b.gap - a.gap
  )[0];

  const highestUserVariance = [...userVarianceData].sort(
    (a, b) => b.variance - a.variance
  )[0];

  const highestExpertDisagreement = [...expertDisagreementData].sort(
    (a, b) => b.variance - a.variance
  )[0];

  const diagnosisNarratives = useMemo(() => {
    const narratives: string[] = [];

    if (severeDrifts.length > 0) {
      narratives.push(
        `Internal lifecycle drift was detected in ${severeDrifts
          .map((item) => item.topic)
          .join(
            ", "
          )}. This suggests that some design-time HCAI intentions may not have translated into post-deployment operational practices.`
      );
    } else {
      narratives.push(
        "No severe negative lifecycle drift was detected. The organization appears to maintain relatively stable HCAI maturity from pre-deployment to post-deployment."
      );
    }

    alignmentData.forEach((item) => {
      if (item.label === "Critical mismatch") {
        narratives.push(
          `A critical mismatch appears between post-deployment ${item.topic} maturity and end-user ${item.factor}. The organization reports relatively high operational maturity, but users report low perception. This may indicate that internal governance capability is not experientially visible to users.`
        );
      }

      if (item.label === "Organizational overestimation") {
        narratives.push(
          `The organization may be overestimating the user-facing impact of ${item.topic}. Although post-deployment maturity is stronger than the corresponding HuCAS factor ${item.factor}, users do not experience this capability at the same level.`
        );
      }

      if (
        item.topic === "Fairness, Ethics & Diversity" &&
        item.userScore <= 3.5 &&
        item.orgPost >= 3.5
      ) {
        narratives.push(
          "The fairness-related gap suggests that formal fairness mechanisms may exist internally but may not translate into perceived fairness. Users may still experience unfairness if explanations, adaptability, or contextual sensitivity are insufficient."
        );
      }

      if (
        item.topic === "Transparency & Explainability" &&
        item.userScore <= 3.5 &&
        item.orgPost >= 3.5
      ) {
        narratives.push(
          "The transparency/explainability gap suggests that technical documentation or internal explainability practices may not be communicated in a way that users can understand and use during real interaction."
        );
      }
    });

    if (highestUserVariance && highestUserVariance.variance >= 2) {
      narratives.push(
        `High user variance was detected in ${highestUserVariance.factor}. This suggests that end users may not share a consistent experience of this HCAI factor, indicating possible user-group polarization or uneven system performance across contexts.`
      );
    }

    if (highestExpertDisagreement && highestExpertDisagreement.variance >= 1.5) {
      narratives.push(
        `High expert disagreement was detected in ${highestExpertDisagreement.topic}. This may indicate that organizational stakeholders do not share a common view of maturity in this topic, and a facilitated consensus discussion may be needed.`
      );
    }

    return Array.from(new Set(narratives));
  }, [
    severeDrifts,
    alignmentData,
    highestUserVariance,
    highestExpertDisagreement,
  ]);

  if (!organizationResults || hucasResults.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-10">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-6">
            Integrated Results Dashboard
          </h1>

          <p className="text-slate-600 leading-relaxed mb-8">
            Please submit both Organization User Results and End User Results
            before diagnosing the impact gap.
          </p>

          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl inline-block"
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
              Integrated HCAI Results Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Three-layer diagnostic logic: lifecycle drift, external alignment,
              and structural diagnosis
            </p>
          </div>

          <Link href="/" className="text-slate-600 hover:underline">
            ← Back Home
          </Link>
        </div>

        <section className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            1. Executive Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-indigo-100 p-6">
              <div className="text-sm text-slate-500 mb-2">
                Organization Maturity
              </div>
              <div className="text-4xl font-extrabold text-indigo-700">
                {overallScore.toFixed(2)}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-indigo-100 p-6">
              <div className="text-sm text-slate-500 mb-2">
                Post-deployment Score
              </div>
              <div className="text-4xl font-extrabold text-indigo-700">
                {postScore.toFixed(2)}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-indigo-100 p-6">
              <div className="text-sm text-slate-500 mb-2">
                Avg. HuCAS Score
              </div>
              <div className="text-4xl font-extrabold text-blue-700">
                {averageUserScore.toFixed(2)}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-indigo-100 p-6">
              <div className="text-sm text-slate-500 mb-2">Participants</div>
              <div className="text-4xl font-extrabold text-slate-800">
                {hucasParticipants.length || 1} /{" "}
                {organizationExperts.length ||
                  organizationResults.expertCount ||
                  1}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                End users / experts
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-indigo-100 p-6 text-slate-700 leading-relaxed">
            <p>
              The system first checks whether the organization maintained its
              HCAI maturity from pre-deployment to post-deployment. It then
              compares post-deployment maturity with end-user HuCAS perceptions.
              Finally, it generates structural diagnostic narratives explaining
              where internal capability may fail to become user-facing
              experiential value.
            </p>
          </div>
        </section>

        <section className="bg-green-50 border border-green-200 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            2. Internal Lifecycle Drift Analysis
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl border border-green-100 p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Pre vs. Post Maturity Radar
              </h3>

              <div className="h-[460px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={maturityRadarData}
                    margin={{ top: 40, right: 70, bottom: 40, left: 70 }}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="topic" tick={<WrappedTick />} />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Tooltip />
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
            </div>

            <div className="bg-white rounded-2xl border border-green-100 p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Drift Severity
              </h3>

              <div className="overflow-x-auto pb-2">
                <table className="min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="p-3 text-left text-black font-bold">
                        Topic
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Pre
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Post
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Drift
                      </th>
                      <th className="p-3 text-center text-black font-bold">
                        Interpretation
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {driftData.map((item) => (
                      <tr key={item.topic} className="border-b border-green-100">
                        <td className="p-3 font-semibold text-slate-800">
                          {item.topic}
                        </td>
                        <td className="p-3 text-center text-black font-semibold">
                          {item.pre.toFixed(1)}
                        </td>
                        <td className="p-3 text-center text-black font-semibold">
                          {item.post.toFixed(1)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-3 py-2 rounded-xl font-bold ${getDriftStyle(
                              item.delta
                            )}`}
                          >
                            {item.delta.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-3 text-center text-black font-semibold">
                          {item.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-slate-600 mt-5 leading-relaxed">
                Strong negative drift indicates that design-time intent may have
                weakened during deployment or operation. The largest decline is{" "}
                <strong>{strongestDriftDecline?.topic}</strong>.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            3. External Alignment Analysis
          </h2>

          <p className="text-slate-700 mb-6 leading-relaxed">
            This layer compares post-deployment organizational maturity with
            end-user HuCAS perceptions. It avoids directly comparing
            pre-deployment design intent with users and instead asks whether
            operational maturity becomes visible as user-facing experience.
          </p>

          <div className="overflow-x-auto pb-2">
            <table className="min-w-[1100px] border-collapse text-sm bg-white rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-blue-100">
                  <th className="p-4 text-left text-black font-bold">
                    Maturity Topic
                  </th>
                  <th className="p-4 text-left text-black font-bold">
                    HuCAS Factor
                  </th>
                  <th className="p-4 text-center text-black font-bold">
                    Org Post
                  </th>
                  <th className="p-4 text-center text-black font-bold">
                    User Score
                  </th>
                  <th className="p-4 text-center text-black font-bold">
                    Normalized Gap
                  </th>
                  <th className="p-4 text-center text-black font-bold">
                    Alignment Type
                  </th>
                </tr>
              </thead>

              <tbody>
                {alignmentData.map((item, index) => (
                  <tr key={index} className="border-b border-blue-100">
                    <td className="p-4 font-semibold text-slate-800">
                      {item.topic}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {item.factor}
                    </td>
                    <td className="p-4 text-center text-black font-semibold">
                      {item.orgPost.toFixed(1)}
                    </td>
                    <td className="p-4 text-center text-black font-semibold">
                      {item.userScore.toFixed(2)}
                    </td>
                    <td className="p-4 text-center text-black font-semibold">
                      {item.gap.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-2 rounded-xl font-bold ${item.style}`}
                        title={item.detail}
                      >
                        {item.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-slate-600 mt-5 leading-relaxed">
            The largest post-deployment/user perception gap is between{" "}
            <strong>{biggestAlignmentGap?.topic}</strong> and{" "}
            <strong>{biggestAlignmentGap?.factor}</strong>.
          </p>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            4. Research Analytics
          </h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                End-user Variance
              </h3>

              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userVarianceData}
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
                    <Bar dataKey="variance" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-slate-600 mt-4">
                Highest user variance:{" "}
                <strong>{highestUserVariance?.factor}</strong>.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Expert Disagreement
              </h3>

              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expertDisagreementData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="topic"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={110}
                      tick={{ fill: "#111827", fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="variance" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-slate-600 mt-4">
                Highest expert disagreement:{" "}
                <strong>{highestExpertDisagreement?.topic}</strong>.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-rose-50 border border-rose-200 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            5. Structural Diagnosis Narrative
          </h2>

          <div className="grid grid-cols-1 gap-5">
            {diagnosisNarratives.map((text, index) => (
              <div
                key={index}
                className="bg-white border border-rose-100 rounded-2xl p-6"
              >
                <div className="text-sm font-bold text-rose-600 mb-2">
                  Diagnostic Insight {index + 1}
                </div>
                <p className="text-slate-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            6. Final Integrated Summary
          </h2>

          <div className="bg-white border border-indigo-100 rounded-2xl p-6 space-y-5 text-slate-700 leading-relaxed">
            <p>
              This integrated assessment combines organizational HCAI maturity
              evaluation with end-user experiential perception analysis.
            </p>

            <p>
              The organization achieved an overall maturity score of{" "}
              <strong>{overallScore.toFixed(2)}</strong>, while end users
              reported an average HuCAS score of{" "}
              <strong>{averageUserScore.toFixed(2)}</strong>.
            </p>

            <p>
              Lifecycle drift analysis indicates that the most significant
              internal maturity decline occurred in{" "}
              <strong>{strongestDriftDecline?.topic}</strong>.
            </p>

            <p>
              External alignment analysis identified the largest perception gap
              between organizational maturity and user experience in{" "}
              <strong>{biggestAlignmentGap?.topic}</strong>, associated with{" "}
              <strong>{biggestAlignmentGap?.factor}</strong>.
            </p>

            <p>
              User variance analysis suggests that{" "}
              <strong>{highestUserVariance?.factor}</strong> exhibits the
              greatest experiential inconsistency across participants.
            </p>

            <p>
              Expert disagreement analysis indicates that{" "}
              <strong>{highestExpertDisagreement?.topic}</strong> remains the
              most contested organizational topic among expert evaluators.
            </p>

            <p>
              Overall, the results suggest that HCAI governance effectiveness
              should not only be evaluated through internal organizational
              maturity, but also through whether these governance mechanisms
              become visible, understandable, and experientially meaningful to
              end users.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all inline-block"
            >
              Back Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
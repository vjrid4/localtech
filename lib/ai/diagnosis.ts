import Anthropic from "@anthropic-ai/sdk";

export interface DiagnosisInput {
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  symptoms?: string[];
  previousRepairs?: string[];
}

export interface PossibleIssue {
  issue: string;
  probability: number;
  symptoms: string[];
  solution: string;
  estimatedCost: number;
  requiredParts?: string[];
}

export interface DiagnosisResult {
  confidence: number;
  possibleIssues: PossibleIssue[];
  recommendedActions: string[];
  estimatedTimeToRepair: number; // minutes
}

const MOCK: DiagnosisResult = {
  confidence: 0.92,
  possibleIssues: [
    {
      issue: "Battery Degradation",
      probability: 0.45,
      symptoms: ["Rapid battery drain", "Device shutdowns"],
      solution: "Replace battery",
      estimatedCost: 5500,
      requiredParts: ["Battery"],
    },
    {
      issue: "Charging Port Issue",
      probability: 0.35,
      symptoms: ["Slow charging", "Connection issues"],
      solution: "Clean or replace charging port",
      estimatedCost: 2500,
      requiredParts: ["Charging Port"],
    },
    {
      issue: "Software Issue",
      probability: 0.2,
      symptoms: ["Random restarts", "App crashes"],
      solution: "Factory reset or OS reinstall",
      estimatedCost: 0,
    },
  ],
  recommendedActions: [
    "Run diagnostic test",
    "Check for software updates",
    "Inspect physical condition",
    "Test battery health",
  ],
  estimatedTimeToRepair: 120,
};

export async function diagnoseDevice(input: DiagnosisInput): Promise<DiagnosisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return MOCK;

  try {
    const client = new Anthropic({ apiKey });

    const prompt = `You are an expert device repair technician in India. Diagnose the following device issue and return a JSON object.

Device: ${input.deviceBrand} ${input.deviceModel}
Issue described: ${input.issueDescription}
${input.symptoms?.length ? `Symptoms: ${input.symptoms.join(", ")}` : ""}
${input.previousRepairs?.length ? `Previous repairs: ${input.previousRepairs.join(", ")}` : ""}

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "confidence": <0.0-1.0>,
  "possibleIssues": [
    {
      "issue": "<issue name>",
      "probability": <0.0-1.0>,
      "symptoms": ["<symptom>"],
      "solution": "<fix description>",
      "estimatedCost": <INR integer>,
      "requiredParts": ["<part>"]
    }
  ],
  "recommendedActions": ["<action>"],
  "estimatedTimeToRepair": <minutes integer>
}

List 2-4 possible issues ordered by probability. Costs in Indian Rupees. Keep solutions concise.`;

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const result: DiagnosisResult = JSON.parse(text);
    return result;
  } catch (err) {
    console.error("[ai:diagnosis] Anthropic error — falling back to mock:", err);
    return MOCK;
  }
}

export async function analyzeRepairHistory(
  _deviceId: string,
): Promise<{
  riskFactors: string[];
  predictedFailures: string[];
  recommendedMaintenance: string[];
}> {
  return {
    riskFactors: ["Battery degradation", "Screen vulnerability"],
    predictedFailures: ["Battery (3-6 months)", "Charging port (6-12 months)"],
    recommendedMaintenance: [
      "Battery health check",
      "Screen protection",
      "Charging port cleaning",
    ],
  };
}

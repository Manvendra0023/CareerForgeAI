"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function detectLoginThreats({ email }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
You are a cybersecurity expert. Analyze this email address for potential login security threats and data breach risks.

Email: "${email}"

Assess the following:
- Is the email domain known to be involved in large data breaches (e.g., Yahoo, LinkedIn, Adobe)?
- Does the email pattern suggest it might have been used on high-risk platforms?
- Email domain age and reputation (free domains like Gmail/Yahoo are more commonly targeted than corporate)
- Common credential stuffing risks for this type of email
- Password hygiene risks associated with this email format

Return a raw JSON object (no markdown) with this exact structure:
{
  "riskLevel": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "riskScore": <0-100, where 100 = highest threat>,
  "summary": "<one sentence assessment>",
  "threats": ["<threat1>", "<threat2>"],
  "securityTips": ["<tip1>", "<tip2>", "<tip3>"],
  "recommendation": "<most important action to take>",
  "domainRisk": "<assessment of the email domain specifically>"
}
`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const parts = result?.candidates?.[0]?.content?.parts || [];
    const rawText = parts.map((p) => p.text || "").join("") || result?.text || "";

    const jsonMatch = rawText.match(/\{[\s\S]*"riskLevel"[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned unexpected format. Please try again.");

    const data = JSON.parse(jsonMatch[0]);
    if (!data.riskLevel || typeof data.riskScore !== "number") throw new Error("Incomplete AI response.");

    return data;
  } catch (error) {
    console.error("Login threat detection error:", error);
    throw new Error(error.message || "Failed to analyze login threats");
  }
}

export async function checkUrlSafety({ url }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
You are a cybersecurity expert. Analyze the following URL for potential safety risks, phishing indicators, and malicious intent.

URL: "${url}"

Analyze based on these factors:
- Domain age and reputation (is it a known safe domain like google.com, or a suspicious newly registered domain?)
- Typosquatting (does it look like a fake version of a popular site, e.g., paypa1.com instead of paypal.com?)
- URL structure (excessive subdomains, unusual TLDs like .xyz or .tk, IP address instead of domain)
- Presence of suspicious parameters or open redirects
- SSL/TLS implications (http vs https)
- Common patterns used in phishing or malware distribution

Return a raw JSON object (no markdown) with this exact structure:
{
  "riskLevel": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "riskScore": <0-100, where 100 = most dangerous>,
  "verdict": "<Short verdict, e.g. 'Likely Phishing' or 'Safe Domain'>",
  "summary": "<one sentence assessment>",
  "redFlags": ["<flag1>", "<flag2>"],
  "safeSignals": ["<signal1>"],
  "recommendation": "<what the user should do>"
}
`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const parts = result?.candidates?.[0]?.content?.parts || [];
    const rawText = parts.map((p) => p.text || "").join("") || result?.text || "";

    const jsonMatch = rawText.match(/\{[\s\S]*"riskLevel"[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned unexpected format. Please try again.");

    const data = JSON.parse(jsonMatch[0]);
    if (!data.riskLevel || typeof data.riskScore !== "number") throw new Error("Incomplete AI response.");

    return data;
  } catch (error) {
    console.error("URL safety check error:", error);
    throw new Error(error.message || "Failed to analyze URL");
  }
}

export async function verifyRecruiter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
You are an expert technical recruiter and cybersecurity analyst. Evaluate the following details provided about a recruiter for potential scam, phishing, or fake job offer indicators.

Recruiter Name: "${data.name || 'Not provided'}"
Company Name: "${data.company || 'Not provided'}"
Recruiter Email: "${data.email || 'Not provided'}"
LinkedIn URL: "${data.linkedin || 'Not provided'}"
Message/Context: "${data.message || 'Not provided'}"

Analyze based on these factors:
- Does the email domain exactly match the official company domain? (e.g., Google uses @google.com, not @google-careers.com or @gmail.com)
- Are they asking for money (equipment fee, background check fee, training fee)?
- Is the messaging overly urgent or grammatically poor?
- Does the recruiter name sound generic or mismatched with the context?
- Is it a known scam pattern (e.g., fake check scam, upfront fee scam)?
- If LinkedIn is provided, does the URL look legitimate?

Return a raw JSON object (no markdown) with this exact structure:
{
  "trustLevel": "HIGH_TRUST" | "MEDIUM_TRUST" | "LOW_TRUST" | "SCAM",
  "trustScore": <0-100, where 100 = definitely legitimate, 0 = definite scam>,
  "verdict": "<Short verdict, e.g. 'Highly Suspicious' or 'Appears Legitimate'>",
  "summary": "<one sentence assessment>",
  "redFlags": ["<flag1>", "<flag2>"],
  "safeSignals": ["<signal1>"],
  "nextSteps": ["<step1>", "<step2>"]
}
`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const parts = result?.candidates?.[0]?.content?.parts || [];
    const rawText = parts.map((p) => p.text || "").join("") || result?.text || "";

    const jsonMatch = rawText.match(/\{[\s\S]*"trustLevel"[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned unexpected format. Please try again.");

    const parsedData = JSON.parse(jsonMatch[0]);
    if (!parsedData.trustLevel || typeof parsedData.trustScore !== "number") throw new Error("Incomplete AI response.");

    return parsedData;
  } catch (error) {
    console.error("Recruiter verification error:", error);
    throw new Error(error.message || "Failed to verify recruiter");
  }
}

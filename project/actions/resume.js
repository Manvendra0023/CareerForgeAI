"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";

// ✅ NEW SDK initialization (correct for Gemini 2.5)
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: { userId: user.id },
  });
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description 
    for a ${user.industry} professional.

    Make it more impactful, quantified, skill-focused, and aligned with industry standards.

    Current content: "${current}"

    Requirements:
    - Use action verbs
    - Include metrics when possible
    - Highlight technical strengths
    - Keep it concise and achievement-focused
    - Use industry-relevant keywords
    - Return ONLY the improved paragraph. No extra text.
  `;

  try {
    // ✅ NEW API method for Gemini 2.5 Flash
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const improvedContent = result.text.trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}

export async function analyzePhishingEmail({ emailContent }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
You are a cybersecurity expert specializing in job scam detection. Analyze the following email content and determine if it is a phishing/scam job offer.

Email content:
"""
${emailContent}
"""

Analyze for these red flags:
- Vague job descriptions or unrealistic salaries
- Poor grammar and spelling
- Requests for personal/financial information upfront
- Suspicious sender domains or generic email addresses
- Pressure tactics or urgency language
- Requests to pay for training/equipment/background checks
- Too-good-to-be-true promises
- Requests for bank account or SSN details early in process
- Missing company details or unverifiable companies
- Work-from-home scams with "easy money"
- Unsolicited job offers you never applied for

Also look for trust signals:
- Known legitimate company name
- Professional tone and specific job requirements
- Clear company contact information
- References to a real application you submitted
- Professional email domain matching company website

Return a JSON object (no markdown, just raw JSON) with this exact structure:
{
  "riskLevel": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "riskScore": <number 0-100, where 100 is definitely a scam>,
  "verdict": "<one sentence verdict>",
  "redFlags": ["<flag1>", "<flag2>", ...],
  "trustSignals": ["<signal1>", "<signal2>", ...],
  "explanation": "<detailed 2-3 sentence analysis>",
  "recommendation": "<what the user should do next>"
}
`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Collect all text parts (thinking models may split into multiple parts)
    const parts = result?.candidates?.[0]?.content?.parts || [];
    const rawText =
      parts.map((p) => p.text || "").join("") ||
      result?.text ||
      "";

    console.log("=== PHISHING ANALYZER RAW TEXT ===");
    console.log(rawText.slice(0, 500));
    console.log("==================================");

    // Extract JSON object from anywhere in the response (handles thinking preambles)
    const jsonMatch = rawText.match(/\{[\s\S]*"riskLevel"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", rawText.slice(0, 300));
      throw new Error("AI returned an unexpected format. Please try again.");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!analysis.riskLevel || typeof analysis.riskScore !== "number") {
      throw new Error("AI response missing required fields.");
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing email:", error);
    throw new Error(error.message || "Failed to analyze email content");
  }
}

export async function scanResumeForSecurity({ resumeContent }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
You are a privacy and cybersecurity expert specializing in resume security. Analyze the following resume content and identify privacy risks, overshared personal information, and potential identity theft vulnerabilities.

Resume content:
"""
${resumeContent}
"""

Check for these privacy/security issues:
- Full home address (street, city, zip) — unnecessary and risky
- Date of birth or age
- National ID, SSN, passport, or government ID numbers
- Personal phone number format risks
- Personal email on free domains vs professional
- Marital status, religion, ethnicity, or nationality
- Photo descriptions or references
- Salary history or current salary information
- Too many personal social accounts (personal Facebook, Instagram)
- References with their contact details listed directly
- Company internal project names or confidential data
- Exact client names without permission context
- Too granular home location details
- Any financial account details

Also identify what is done WELL for privacy:
- Using professional email
- Using LinkedIn instead of personal social media
- Keeping address to city/state only
- No sensitive identifiers
- Professional tone without personal TMI

Return a JSON object (raw JSON only, no markdown) with this exact structure:
{
  "securityScore": <number 0-100, where 100 means perfectly safe>,
  "overallRisk": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "summary": "<one sentence overall assessment>",
  "risks": [
    {
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "category": "<category name e.g. 'Personal Address'>",
      "issue": "<what the problem is>",
      "fix": "<specific action to fix it>"
    }
  ],
  "goodPractices": ["<practice1>", "<practice2>"],
  "topRecommendation": "<the single most important thing to fix right now>"
}
`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const parts = result?.candidates?.[0]?.content?.parts || [];
    const rawText =
      parts.map((p) => p.text || "").join("") ||
      result?.text ||
      "";

    console.log("=== RESUME SECURITY SCAN RAW TEXT ===");
    console.log(rawText.slice(0, 500));
    console.log("=====================================");

    const jsonMatch = rawText.match(/\{[\s\S]*"securityScore"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in security scan response:", rawText.slice(0, 300));
      throw new Error("AI returned an unexpected format. Please try again.");
    }

    const scan = JSON.parse(jsonMatch[0]);

    if (typeof scan.securityScore !== "number" || !scan.overallRisk) {
      throw new Error("AI response missing required fields.");
    }

    return scan;
  } catch (error) {
    console.error("Error scanning resume:", error);
    throw new Error(error.message || "Failed to scan resume");
  }
}

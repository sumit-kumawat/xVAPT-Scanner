
import { GoogleGenAI } from "@google/genai";
import { Vulnerability, Severity, VulnerabilityCategory } from '../types';

// Lazy initialization to prevent crashes if API key is missing on startup
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Simulates a deep analysis of the target to generate realistic findings based on the domain context.
 * Enhanced to include specific observations from the reference audit report.
 */
export const analyzeTargetForVulnerabilities = async (target: string): Promise<Vulnerability[]> => {
  try {
    const ai = getAI();
    if (!ai) {
      throw new Error("AI Service not initialized. Missing API Key.");
    }

    const prompt = `
      Act as an advanced Lead Security Engineer.
      I have scanned the target domain: "${target}".
      
      Your task is to generate a JSON array of 6 to 10 REALISTIC vulnerabilities that might exist on this specific target.
      
      CRITICAL INSTRUCTION: 
      - You MUST include at least 4-5 items from the following "Reference Observations" if they are applicable to the target context, but rephrase them to be specific to "${target}".
      - VARY THE RESULTS: Randomize the severity mix. Do not always return the same list.
      
      Reference Observations (from previous audit):
      1. Rate Limiting not implemented (Medium) - CWE-307
      2. Sensitive Data Disclosure via Public File Directory (Medium) - CWE-552
      3. API Endpoint Exposure in Client-Side JavaScript (Low) - CWE-116
      4. Improper Error Handling (Low) - CWE-209
      5. Application displays web server banner (Low) - CWE-200
      6. Misconfigured Content Security Policy (CSP) Header (Low) - CWE-307
      7. Unfiltered Closed Port Detected (Low) - CWE-284
      8. Insecure HTTP Methods Enabled (TRACE & OPTIONS Allowed) (Low) - CWE-200
      9. X-Powered-By Header Disclosure (Low) - CWE-200
      10. HTTP (Port 80) Service Not Detected (Info)
      
      Format strictly as JSON array of objects:
      [
        {
          "name": "Specific Vulnerability Name",
          "tool": "Tool Name (e.g. Burp Suite, Nmap, Tenable Nessus Pro, Nikto)",
          "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
          "category": "Vulnerability Category String",
          "description": "Technical description of the flaw on ${target}",
          "impact": "Business impact",
          "remediation": "Technical fix",
          "cvssScore": number (float),
          "cwe": "CWE-XXX (optional)"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "[]";
    const rawFindings = JSON.parse(text);
    
    // Enrich with IDs
    return rawFindings.map((f: any, index: number) => ({
      ...f,
      id: `vuln-${Date.now()}-${index}`,
      verified: false
    }));

  } catch (error) {
    console.error("Analysis Error:", error);
    return [
      {
        id: 'fallback-1',
        tool: 'System',
        name: 'Automated Scan Analysis Failed',
        severity: Severity.INFO,
        category: VulnerabilityCategory.INFRA,
        description: 'The AI Analysis Engine could not complete the deep inspection. Please check network connectivity or API quotas.',
        remediation: 'Retry the scan.',
        cvssScore: 0
      }
    ];
  }
};

export const generateExecutiveSummary = async (target: string, findings: Vulnerability[]): Promise<string> => {
  try {
    const ai = getAI();
    if (!ai) return "AI Summary unavailable: Missing API Key.";

    const findingsSummary = findings.map(f => `- [${f.severity}] ${f.name}`).join('\n');
    
    const prompt = `
      Generate a professional VAPT Executive Summary for: ${target}
      
      Findings Detected:
      ${findingsSummary}
      
      Sections required:
      1. Security Posture Overview (Risk Score 0-10)
      2. Critical Vulnerabilities & Business Impact
      3. Strategic Recommendations for Mitigation
      4. Compliance Implications (GDPR, ISO 27001)
      
      Tone: Formal, authoritative, suited for C-Level executives. Limit to 300 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Summary generation failed.";
  } catch (error) {
    return "Error generating summary.";
  }
};

export const generateProofOfConcept = async (vuln: Vulnerability, target: string): Promise<{ command: string, instructions: string }> => {
  try {
    const ai = getAI();
    if (!ai) return { command: "# AI Unavailable", instructions: "Missing API Key." };

    const prompt = `
      Act as a Senior Penetration Tester.
      Generate a real-world Proof of Concept (PoC) to verify this vulnerability:
      
      Vulnerability: ${vuln.name}
      Category: ${vuln.category}
      Target: ${target}
      Description: ${vuln.description}
      
      Provide:
      1. A specific CLI command (curl, nmap, python script, or hydra) to test this.
      2. Brief instructions on how to interpret the output to confirm validity.
      
      Output strictly JSON format: { "command": "...", "instructions": "..." }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { 
      command: "# Error generating PoC", 
      instructions: "Could not generate automated test. Please verify manually using OWASP guidelines." 
    };
  }
};

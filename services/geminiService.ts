
import { GoogleGenAI } from "@google/genai";
import { Vulnerability, Severity, VulnerabilityCategory } from '../types';

// NOTE: In a real production environment, the API Key should be handled via a secure backend proxy.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates a deep analysis of the target to generate realistic findings based on the domain context.
 */
export const analyzeTargetForVulnerabilities = async (target: string): Promise<Vulnerability[]> => {
  try {
    const prompt = `
      Act as an advanced Lead Security Engineer.
      I have scanned the target domain: "${target}".
      
      Your task is to generate a JSON array of 4 to 8 REALISTIC vulnerabilities that might exist on this specific target.
      
      CRITICAL INSTRUCTION: 
      - If the target is a .php site, include PHP-specific vulns.
      - If it's a WordPress site (wp-), include Plugin vulns.
      - If it's a generic corporate site, include SSL, Headers, and Email Spoofing issues.
      - VARY THE RESULTS: Randomize the severity mix. Do not always return the same list.
      
      Checklist Coverage:
      - Injection (SQLi, XSS)
      - Auth (Weak Password, No MFA)
      - Config (Headers, SSL, Open Ports)
      - API (BOLA, Rate Limit)

      Format strictly as JSON array of objects:
      [
        {
          "name": "Specific Vulnerability Name",
          "tool": "Tool Name (e.g. Burp Suite, Nmap)",
          "severity": "Critical" | "High" | "Medium" | "Low",
          "category": "Vulnerability Category String",
          "description": "Technical description of the flaw on ${target}",
          "impact": "Business impact",
          "remediation": "Technical fix",
          "cvssScore": number (float)
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

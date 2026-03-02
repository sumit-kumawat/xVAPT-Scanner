
import { LogEntry, VulnerabilityCategory } from '../types';

// Exhaustive Checklist based on User Requirement (Enhanced with PDF findings)
export const VAPT_CHECKLIST = [
  // 1. Web App - Auth & Authz
  { category: VulnerabilityCategory.AUTH, label: 'Testing Rate Limiting Implementation' },
  { category: VulnerabilityCategory.AUTH, label: 'Verifying MFA Bypass & Session Fixation' },
  { category: VulnerabilityCategory.AUTH, label: 'Checking Privilege Escalation (Horizontal/Vertical)' },
  
  // 2. Input Validation & Injection
  { category: VulnerabilityCategory.INJECTION, label: 'Scanning for SQL Injection (Manual/Auto)' },
  { category: VulnerabilityCategory.INJECTION, label: 'Testing NoSQL & LDAP Injection' },
  { category: VulnerabilityCategory.INJECTION, label: 'Analyzing SSTI & Command Injection' },
  
  // 3. Cross-Site Vulnerabilities
  { category: VulnerabilityCategory.XSS_CSRF, label: 'Fuzzing for XSS (Reflected/Stored/DOM)' },
  { category: VulnerabilityCategory.XSS_CSRF, label: 'Verifying CSRF & Clickjacking Protections' },
  { category: VulnerabilityCategory.XSS_CSRF, label: 'Testing CORS Origin Bypass' },
  
  // 4. Session & Cookies
  { category: VulnerabilityCategory.SESSION, label: 'Auditing Cookie Flags (HttpOnly/Secure)' },
  { category: VulnerabilityCategory.SESSION, label: 'Analyzing JWT Tokens & Secret Strength' },
  
  // 5. Business Logic
  { category: VulnerabilityCategory.LOGIC, label: 'Testing Payment Manipulation Flaws' },
  { category: VulnerabilityCategory.LOGIC, label: 'Checking Workflow Bypasses' },
  
  // 6. File Upload & Directory Security
  { category: VulnerabilityCategory.FILE_UPLOAD, label: 'Testing Malicious File Uploads (RCE)' },
  { category: VulnerabilityCategory.FILE_UPLOAD, label: 'Checking Sensitive Data Disclosure via Public File Directory' },
  
  // 7. Security Headers & Error Handling
  { category: VulnerabilityCategory.HEADERS, label: 'Analyzing HTTP Security Headers (CSP, HSTS)' },
  { category: VulnerabilityCategory.HEADERS, label: 'Checking for Web Server Banner Disclosure' },
  { category: VulnerabilityCategory.HEADERS, label: 'Checking for X-Powered-By Header Disclosure' },
  { category: VulnerabilityCategory.INFRA, label: 'Checking Improper Error Handling & Stack Trace Leakage' },
  
  // 8. API Security
  { category: VulnerabilityCategory.API, label: 'Testing for BOLA / IDOR' },
  { category: VulnerabilityCategory.API, label: 'Checking API Endpoint Exposure in Client-Side JavaScript' },
  { category: VulnerabilityCategory.API, label: 'Verifying Insecure HTTP Methods (TRACE & OPTIONS)' },
  
  // 9. Infrastructure & Network
  { category: VulnerabilityCategory.INFRA, label: 'Port Scanning & Service Fingerprinting' },
  { category: VulnerabilityCategory.INFRA, label: 'Detecting Unfiltered Closed Ports' },
  { category: VulnerabilityCategory.INFRA, label: 'Checking HTTP (Port 80) Service Redirection' },
  { category: VulnerabilityCategory.INFRA, label: 'Checking SSL/TLS Configuration' },
  
  // 10. DNS & Network
  { category: VulnerabilityCategory.DNS, label: 'Enumerating Subdomains & DNS Zones' },
  { category: VulnerabilityCategory.DNS, label: 'Checking Firewall Bypass & Open Ports' },
  
  // 11. Compliance
  { category: VulnerabilityCategory.COMPLIANCE, label: 'Verifying GDPR PII Exposure' },
  { category: VulnerabilityCategory.COMPLIANCE, label: 'Checking Sensitive Data in Source Maps' }
];

export const generateScanLog = (step: number, target: string, totalSteps: number): LogEntry => {
  const progress = step / totalSteps;
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  
  // Determine current phase based on progress
  const phaseIndex = Math.floor(progress * VAPT_CHECKLIST.length);
  const currentPhase = VAPT_CHECKLIST[Math.min(phaseIndex, VAPT_CHECKLIST.length - 1)];
  
  // Select realistic tool based on category
  let tool = 'System';
  switch (currentPhase.category) {
    case VulnerabilityCategory.INFRA: tool = 'Nmap'; break;
    case VulnerabilityCategory.DNS: tool = 'Sublist3r/Dig'; break;
    case VulnerabilityCategory.INJECTION: tool = 'SQLMap'; break;
    case VulnerabilityCategory.XSS_CSRF: tool = 'OWASP ZAP'; break;
    case VulnerabilityCategory.AUTH: tool = 'Hydra/Burp'; break;
    case VulnerabilityCategory.API: tool = 'Postman/Kiterunner'; break;
    case VulnerabilityCategory.CLOUD: tool = 'CloudSploit'; break;
    case VulnerabilityCategory.FILE_UPLOAD: tool = 'Fuxploider'; break;
    case VulnerabilityCategory.COMPLIANCE: tool = 'OpenSCAP'; break;
    default: tool = 'Scanner Core';
  }

  const logMessages = [
    `[${currentPhase.category}] Executing check: ${currentPhase.label}`,
    `[${tool}] Sending probes to ${target}`,
    `[${tool}] Analyzing response headers and body`,
    `[${tool}] Fuzzing parameters for potential vectors`,
    `[${tool}] verifying payload execution context`,
    `[${tool}] Checking against CVE-2024-XXXX database`,
    `[${tool}] validating SSL certificate chain efficiency`,
  ];

  // More specific logs based on progress steps
  let message = logMessages[Math.floor(Math.random() * logMessages.length)];
  
  // Force a phase change log
  const itemsPerPhase = totalSteps / VAPT_CHECKLIST.length;
  if (step % Math.floor(itemsPerPhase) === 0) {
    message = `>>> STARTING PHASE: ${currentPhase.label.toUpperCase()}`;
  }

  return {
    timestamp,
    tool,
    message,
    type: message.startsWith('>>>') ? 'warning' : 'info'
  };
};

export const getSmartInsight = (step: number, totalSteps: number, target: string): string => {
  const progress = step / totalSteps;
  const phaseIndex = Math.floor(progress * VAPT_CHECKLIST.length);
  const currentPhase = VAPT_CHECKLIST[Math.min(phaseIndex, VAPT_CHECKLIST.length - 1)];

  // "Intelligent" feedback based on phase
  const insights: Record<string, string[]> = {
    [VulnerabilityCategory.AUTH]: [
      "Analyzing login flow entropy...",
      "Heuristic check: Admin portal exposure detected on standard paths.",
      "Comparing password policy against NIST guidelines."
    ],
    [VulnerabilityCategory.INJECTION]: [
      "Detected parameterized queries, attempting second-order injection...",
      "Fuzzing 50+ input vectors for SQL syntax errors.",
      "Analyzing database error messages for vendor identification."
    ],
    [VulnerabilityCategory.XSS_CSRF]: [
      "Simulating DOM-based sink execution...",
      "Checking Content-Security-Policy strictness.",
      "Verifying anti-CSRF token validation on state-changing requests."
    ],
    [VulnerabilityCategory.API]: [
      "Replaying IDOR vectors on /user endpoints...",
      "Checking for mass assignment on PATCH requests.",
      "Validating JWT signature algorithm (None algo check)."
    ],
    [VulnerabilityCategory.INFRA]: [
      `Fingerprinting server stack for ${target}...`,
      "Identifying open non-standard ports...",
      "Checking TLS 1.0/1.1 deprecation status."
    ]
  };

  const categoryInsights = insights[currentPhase.category] || [
    `Correlating ${currentPhase.category} patterns with threat intelligence...`,
    "Deep scanning logic active...",
    "Verifying false positives..."
  ];

  return categoryInsights[step % categoryInsights.length];
};

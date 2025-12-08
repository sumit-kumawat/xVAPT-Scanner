import { LogEntry, Vulnerability, Severity, VulnerabilityCategory } from '../types';

const TOOLS = ['Nmap', 'Nikto', 'Wapiti', 'SQLMap', 'WPScan', 'Sublist3r', 'WhatWeb', 'CloudAudit', 'BurpSuite-Lite'];

export const VAPT_CHECKLIST = [
  { category: VulnerabilityCategory.AUTH, label: 'Testing Weak Passwords & Brute Force' },
  { category: VulnerabilityCategory.AUTH, label: 'Checking 2FA Bypass Mechanisms' },
  { category: VulnerabilityCategory.INJECTION, label: 'Scanning for SQL/NoSQL Injection' },
  { category: VulnerabilityCategory.INJECTION, label: 'Testing Command Injection Flaws' },
  { category: VulnerabilityCategory.XSS_CSRF, label: 'Analyzing Cross-Site Scripting (XSS)' },
  { category: VulnerabilityCategory.XSS_CSRF, label: 'Verifying CSRF Tokens' },
  { category: VulnerabilityCategory.SESSION, label: 'Inspecting Cookie Flags (HttpOnly, Secure)' },
  { category: VulnerabilityCategory.SESSION, label: 'Testing JWT Weaknesses' },
  { category: VulnerabilityCategory.HEADERS, label: 'Analyzing Security Headers (CSP, HSTS)' },
  { category: VulnerabilityCategory.API, label: 'Checking API Rate Limits & BOLA' },
  { category: VulnerabilityCategory.INFRA, label: 'Detecting Server Misconfigurations' },
  { category: VulnerabilityCategory.DNS, label: 'Checking DNS Zone Transfers' },
  { category: VulnerabilityCategory.CLOUD, label: 'Scanning Public S3/GCS Buckets' },
  { category: VulnerabilityCategory.COMPLIANCE, label: 'Verifying GDPR Data Exposure' }
];

const POSSIBLE_FINDINGS: Vulnerability[] = [
  { 
    id: '1', tool: 'Nmap', name: 'Open Port 21 (FTP)', severity: Severity.MEDIUM, 
    category: VulnerabilityCategory.INFRA,
    description: 'Anonymous FTP login allowed on port 21.', 
    impact: 'Attackers can upload malicious files or download sensitive data.',
    remediation: 'Disable anonymous login or close port 21 if not needed.',
    cvssScore: 5.3,
    evidence: 'Port 21/TCP open. Banner: "220 FTP Server Ready"'
  },
  { 
    id: '2', tool: 'Nikto', name: 'Missing X-Frame-Options', severity: Severity.LOW, 
    category: VulnerabilityCategory.HEADERS,
    description: 'Clickjacking protection missing from response headers.', 
    impact: 'Users can be tricked into clicking hidden overlays.',
    remediation: 'Add X-Frame-Options: DENY or SAMEORIGIN header.',
    cvssScore: 3.1,
    evidence: 'Header "X-Frame-Options" not found in response.'
  },
  { 
    id: '3', tool: 'SQLMap', name: 'SQL Injection (Blind)', severity: Severity.CRITICAL, 
    category: VulnerabilityCategory.INJECTION,
    description: 'Parameter ?id= is vulnerable to boolean-based blind SQLi.', 
    impact: 'Full database compromise, data theft, and potential RCE.',
    remediation: 'Use prepared statements (parameterized queries) for all DB access.',
    cvssScore: 9.8,
    evidence: 'Payload: ?id=1 AND 1=1 resulted in different response length.'
  },
  { 
    id: '4', tool: 'Wapiti', name: 'Reflected XSS', severity: Severity.HIGH, 
    category: VulnerabilityCategory.XSS_CSRF,
    description: 'Reflected XSS found in search bar input.', 
    impact: 'Session hijacking, malicious redirects, and credential theft.',
    remediation: 'Implement context-aware output encoding and input validation.',
    cvssScore: 7.2,
    evidence: 'Input <script>alert(1)</script> reflected in response body.'
  },
  { 
    id: '5', tool: 'CloudAudit', name: 'Public S3 Bucket', severity: Severity.HIGH, 
    category: VulnerabilityCategory.CLOUD,
    description: 'S3 bucket "assets-prod" is publicly listable.', 
    impact: 'Leakage of sensitive assets, backups, or user data.',
    remediation: 'Disable public access blocking and verify IAM policies.',
    cvssScore: 7.5,
    evidence: 'GET https://s3.amazonaws.com/assets-prod/ returned 200 OK with file listing.'
  },
  { 
    id: '6', tool: 'Sublist3r', name: 'Subdomain Takeover', severity: Severity.HIGH, 
    category: VulnerabilityCategory.DNS,
    description: 'dev.target.com points to unclaimed generic service.', 
    impact: 'Attacker can claim the subdomain and host phishing sites.',
    remediation: 'Remove the CNAME record or claim the external resource.',
    cvssScore: 8.1,
    evidence: 'CNAME record points to non-existent herokuapp bucket.'
  },
  { 
    id: '7', tool: 'Nmap', name: 'TLS 1.0 Enabled', severity: Severity.MEDIUM, 
    category: VulnerabilityCategory.INFRA,
    description: 'Server supports outdated TLS 1.0 protocol.', 
    impact: 'Susceptibility to POODLE and BEAST attacks.',
    remediation: 'Disable TLS 1.0 and 1.1 in web server config.',
    cvssScore: 4.3,
    evidence: 'SSL handshake successful using TLSv1.0.'
  },
  {
    id: '8', tool: 'BurpSuite-Lite', name: 'Broken Object Level Auth', severity: Severity.CRITICAL,
    category: VulnerabilityCategory.API,
    description: 'API endpoint /users/{id} accessible without ownership check.',
    impact: 'Unauthorized access to other users\' private data.',
    remediation: 'Implement ownership checks on the requested object ID.',
    cvssScore: 9.1,
    evidence: 'Request to /users/102 succeeds with Token for user 101.'
  }
];

export const generateMockLog = (step: number, target: string): LogEntry => {
  const timestamp = new Date().toLocaleTimeString();
  
  // Map step to checklist to simulate structured scan
  const checklistIndex = Math.floor((step / 100) * VAPT_CHECKLIST.length) % VAPT_CHECKLIST.length;
  const currentTask = VAPT_CHECKLIST[checklistIndex];
  
  const tool = TOOLS[step % TOOLS.length];
  
  const messages = [
    `[${currentTask.category}] ${currentTask.label}...`,
    `[${tool}] Sending probes to ${target}...`,
    `[${tool}] Analyzing response headers...`,
    `[${tool}] Fuzzing parameters for anomalies...`,
    `[${tool}] Checking against CVE database...`,
    `[${tool}] Verifying SSL/TLS certificate chain...`,
    `[${tool}] Validating API schema...`
  ];

  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    timestamp,
    tool,
    message: randomMsg,
    type: 'info'
  };
};

export const getRandomFinding = (step: number): Vulnerability | null => {
  // Only find something occasionally (15% chance per tick)
  if (Math.random() > 0.85) {
    const finding = POSSIBLE_FINDINGS[Math.floor(Math.random() * POSSIBLE_FINDINGS.length)];
    return { 
      ...finding, 
      id: Math.random().toString(36).substr(2, 9) 
    };
  }
  return null;
};
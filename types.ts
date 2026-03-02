
export enum ScanStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFO = 'Info'
}

export enum VulnerabilityCategory {
  AUTH = 'Authentication & Authorization',
  INJECTION = 'Input Validation & Injection',
  XSS_CSRF = 'Cross-Site Vulnerabilities',
  SESSION = 'Session & Cookie Security',
  LOGIC = 'Business Logic',
  FILE_UPLOAD = 'File Upload & Download',
  HEADERS = 'Security Headers',
  API = 'API Security',
  INFRA = 'Server & Infrastructure',
  DNS = 'Domain & Network',
  CLOUD = 'Cloud Security',
  FRONTEND = 'Front-End Security',
  COMPLIANCE = 'Compliance & Policy'
}

export interface Vulnerability {
  id: string;
  tool: string;
  name: string;
  severity: Severity;
  category: VulnerabilityCategory;
  description: string;
  impact?: string;
  remediation: string;
  cvssScore?: number;
  cwe?: string;
  evidence?: string;
  verified?: boolean; // New: status after re-test
}

export interface LogEntry {
  timestamp: string;
  tool: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  ip: string;
  user: string;
  action: string;
  status: 'Success' | 'Failed' | 'Warning';
  details?: string;
}

export interface ScanResult {
  id: string;
  targetUrl: string;
  date: string;
  duration: string;
  findings: Vulnerability[];
  logs: LogEntry[];
  aiSummary?: string;
  clientName?: string;
  clientId?: string;
}

// User Management Types
export enum UserRole {
  ADMIN = 'Administrator', // Full access
  MANAGER = 'Manager',     // Can scan, edit data
  VIEWER = 'Viewer'        // Read only, specific client
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // For simulation auth
  role: UserRole;
  isTempPassword?: boolean;
  assignedClientId?: string; // For Viewers
}

export interface Client {
  id: string;
  name: string;
  domain: string;
  contactEmail: string;
  phone: string;
  address: string;
  contactPerson: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

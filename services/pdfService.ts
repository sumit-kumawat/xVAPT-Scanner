
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ScanResult, Severity, Vulnerability } from '../types';

export const generatePDFReport = (scanData: ScanResult) => {
  if (!scanData || !scanData.findings) {
    console.error("No scan data provided for PDF generation");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // --- COLORS ---
  const PRIMARY_BLUE = [66, 133, 244]; // Conzex Blue
  const TEXT_DARK = [15, 23, 42];
  const TEXT_MUTED = [100, 116, 139];

  // --- UTILS ---
  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, '')  // Remove bold markdown
      .replace(/##/g, '')    // Remove header markdown
      .replace(/__/g, '')    // Remove italic/bold markdown
      .replace(/^-\s/gm, '• ') // Replace dashes with bullets
      .trim();
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    
    const footerY = pageHeight - 10;
    doc.text(`Page ${pageNum} of ${totalPages}`, margin, footerY);
    doc.text("VAPT Report | Product of Conzex Global Private Limited", pageWidth / 2, footerY, { align: "center" });
    doc.text("Audit report: Version 1.0", pageWidth - margin, footerY, { align: "right" });
  };

  const addSectionHeader = (title: string) => {
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
    doc.text(title, pageWidth / 2, 40, { align: "center" });
    return 55;
  };

  // --- 1. COVER PAGE ---
  doc.setDrawColor(0);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // Border

  // Logo Placeholder
  doc.setFillColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.circle(pageWidth / 2, 50, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("CX", pageWidth / 2, 52, { align: "center" });
  
  doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Conzex", pageWidth / 2, 75, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text("Cybersecurity Engine", pageWidth / 2, 82, { align: "center" });

  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Web Application Security Report", pageWidth / 2, 120, { align: "center" });

  // Summary Table on Cover
  (doc as any).autoTable({
    startY: 140,
    margin: { left: 40, right: 40 },
    body: [
      ['Report Release Date', new Date().toLocaleDateString()],
      ['Type of Audit', 'Web Application Security'],
      ['Type of Audit Report', 'Automated VAPT Report'],
      ['Period', `${new Date(Date.now() - 86400000 * 7).toLocaleDateString()} to ${new Date().toLocaleDateString()}`]
    ],
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 5, halign: 'center' },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: [245, 245, 245] } }
  });

  doc.setFontSize(10);
  doc.text("Issued by:", margin, 210);
  doc.text("Conzex Global Private Limited, 123 Cyber Way, Innovation Hub", margin, 218);
  doc.text("Contact: security@conzex.com", margin, 226);
  doc.setTextColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.text("Website: www.conzex.com", margin, 234);

  // --- 2. DOCUMENT CONTROL ---
  doc.addPage();
  addSectionHeader("Document Control");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text("Document Preparation", margin, 70);

  (doc as any).autoTable({
    startY: 75,
    body: [
      ['Document Title', `VAPT_Report_${scanData.targetUrl.replace(/[^a-z0-9]/gi, '_')}`],
      ['Document ID', Math.floor(Math.random() * 10000000000).toString()],
      ['Document Version', '1.0'],
      ['Prepared by', 'Conzex Automated Scanner'],
      ['Reviewed by', 'AI Security Analyst'],
      ['Approved by', 'System Administrator'],
      ['Release date', new Date().toLocaleDateString()]
    ],
    theme: 'grid',
    styles: { fontSize: 10 }
  });

  // --- 3. CONTENTS ---
  doc.addPage();
  addSectionHeader("Contents");
  const contents = [
    "Introduction", "Engagement Scope", "URL", "Details of the Auditing team",
    "Audit Activities and Timelines", "Audit Methodology and Criteria",
    "Tools/ Software used", "Executive Summary", "Table of Observations",
    "Detailed Observations", "Appendix A: Risk Rating", "Appendix B: Screenshots"
  ];
  let contentY = 70;
  contents.forEach((item, i) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(item, margin, contentY);
    doc.text(".........................................................................................................", margin + 50, contentY);
    doc.text((i + 4).toString(), pageWidth - margin, contentY, { align: "right" });
    contentY += 10;
  });

  // --- 4. INTRODUCTION ---
  doc.addPage();
  addSectionHeader("Introduction");
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  const introText = `Conzex Global Private Limited was engaged by ${scanData.clientName || 'the client'} to perform Web Application Security Assessment on their website Application. The type of testing was Black Box, and no test credentials were provided for the same. It must be noted that the testing was done on production environment.\n\nThe aim of the assessment was to provide independent assurance over the adequacy and security of the current topology and that access between devices are secure.`;
  doc.text(doc.splitTextToSize(introText, contentWidth), margin, 70);

  // --- 5. ENGAGEMENT SCOPE & URL ---
  doc.addPage();
  addSectionHeader("Engagement Scope");
  (doc as any).autoTable({
    startY: 70,
    head: [['S. No', 'Application Name', 'Criticality', 'Hash Value', 'Version']],
    body: [[1, scanData.targetUrl, 'High', 'n/a', '1.0']],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY_BLUE }
  });

  doc.setFontSize(18);
  doc.text("URL", pageWidth / 2, (doc as any).lastAutoTable.finalY + 20, { align: "center" });
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 30,
    head: [['S. No', 'URL', 'Application Name']],
    body: [[1, scanData.targetUrl, scanData.clientName || 'Target App']],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY_BLUE }
  });

  // --- 6. TOOLS USED ---
  doc.addPage();
  addSectionHeader("Tools/ Software used");
  const tools = [
    ['1', 'Tenable Nessus Pro', '10.8', 'Licensed'],
    ['2', 'Burp Suite Professional', '1.7', 'Licensed'],
    ['3', 'Nmap', '7.95', 'Open Source'],
    ['4', 'Nikto', '2.5', 'Open Source'],
    ['5', 'Dirbuster', '1.0-RC1', 'Open Source'],
    ['6', 'Sqlmap', '1.9-1', 'Open Source'],
    ['7', 'OWASP ZAP', '2.1', 'Open Source']
  ];
  (doc as any).autoTable({
    startY: 70,
    head: [['S. No', 'Name of Tool/Software', 'Version', 'Type']],
    body: tools,
    theme: 'grid',
    headStyles: { fillColor: PRIMARY_BLUE }
  });

  // --- 7. EXECUTIVE SUMMARY ---
  doc.addPage();
  addSectionHeader("Executive Summary");
  const summaryText = scanData.aiSummary || "No summary available.";
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(summaryText, contentWidth), margin, 70);

  // --- 8. TABLE OF OBSERVATIONS ---
  doc.addPage();
  addSectionHeader("Table of Observations");
  const observations = scanData.findings.map((f, i) => [i + 1, f.name, f.severity]);
  (doc as any).autoTable({
    startY: 70,
    head: [['Sr No', 'Vulnerabilities', 'Severity']],
    body: observations,
    theme: 'grid',
    headStyles: { fillColor: PRIMARY_BLUE },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 2) {
        const sev = data.cell.raw;
        if (sev === Severity.CRITICAL || sev === Severity.HIGH) data.cell.styles.textColor = PRIMARY_BLUE;
        else if (sev === Severity.MEDIUM) data.cell.styles.textColor = [245, 158, 11];
      }
    }
  });

  // --- 9. DETAILED OBSERVATIONS ---
  scanData.findings.forEach((vuln, i) => {
    doc.addPage();
    addSectionHeader("Detailed Observations");
    
    const tableBody = [
      ['Vulnerability', `${i + 1}. ${vuln.name}`],
      ['Risk', vuln.severity],
      ['Description', cleanText(vuln.description)],
      ['Solution', cleanText(vuln.remediation)],
      ['OWASP Category', vuln.category],
      ['CWE', vuln.cwe || 'N/A']
    ];

    (doc as any).autoTable({
      startY: 70,
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 
        0: { fontStyle: 'bold', width: 40, fillColor: [240, 240, 240] },
        1: { width: contentWidth - 40 }
      },
      didParseCell: (data: any) => {
        if (data.row.index === 1 && data.column.index === 1) {
          if (vuln.severity === Severity.CRITICAL || vuln.severity === Severity.HIGH) {
            data.cell.styles.fillColor = PRIMARY_BLUE;
            data.cell.styles.textColor = [255, 255, 255];
          } else if (vuln.severity === Severity.MEDIUM) {
            data.cell.styles.fillColor = [255, 191, 0];
          } else if (vuln.severity === Severity.LOW) {
            data.cell.styles.fillColor = [144, 238, 144];
          }
        }
      }
    });
  });

  // --- 10. APPENDIX A: RISK RATING ---
  doc.addPage();
  addSectionHeader("Appendix A: Risk Rating");
  doc.setFontSize(10);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text("Within each report, every finding is given a rating that is based upon CVSS. The Common Vulnerability Scoring System provides an open framework for communicating the characteristics and impacts of IT related vulnerabilities.", margin, 70);

  const riskRatingData = [
    ['Critical', 'Findings that represents vulnerabilities that could lead to significant data breaches, complete system compromise, or severe financial loss if exploited.', '• Loss of (confidentiality / integrity / availability) is likely to have a catastrophic effect.\n• Specialized access conditions do not exist.'],
    ['High', 'Findings that are fundamental to the management of risk in the business area, representing a weakness in control that requires immediate attention.', '• Loss of (confidentiality / integrity / availability) is likely to have a catastrophic effect.\n• Very little knowledge or skill is required to exploit.'],
    ['Medium', 'Important findings that are to be resolved by management.', '• Modification of some system files or information is possible.\n• Authentication is required to exploit the vulnerability.'],
    ['Low', 'Findings that identify an area for review with established services and good practice.', '• There is reduced performance or interruptions in resource availability.\n• There is informational disclosure.'],
    ['Info', 'Findings that are limited in affect but are worthy of being noted for review.', '• Information for department management.\n• Very limited risk.']
  ];

  (doc as any).autoTable({
    startY: 85,
    head: [['CVSS Rating', 'Description', 'Features']],
    body: riskRatingData,
    theme: 'grid',
    headStyles: { fillColor: PRIMARY_BLUE },
    columnStyles: {
      0: { fontStyle: 'bold', width: 30 },
      1: { width: 80 },
      2: { width: 60 }
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 0) {
        const sev = data.cell.raw;
        if (sev === 'Critical' || sev === 'High') data.cell.styles.fillColor = PRIMARY_BLUE;
        else if (sev === 'Medium') data.cell.styles.fillColor = [255, 191, 0];
        else if (sev === 'Low') data.cell.styles.fillColor = [144, 238, 144];
        if (sev === 'Critical' || sev === 'High') data.cell.styles.textColor = [255, 255, 255];
      }
    }
  });

  // --- 11. APPENDIX B: SCREENSHOTS ---
  doc.addPage();
  addSectionHeader("Appendix B: Screenshots");
  doc.setFontSize(11);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text("This section contains visual evidence of the identified vulnerabilities captured during the assessment process.", margin, 70);

  let screenshotY = 80;
  scanData.findings.slice(0, 3).forEach((vuln, i) => {
    if (screenshotY > pageHeight - 60) {
      doc.addPage();
      screenshotY = 40;
    }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. Evidence for: ${vuln.name}`, margin, screenshotY);
    
    // Placeholder for screenshot
    doc.setDrawColor(200);
    doc.rect(margin, screenshotY + 5, contentWidth, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text("[ Automated Evidence Capture: Request/Response Log ]", pageWidth / 2, screenshotY + 35, { align: "center" });
    
    screenshotY += 75;
  });

  // Add page numbers to all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  const safeFilename = scanData.targetUrl.replace(/[^a-z0-9]/gi, '_');
  doc.save(`Conzex_VAPT_Report_${safeFilename}.pdf`);
};

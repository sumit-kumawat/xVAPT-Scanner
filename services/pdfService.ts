
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ScanResult, Severity } from '../types';

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

  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // Slate-500
    
    const footerY = pageHeight - 15;
    
    // Draw line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    // Footer Text - Removed Email as requested
    doc.text("VAPT Report | Product of Conzex Global Private Limited", margin, footerY);
    doc.text("www.conzex.com", pageWidth / 2, footerY, { align: "center" });
    doc.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: "right" });
  };

  const addHeader = () => {
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("VAPT-AutoScanner Pro", margin, 13);
    doc.setFont("helvetica", "normal");
    doc.text(scanData.date, pageWidth - margin, 13, { align: "right" });
  };

  // --- COVER PAGE ---
  doc.setFillColor(15, 23, 42); // Background
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Center alignment logic
  doc.setTextColor(66, 133, 244); // #4285F4
  doc.setFontSize(36);
  doc.setFont("helvetica", 'bold');
  doc.text("CONFIDENTIAL", pageWidth / 2, 70, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Vulnerability Assessment &", pageWidth / 2, 90, { align: "center" });
  doc.text("Penetration Testing Report", pageWidth / 2, 105, { align: "center" });
  
  // Decorative Line
  doc.setDrawColor(66, 133, 244);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 40, 120, pageWidth / 2 + 40, 120);
  
  doc.setFontSize(14);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.setFont("helvetica", 'normal');
  doc.text(`Target Domain: ${scanData.targetUrl}`, pageWidth / 2, 140, { align: "center" });
  if (scanData.clientName) {
    doc.text(`Client: ${scanData.clientName}`, pageWidth / 2, 150, { align: "center" });
  }
  doc.text(`Scan Date: ${scanData.date}`, pageWidth / 2, 160, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("Prepared by Conzex Security Engine", pageWidth / 2, 250, { align: "center" });
  doc.text("© Conzex Global Private Limited", pageWidth / 2, 255, { align: "center" });

  // --- EXECUTIVE SUMMARY ---
  doc.addPage();
  addHeader();
  addFooter(2);
  
  let yPos = 40;
  
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", 'bold');
  doc.text("1. Executive Summary", margin, yPos);
  
  yPos += 15;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", 'normal');
  doc.setTextColor(51, 65, 85); // Slate-700
  
  const rawSummary = scanData.aiSummary || "No summary generated.";
  const paragraphs = rawSummary.split('\n\n');
  
  paragraphs.forEach((para) => {
    const cleanedPara = cleanText(para);
    const lines = doc.splitTextToSize(cleanedPara, contentWidth);
    
    // Check if we need a new page
    if (yPos + (lines.length * 5) > pageHeight - 40) {
      doc.addPage();
      addHeader();
      addFooter(doc.internal.pages.length - 1);
      yPos = 40;
    }
    
    doc.text(lines, margin, yPos);
    yPos += (lines.length * 5) + 5;
  });

  // --- FINDINGS TABLE ---
  yPos += 10;
  if (yPos > pageHeight - 60) {
      doc.addPage();
      addHeader();
      addFooter(doc.internal.pages.length - 1);
      yPos = 40;
  }
  
  doc.setFontSize(18);
  doc.setFont("helvetica", 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("2. Findings Overview", margin, yPos);
  yPos += 10;

  const tableData = scanData.findings.map(f => [
    f.severity.toUpperCase(),
    f.category,
    cleanText(f.name),
    f.tool
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [['SEVERITY', 'CATEGORY', 'VULNERABILITY', 'TOOL']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
        fillColor: [15, 23, 42], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        halign: 'left'
    },
    styles: { 
        fontSize: 10, 
        cellPadding: 4, 
        valign: 'middle',
        font: "helvetica"
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 30 },
      1: { width: 45 },
      2: { width: 75 },
      3: { width: 30 }
    },
    margin: { bottom: 40 }, // Increased bottom margin to avoid footer overlap
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 0) {
        const sev = data.cell.raw;
        if (sev === 'CRITICAL') data.cell.styles.textColor = [220, 38, 38];
        else if (sev === 'HIGH') data.cell.styles.textColor = [234, 88, 12];
        else if (sev === 'MEDIUM') data.cell.styles.textColor = [202, 138, 4];
        else data.cell.styles.textColor = [59, 130, 246];
      }
    }
  });

  // --- DETAILED FINDINGS ---
  let finalY = (doc as any).lastAutoTable.finalY + 20;

  doc.addPage();
  addHeader();
  addFooter(doc.internal.pages.length - 1);
  finalY = 40;

  doc.setFontSize(18);
  doc.setFont("helvetica", 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("3. Detailed Vulnerability Analysis", margin, finalY);
  finalY += 15;

  scanData.findings.forEach((vuln, index) => {
    // Check if we have enough space for the title block
    if (finalY > pageHeight - 60) {
      doc.addPage();
      addHeader();
      addFooter(doc.internal.pages.length - 1);
      finalY = 40;
    }

    // Vulnerability Header Block
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.rect(margin, finalY, contentWidth, 14, 'FD');

    // Title
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. ${cleanText(vuln.name)}`, margin + 4, finalY + 9);

    // Severity Badge
    const sevColor = vuln.severity === Severity.CRITICAL ? [220, 38, 38] : 
                     vuln.severity === Severity.HIGH ? [234, 88, 12] :
                     vuln.severity === Severity.MEDIUM ? [202, 138, 4] : [59, 130, 246];
    
    doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.text(vuln.severity.toUpperCase(), pageWidth - margin - 4, finalY + 9, { align: 'right' });

    finalY += 20;

    // Content Table
    const contentBody = [
      ['Category', vuln.category],
      ['Tool used', vuln.tool],
      ['CVSS Score', vuln.cvssScore?.toString() || 'N/A'],
      ['Status', vuln.verified ? 'Verified' : 'Pending Verification'],
      ['Description', cleanText(vuln.description)],
      ['Impact', cleanText(vuln.impact || 'Not assessed')],
      ['Remediation', cleanText(vuln.remediation)]
    ];

    (doc as any).autoTable({
      startY: finalY,
      body: contentBody,
      theme: 'plain',
      styles: { 
          fontSize: 10, 
          cellPadding: 3, 
          overflow: 'linebreak',
          font: "helvetica",
          textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { fontStyle: 'bold', width: 35, textColor: [71, 85, 105] }, // Label
        1: { width: 'auto' } // Content
      },
      margin: { left: margin, right: margin, bottom: 40 }, // Increased margin
      pageBreak: 'auto',
      didParseCell: (data: any) => {
          // Style Remediation row
          if (data.row.index === 6 && data.column.index === 1) {
             data.cell.styles.textColor = [21, 128, 61]; // Green-700
             data.cell.styles.fontStyle = 'bold';
          }
      }
    });

    finalY = (doc as any).lastAutoTable.finalY + 15;
  });

  const safeFilename = scanData.targetUrl.replace(/[^a-z0-9]/gi, '_');
  doc.save(`Conzex_VAPT_Report_${safeFilename}.pdf`);
};

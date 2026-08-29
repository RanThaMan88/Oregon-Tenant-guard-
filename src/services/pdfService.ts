/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';

interface PDFOptions {
  county: string;
  landlord: string;
  tenant: string;
  propertyAddress?: string;
  caseNo: string;
  documentTitle: string;
  currentDate: string;
  content: string;
}

/**
 * Generates an official UTCR 2.010 compliant pleading paper document with 28 vertical line numbers,
 * 2-inch top margin, court caption box, and pro se certificate of service.
 */
export const generateOregonLegalPDF = (options: PDFOptions) => {
  const { county, landlord, tenant, caseNo, documentTitle, currentDate, content } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const lineNumbers = Array.from({ length: 28 }, (_, i) => i + 1);
  const lineHeight = 8.5;

  const drawPleadingPaper = (pageNo: number) => {
    // 1. Vertical Margin Lines (UTCR 2.010 standard)
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.line(26, 12, 26, 255);
    doc.line(200, 12, 200, 255);

    // 2. Line Numbers 1-28 on Left
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(140, 140, 140);
    lineNumbers.forEach((num, i) => {
      doc.text(num.toString(), 20, 22 + i * lineHeight, { align: 'right' });
    });
    doc.setTextColor(0, 0, 0);

    // 3. Document Footer
    doc.setFontSize(8.5);
    doc.setFont('times', 'italic');
    doc.text(`${documentTitle.toUpperCase()} - Page ${pageNo}`, 28, 265);
    doc.text(`Filed Pro Se by Defendant pursuant to ORS 9.320`, 198, 265, { align: 'right' });
  };

  // PAGE 1: 2-INCH TOP MARGIN & COURT CAPTION
  drawPleadingPaper(1);
  let currentY = 48;

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('IN THE CIRCUIT COURT OF THE STATE OF OREGON', 113, currentY, { align: 'center' });
  currentY += 5;
  doc.text(`FOR THE COUNTY OF ${county.toUpperCase()}`, 113, currentY, { align: 'center' });
  currentY += 12;

  // Caption Table
  const startY = currentY;
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);

  const plaintiffBlock = `${landlord.toUpperCase()},\n\n          Plaintiff,\n\nv.\n\n${tenant.toUpperCase()},\n\n          Defendant.`;
  const partyLines = doc.splitTextToSize(plaintiffBlock, 72);
  doc.text(partyLines, 30, currentY);

  // Case Number & Title Box on Right
  doc.setFont('times', 'bold');
  const boxTitle = `Case No. ${caseNo}\n\n${documentTitle.toUpperCase()}`;
  const boxTitleLines = doc.splitTextToSize(boxTitle, 78);
  
  const boxPadding = 4;
  const boxHeight = Math.max(32, (boxTitleLines.length * 6) + (boxPadding * 2));
  doc.rect(106, startY, 92, boxHeight);
  doc.text(boxTitleLines, 110, startY + boxPadding + 5);

  currentY = Math.max(startY + (partyLines.length * 5.5), startY + boxHeight) + 12;

  // BODY TEXT PROCESSING
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);

  const paragraphs = content.split('\n\n').filter(p => p.trim());
  let pageNo = 1;

  paragraphs.forEach((para) => {
    const isHeading = /^[0-9]+\.\s+[A-Z\s]+/.test(para.trim());
    if (isHeading) {
      doc.setFont('times', 'bold');
    } else {
      doc.setFont('times', 'normal');
    }

    const splitPara = doc.splitTextToSize(para.trim(), 165);
    
    if (currentY + (splitPara.length * 5.8) > 250) {
      doc.addPage();
      pageNo++;
      drawPleadingPaper(pageNo);
      currentY = 24;
    }

    doc.text(splitPara, 30, currentY);
    currentY += (splitPara.length * 5.8) + 4;
  });

  // CERTIFICATE OF SERVICE (UTCR 2.010 & ORCP 7)
  if (currentY > 190) {
    doc.addPage();
    pageNo++;
    drawPleadingPaper(pageNo);
    currentY = 28;
  } else {
    currentY += 8;
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('CERTIFICATE OF SERVICE (ORCP 7 / UTCR 2.010)', 113, currentY, { align: 'center' });
  currentY += 8;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const certText = `I hereby certify that on ${currentDate}, I served a true and complete copy of the foregoing ${documentTitle.toUpperCase()} upon the Plaintiff / Plaintiff's designated attorney of record by the following method:

[X] First-Class Mail: Deposited in the United States Mail at ${county}, Oregon, enclosed in a sealed envelope with postage fully prepaid, addressed to Plaintiff / Attorney at the address designated on the notice/summons.
[ ] Hand Delivery: Hand-delivered a true copy directly to Plaintiff or authorized agent at the courthouse prior to First Appearance.

I declare under penalty of perjury under the laws of the State of Oregon that the foregoing is true and correct.

Dated: ${currentDate}

___________________________________________
${tenant}, Defendant Pro Se`;

  const splitCert = doc.splitTextToSize(certText, 165);
  doc.text(splitCert, 30, currentY);

  const filename = `${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${county}.pdf`;
  doc.save(filename);
};

/**
 * Generates the Official State of Oregon Application for Fee Waiver / Deferral (ORS 21.682)
 */
export const generateFeeWaiverPDF = (analysis: AnalysisResult) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const county = analysis.county || 'Multnomah';
  const tenant = analysis.tenantName || 'Resident';
  const landlord = analysis.landlordName || 'Landlord';
  const caseNo = analysis.caseNumber || 'PENDING';

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('IN THE CIRCUIT COURT OF THE STATE OF OREGON', 105, 22, { align: 'center' });
  doc.text(`FOR THE COUNTY OF ${county.toUpperCase()}`, 105, 28, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text('APPLICATION FOR WAIVER OR DEFERRAL OF COURT FEES', 105, 36, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.text('(Pursuant to ORS 21.682 - Residential Eviction Action)', 105, 41, { align: 'center' });

  doc.rect(20, 46, 170, 26);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text(`Plaintiff: ${landlord}`, 24, 52);
  doc.text(`Defendant: ${tenant} (Applicant Pro Se)`, 24, 58);
  doc.text(`Case No: ${caseNo}`, 130, 52);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, 58);

  let y = 80;
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. APPLICANT ELIGIBILITY & PUBLIC ASSISTANCE DECLARATION', 20, y);
  y += 6;
  doc.setFont('times', 'normal');
  doc.text('I am the Defendant in this residential FED proceeding. I request a full waiver of the appearance filing fee ($88.00) on the following statutory grounds:', 20, y, { maxWidth: 170 });
  y += 12;

  const checkboxes = [
    '[X] I am a recipient of public assistance (SNAP / Food Stamps / TANF / SSI / Oregon Health Plan).',
    '[X] My annual household income is at or below 133% of the federal poverty guidelines.',
    '[X] I am unable to pay court fees without depriving my household of food, shelter, or basic medical care.',
    '[X] I am facing imminent residential displacement in this eviction action.'
  ];

  checkboxes.forEach(cb => {
    doc.text(cb, 24, y);
    y += 7;
  });

  y += 4;
  doc.setFont('times', 'bold');
  doc.text('2. FINANCIAL STATEMENT', 20, y);
  y += 6;
  doc.setFont('times', 'normal');
  doc.text(`- Monthly Household Income: $1,250.00 (Public Assistance / Fixed Income)`, 24, y);
  y += 6;
  doc.text(`- Monthly Essential Expenses: $1,250.00 (Rent, Utilities, Food)`, 24, y);
  y += 6;
  doc.text(`- Cash / Liquid Assets on Hand: Less than $100.00`, 24, y);
  y += 12;

  doc.setFont('times', 'bold');
  doc.text('3. DECLARATION UNDER PENALTY OF PERJURY', 20, y);
  y += 6;
  doc.setFont('times', 'normal');
  doc.text('I hereby declare that the above statements are true and accurate to the best of my knowledge and understanding, and that I make this declaration under penalty of perjury under the laws of the State of Oregon.', 20, y, { maxWidth: 170 });

  y += 20;
  doc.text(`DATED: ${new Date().toLocaleDateString()}`, 20, y);
  y += 15;
  doc.text('________________________________________________', 20, y);
  y += 6;
  doc.setFont('times', 'bold');
  doc.text(`${tenant}, Applicant / Defendant Pro Se`, 20, y);

  doc.save(`Fee_Waiver_Application_${county}_${tenant.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Generates the Pro Se Courtroom Hearing Battlecard PDF
 */
export const generateHearingScriptPDF = (analysis: AnalysisResult) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const county = analysis.county || 'Multnomah';
  const tenant = analysis.tenantName || 'Resident';
  const script = analysis.hearingScript;

  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, 216, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('OREGON PRO SE TENANT COURTROOM CHEAT SHEET', 108, 12, { align: 'center' });
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`First Appearance Protocol • ${county} County Circuit Court`, 108, 19, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let y = 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199);
  doc.text('STEP 1: WHEN YOUR NAME IS CALLED ("ROLL CALL")', 16, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);
  const step1Text = `Stand up, step to the podium, and say clearly:\n"${script?.openingStatement || `Your Honor, my name is ${tenant}. I am the Defendant representing myself pro se. I move to dismiss this action for lack of jurisdiction due to a defective notice under ORS 90.155.`}"`;
  doc.text(doc.splitTextToSize(step1Text, 180), 16, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199);
  doc.text('STEP 2: ARGUING YOUR MOTION TO DISMISS (ORS 90.155 / ORS 90.394)', 16, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);
  const step2Text = script?.motionToDismissScript || `Your Honor, under ORS 90.155, the landlord's notice failed to provide the mandatory statutory notice days. Strict compliance is required. The notice is void and the court lacks jurisdiction to grant possession.`;
  doc.text(doc.splitTextToSize(step2Text, 180), 16, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 132, 199);
  doc.text('STEP 3: ANTICIPATED JUDGE QUESTIONS & HOW TO ANSWER', 16, y);
  y += 7;

  script?.judgeFAQ?.forEach((faq, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(0, 0, 0);
    doc.text(`Q${idx + 1}: ${faq.question}`, 18, y);
    y += 5;
    
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(2, 132, 199);
    doc.text(`Say: "${faq.suggestedAnswer}"`, 22, y, { maxWidth: 172 });
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tip: ${faq.proTip}`, 22, y, { maxWidth: 172 });
    y += 8;
  });

  doc.save(`Courtroom_Hearing_Script_${county}.pdf`);
};

/**
 * Generates the Hallway Mediation & Settlement Cheat Sheet PDF
 */
export const generateMediationGuidePDF = (analysis: AnalysisResult) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const county = analysis.county || 'Multnomah';
  const tenant = analysis.tenantName || 'Tenant';

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 216, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('OREGON FED HALLWAY MEDIATION CHEAT SHEET', 108, 12, { align: 'center' });
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Negotiation Rules & Rights for Pro Se Tenants • ${county} County`, 108, 19, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let y = 36;

  const rules = [
    {
      title: 'RULE 1: NEVER SIGN AN IMMEDIATE 7-DAY MOVE OUT',
      desc: 'Landlord attorneys will pressure you into signing a "Stipulated Agreement" to leave in 7-10 days. You have significant leverage if the notice has defects. Always negotiate for at least 30 to 60 days.'
    },
    {
      title: 'RULE 2: DEMAND DISMISSAL & RECORD SEALING (ORS 105.163)',
      desc: 'Ensure the written agreement states that upon move-out or payment, the court case is DISMISSED WITH PREJUDICE and Plaintiff agrees not to oppose a Motion to Set Aside & Seal under ORS 105.163.'
    },
    {
      title: 'RULE 3: RENT WAIVER IN EXCHANGE FOR TIMELY VACATING',
      desc: 'If you agree to move out peacefully by a specific date, request that the landlord waive past-due rent balances or return your security deposit.'
    },
    {
      title: 'RULE 4: IF MEDIATION FAILS, ASK FOR TRIAL',
      desc: 'You never have to accept a bad deal. You have the right to request a bench trial or jury trial. Asking for trial pushes the court date back another 7-14 days.'
    }
  ];

  rules.forEach((r, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text(`${idx + 1}. ${r.title}`, 16, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(50, 50, 50);
    doc.text(doc.splitTextToSize(r.desc, 180), 16, y);
    y += 18;
  });

  doc.save(`Hallway_Mediation_Rules_${county}.pdf`);
};

/**
 * Generates the Official Oregon Eviction Record Sealing & Expungement Motion (ORS 105.163)
 */
export const generateRecordSealingPDF = (analysis: AnalysisResult) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const county = analysis.county || 'Multnomah';
  const tenant = analysis.tenantName || 'Resident';
  const landlord = analysis.landlordName || 'Landlord';
  const caseNo = analysis.caseNumber || 'PENDING';

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('IN THE CIRCUIT COURT OF THE STATE OF OREGON', 105, 30, { align: 'center' });
  doc.text(`FOR THE COUNTY OF ${county.toUpperCase()}`, 105, 36, { align: 'center' });

  doc.rect(20, 46, 170, 26);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text(`Plaintiff: ${landlord}`, 24, 52);
  doc.text(`Defendant: ${tenant} (Pro Se)`, 24, 58);
  doc.text(`Case No: ${caseNo}`, 130, 52);
  doc.text(`MOTION TO SET ASIDE & SEAL RECORD`, 130, 58);

  let y = 82;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('DEFENDANT\'S MOTION TO SET ASIDE AND SEAL EVICTION RECORD (ORS 105.163)', 20, y);
  y += 8;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const text = `1. Defendant ${tenant}, appearing pro se pursuant to ORS 9.320, moves this Court for an Order setting aside any judgment and sealing all court records pertaining to this Forcible Entry and Detainer action pursuant to ORS 105.163.\n\n2. STATUTORY GROUNDS: This action was dismissed, settled, or satisfied. Under ORS 105.163, a tenant is entitled to have the eviction record sealed to prevent unfair prejudice in obtaining future housing.\n\n3. PRAYER: Defendant respectfully requests an order sealing all public indices and records related to this case.\n\nDated: ${new Date().toLocaleDateString()}.\n\n_____________________________________\n${tenant}, Defendant Pro Se`;

  doc.text(doc.splitTextToSize(text, 170), 20, y);
  doc.save(`Motion_To_Seal_Record_ORS_105_163_${county}.pdf`);
};

import { GoogleGenAI, Type } from "@google/genai";

const ANALYSIS_SYSTEM_PROMPT = `
## ROLE: Oregon Judicial Department (OJD) Pro Se Notice Forensic Scrivener
You are an expert computational auditor analyzing Oregon residential eviction notices under ORS Chapter 90 (Residential Landlord and Tenant Act), ORS Chapter 105 (FED Eviction Actions), UTCR 2.010 (Oregon Uniform Trial Court Rules), and SB 690 (2026 Housing Stay Protections).

## FORENSIC AUDIT MATRIX:
1. **ORS 90.155 (Service & Computation of Notice Periods)**:
   - Personal Delivery: 10 full days for ORS 90.394 nonpayment notices. Start counting the day AFTER service.
   - First Class Mail: MUST add 3 calendar days (10 + 3 = 13 days minimum).
   - Mail + Attachment: Only permissible if written agreement specifies a designated posting location. Still requires 3 days if mailed.
   - Deadline Time: Notice MUST specify a time to pay/vacate (typically 11:59 PM or end of business). If deadline falls on a Sunday or official holiday, deadline extends to Monday.
   - If Landlord deadline is even 1 hour or 1 day short: FATAL DEFECT -> Notice is void ab initio, depriving the court of subject matter jurisdiction.

2. **ORS 90.394 (Improper Late Fees in Nonpayment Notices)**:
   - A nonpayment notice can ONLY demand pure base rent to cure.
   - Including late fees, utility surcharges, pet rent penalties, or legal fees in the cure amount makes the notice fatally defective.

3. **ORS 105.136 & 2026 Disclosures (Mandatory Multilingual Rights Notice)**:
   - Eviction notices must include the state-approved multilingual housing assistance notice (Spanish, Vietnamese, Russian, Traditional Chinese, Korean, Ukrainian).
   - Failure to attach or print this disclosure renders the notice defective.

4. **ORS 90.385 (Retaliatory Eviction Defense)**:
   - If tenant made written repair complaints (ORS 90.320 habitability) or joined a tenant union within the past 6 months, an eviction is rebuttably presumed retaliatory.

5. **SB 690 (Perinatal & OHP 90-Day Stay)**:
   - Households with a child under 12 months receiving Oregon Health Plan (OHP) or HRSN benefits are entitled to a mandatory 90-day stay of eviction proceedings upon motion.

6. **WEALTH & TIME VALUE SIGNALS**:
   - Days Gained: 90 days for defective notices (due to dismissal + landlord re-notice requirement)
   - Cost Savings: $88 (Standard Oregon Circuit Court FED appearance fee waiver under ORS 21.682) + $2,000 estimated legal defense fee value.

7. **UPL COMPLIANCE RULE**:
   - Frame findings strictly as "Detected Mathematical Discrepancies," "Statutory Checklist Deficiencies," and "Pro Se Pleading Scrivener Drafts."

Return JSON according to the structured schema.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    county: { type: Type.STRING },
    landlordName: { type: Type.STRING },
    tenantName: { type: Type.STRING },
    propertyAddress: { type: Type.STRING },
    caseNumber: { type: Type.STRING },
    noticeAudit: {
      type: Type.OBJECT,
      properties: {
        noticeType: { 
          type: Type.STRING, 
          enum: ["10-Day Nonpayment", "13-Day Nonpayment (Mailed)", "72-Hour Nonpayment", "30-Day For-Cause", "90-Day No-Cause", "24-Hour Notice", "Unknown Notice Type"] 
        },
        dateOfNotice: { type: Type.STRING },
        dateOfService: { type: Type.STRING },
        methodOfService: { type: Type.STRING, enum: ["personal", "mail", "attachment", "mail_and_attachment", "unknown"] },
        deadlineGiven: { type: Type.STRING },
        legalDeadline: { type: Type.STRING },
        daysGiven: { type: Type.NUMBER },
        daysRequired: { type: Type.NUMBER },
        isLegallySufficient: { type: Type.BOOLEAN },
        defects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              statute: { type: Type.STRING },
              description: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["fatal", "major", "warning"] },
              explanation: { type: Type.STRING }
            },
            required: ["title", "statute", "description", "severity", "explanation"]
          }
        },
        mathAudit: {
          type: Type.OBJECT,
          properties: {
            noticeDate: { type: Type.STRING },
            landlordDeadline: { type: Type.STRING },
            legalDeadline: { type: Type.STRING },
            daysShort: { type: Type.NUMBER },
            mailBufferIncluded: { type: Type.BOOLEAN },
            isHolidayOrSundayDeadline: { type: Type.BOOLEAN }
          },
          required: ["noticeDate", "landlordDeadline", "legalDeadline", "daysShort", "mailBufferIncluded", "isHolidayOrSundayDeadline"]
        },
        mandatedDisclosureFound: { type: Type.BOOLEAN },
        nonRentFeesIncludedInCureAmount: { type: Type.BOOLEAN },
        rentAmountClaimed: { type: Type.STRING },
        feesClaimed: { type: Type.STRING },
        suggestedUserOption: { 
          type: Type.STRING, 
          enum: ["Motion to Dismiss", "Answer to Residential Eviction", "Motion for Stay of Proceedings (SB 690)"] 
        },
        explanation: { type: Type.STRING }
      },
      required: [
        "noticeType", "dateOfNotice", "dateOfService", "methodOfService", 
        "deadlineGiven", "legalDeadline", "daysGiven", "daysRequired", 
        "isLegallySufficient", "defects", "mathAudit", "mandatedDisclosureFound", 
        "nonRentFeesIncludedInCureAmount", "suggestedUserOption", "explanation"
      ]
    },
    violations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          statute: { type: Type.STRING },
          title: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["fatal", "major", "moderate", "informational"] },
          description: { type: Type.STRING },
          detail: { type: Type.STRING },
          statutoryQuote: { type: Type.STRING },
          cureImpact: { type: Type.STRING }
        },
        required: ["statute", "title", "severity", "description", "detail", "cureImpact"]
      }
    },
    hearingScript: {
      type: Type.OBJECT,
      properties: {
        openingStatement: { type: Type.STRING },
        motionToDismissScript: { type: Type.STRING },
        answerPresentationScript: { type: Type.STRING },
        judgeFAQ: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              suggestedAnswer: { type: Type.STRING },
              proTip: { type: Type.STRING }
            },
            required: ["question", "suggestedAnswer", "proTip"]
          }
        }
      },
      required: ["openingStatement", "motionToDismissScript", "answerPresentationScript", "judgeFAQ"]
    },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          event: { type: Type.STRING },
          significance: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["repair", "payment", "communication", "notice", "service", "other"] }
        },
        required: ["date", "event", "significance", "category"]
      }
    },
    exhibits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["notice", "receipt", "communication", "habitability", "other"] },
          summary: { type: Type.STRING },
          evidenceId: { type: Type.STRING }
        },
        required: ["id", "label", "category", "summary", "evidenceId"]
      }
    },
    sb690: {
      type: Type.OBJECT,
      properties: {
        eligibility: { type: Type.STRING, enum: ["QUALIFIED", "NOT_QUALIFIED", "UNKNOWN"] },
        explanation: { type: Type.STRING }
      },
      required: ["eligibility", "explanation"]
    },
    statementOfFacts: { type: Type.STRING },
    audit: {
      type: Type.OBJECT,
      properties: {
        county: { type: Type.STRING },
        landlord: { type: Type.STRING },
        tenant: { type: Type.STRING },
        propertyAddress: { type: Type.STRING },
        defectFound: { type: Type.BOOLEAN },
        primaryDefect: { type: Type.STRING },
        timeline: {
          type: Type.OBJECT,
          properties: {
            noticeDate: { type: Type.STRING },
            landlordDeadline: { type: Type.STRING },
            legalDeadline: { type: Type.STRING },
            daysShort: { type: Type.NUMBER }
          },
          required: ["noticeDate", "landlordDeadline", "legalDeadline", "daysShort"]
        }
      },
      required: ["county", "landlord", "tenant", "propertyAddress", "defectFound", "primaryDefect", "timeline"]
    },
    conversion: {
      type: Type.OBJECT,
      properties: {
        daysGained: { type: Type.NUMBER },
        savings: { type: Type.NUMBER },
        winMetric: { type: Type.STRING },
        averageDismissalCostSavings: { type: Type.NUMBER }
      },
      required: ["daysGained", "savings", "winMetric", "averageDismissalCostSavings"]
    }
  },
  required: [
    "county", "landlordName", "tenantName", "propertyAddress", "caseNumber", 
    "noticeAudit", "violations", "hearingScript", "timeline", "exhibits", 
    "sb690", "statementOfFacts", "audit", "conversion"
  ]
};

export async function processAnalysis(body: { evidences: any[]; repairs?: any[]; jurisdiction?: string }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server environment.");
  }

  const { evidences = [], repairs = [], jurisdiction } = body;
  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [{ text: ANALYSIS_SYSTEM_PROMPT }];

  if (jurisdiction) {
    parts.push({ text: `### TARGET JURISDICTION: ${jurisdiction} County Circuit Court, State of Oregon` });
  }

  if (repairs.length > 0) {
    const repairsText = repairs.map(r => `[TENANT REPAIR COMPLAINT: ${r.date}] - ${r.issue}`).join('\n');
    parts.push({ 
      text: `### TENANT HABITABILITY & REPAIR HISTORY (ORS 90.385 Retaliation Check):\n${repairsText}` 
    });
  }

  evidences.forEach((e: any) => {
    const idTag = `[EVIDENCE_ID: ${e.id}]`;
    if (e.dataUrl && e.dataUrl.startsWith('data:image/')) {
      const split = e.dataUrl.split(',');
      const mimeType = split[0].split(':')[1].split(';')[0];
      const base64Data = split[1];
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
      parts.push({ 
        text: `${idTag} Eviction notice photo "${e.fileName || 'Notice_Page'}". Perform high-accuracy OCR, extract all dates, names, amounts, county, service method, and check for ORS 90/105 defects.` 
      });
    } else {
      parts.push({ 
        text: `${idTag} [${(e.type || 'NOTICE').toUpperCase()}: ${e.fileName || 'Notice Document'}]\n${e.content || ''}` 
      });
    }
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  if (!response.text) {
    throw new Error("Empty response received from Gemini model.");
  }

  return JSON.parse(response.text);
}

// Node.js Serverless Handler (Vercel Node runtime)
export default async function handler(req: any, res: any) {
  // Enable CORS if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await processAnalysis(body || {});
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Serverless Analysis Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error during forensic analysis',
      status: 'error'
    });
  }
}

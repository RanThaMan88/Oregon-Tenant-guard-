/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum EvidenceType {
  EMAIL = 'email',
  NOTICE = 'notice',
  RECEIPT = 'receipt',
  TEXT = 'text',
  PHOTO = 'photo',
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  fileName?: string;
  content: string;
  dataUrl?: string; // For images / camera capture
  timestamp: number;
}

export interface TimelineItem {
  date: string;
  event: string;
  significance: string;
  category?: 'repair' | 'payment' | 'communication' | 'notice' | 'service' | 'other';
}

export interface StatutoryViolation {
  statute: string;
  title: string;
  severity: 'fatal' | 'major' | 'moderate' | 'informational';
  description: string;
  detail: string;
  statutoryQuote?: string;
  cureImpact: string; // e.g. "Renders eviction notice void as a matter of law"
}

export interface DefectItem {
  title: string;
  statute: string;
  description: string;
  severity: 'fatal' | 'major' | 'warning';
  explanation: string;
}

export interface NoticeAudit {
  noticeType: '10-Day Nonpayment' | '13-Day Nonpayment (Mailed)' | '72-Hour Nonpayment' | '30-Day For-Cause' | '90-Day No-Cause' | '24-Hour Notice' | 'Unknown Notice Type';
  dateOfNotice: string;
  dateOfService: string;
  methodOfService: 'personal' | 'mail' | 'attachment' | 'mail_and_attachment' | 'unknown';
  deadlineGiven: string;
  legalDeadline: string;
  daysGiven: number;
  daysRequired: number;
  isLegallySufficient: boolean;
  defects: DefectItem[];
  mathAudit: {
    noticeDate: string;
    landlordDeadline: string;
    legalDeadline: string;
    daysShort: number;
    mailBufferIncluded: boolean;
    isHolidayOrSundayDeadline: boolean;
  };
  mandatedDisclosureFound: boolean; // ORS 105.136 Multilingual notice
  nonRentFeesIncludedInCureAmount: boolean; // ORS 90.394 violation if true
  rentAmountClaimed?: string;
  feesClaimed?: string;
  suggestedUserOption: 'Motion to Dismiss' | 'Answer to Residential Eviction' | 'Motion for Stay of Proceedings (SB 690)';
  explanation: string;
}

export interface HearingScript {
  openingStatement: string;
  motionToDismissScript: string;
  answerPresentationScript: string;
  judgeFAQ: {
    question: string;
    suggestedAnswer: string;
    proTip: string;
  }[];
}

export interface DefenseData {
  habitabilityIssues: string[];
  retaliationClaim: boolean;
  retaliationDate?: string;
  retaliationIssue?: string;
  rentalAssistancePending: boolean;
  assistanceApplicationDate?: string;
  factualClaims: string[];
  perinatalHousehold: boolean; // Child under 12 months (SB 690)
  receivesOHP: boolean; // OHP or HRSN
  lowIncomeForFeeWaiver: boolean; // For fee waiver request (ORS 21.682)
  otherDefenses: string;
}

export interface FeeWaiverData {
  monthlyIncome: number;
  monthlyExpenses: number;
  householdSize: number;
  publicAssistance: string[];
  eligible: boolean;
}

export interface Exhibit {
  id: string;
  label: string; // "Exhibit A", "Exhibit B"
  category: 'notice' | 'receipt' | 'communication' | 'habitability' | 'other';
  summary: string;
  evidenceId: string;
}

export interface RetaliationAudit {
  isTriggered: boolean;
  explanation: string;
  supportingEvidenceIds: string[];
}

export interface WealthMetrics {
  daysGained: number;
  savings: number;
  winMetric: string;
  averageDismissalCostSavings: number;
}

export interface MandatoryAudit {
  county: string;
  landlord: string;
  tenant: string;
  propertyAddress?: string;
  defectFound: boolean;
  primaryDefect: string;
  timeline: {
    noticeDate: string;
    landlordDeadline: string;
    legalDeadline: string;
    daysShort: number;
  };
}

export interface AnalysisResult {
  landlordName: string;
  tenantName: string;
  propertyAddress?: string;
  caseNumber?: string;
  county: string;
  noticeAudit: NoticeAudit;
  timeline: TimelineItem[];
  violations: StatutoryViolation[];
  exhibits: Exhibit[];
  hearingScript: HearingScript;
  statementOfFacts: string;
  retaliationAudit?: RetaliationAudit;
  sb690?: {
    eligibility: 'QUALIFIED' | 'NOT_QUALIFIED' | 'UNKNOWN';
    explanation: string;
  };
  audit: MandatoryAudit;
  conversion: WealthMetrics;
}

export interface SavedCase {
  id: string;
  timestamp: number;
  jurisdiction: string;
  landlordName?: string;
  tenantName?: string;
  propertyAddress?: string;
  result: AnalysisResult;
  status: 'active' | 'closed';
  isPaid?: boolean;
}

export interface LegalResource {
  name: string;
  phone: string;
  url: string;
  counties: string[];
  type: 'legal_aid' | 'advocacy' | 'mediation' | 'court_help';
}

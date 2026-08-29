/**
 * Oregon Tenant Guard - Consolidated Terms of Service & Privacy Policy
 * Compliant with:
 * - Oregon Consumer Privacy Act (OCPA / ORS 646A.570 - 646A.589)
 * - Oregon State Bar Standards & ORS 9.160 / ORS 9.320 (Pro Se Scrivener)
 * - Oregon Unlawful Trade Practices Act (ORS 646.608)
 * - FTC Guidelines on AI Transparency & Digital Subscriptions
 * - 988 Suicide & Crisis Lifeline Disclosures
 */

export const TERMS_OF_SERVICE = {
  effectiveDate: 'January 1, 2026',
  lastUpdated: 'August 2026',
  version: '2026.2.1',
  title: 'Terms of Service & Scrivener Agreement',
  sections: [
    {
      heading: '1. Acceptance of Terms & Pro Se Representation (ORS 9.320)',
      content: `By accessing, viewing, scanning documents with, or utilizing the Oregon Tenant Guard application ("TenantGuard", "we", "us", or "our"), you ("User", "Tenant", or "Defendant") expressly agree to be bound by these Terms of Service. If you do not agree to all terms, do not use the application. Under Oregon law (ORS 9.320), natural persons have the sovereign right to represent themselves ("pro se") in legal actions. TenantGuard serves exclusively as a self-help automated document preparation and computational scrivener service for individuals exercising their statutory pro se rights.`
    },
    {
      heading: '2. Non-Attorney / Pure Scrivener Disclosure (ORS 9.160)',
      content: `TENANTGUARD IS NOT A LAW FIRM, DOES NOT EMPLOY LICENSED ATTORNEYS TO REPRESENT USERS, DOES NOT PRACTICE LAW IN THE STATE OF OREGON OR ANY OTHER JURISDICTION, AND DOES NOT PROVIDE LEGAL ADVICE, STRATEGIC LEGAL COUNSEL, OR OPINIONS. 

Our technology performs automated mathematical computations (such as the 13-day mailing timeline required by ORS 90.155) and mechanically transcribes user-supplied factual data onto standard, publicly accessible judicial forms (pursuant to Uniform Trial Court Rule UTCR 2.010). Communications between you and TenantGuard are governed by our Privacy Policy but are NOT protected by attorney-client privilege or work product immunity.`
    },
    {
      heading: '3. User Responsibility for Factual Verification (ORCP 17)',
      content: `Under Oregon Rules of Civil Procedure (ORCP 17), any party signing a pleading or motion certifies to the court that the factual assertions are true and supported by evidence. You acknowledge and agree that:
(a) You must personally review and verify all names, dates, rent amounts, service methods, and notice terms generated in any document before signing or filing;
(b) You assume sole legal responsibility for all documents submitted to any Oregon Circuit Court;
(c) TenantGuard is not liable for typographical errors, misinterpretations, or factual inaccuracies inputted by the user.`
    },
    {
      heading: '4. No Guarantee of Judicial Outcome (ORS 646.608 UTPA)',
      content: `In compliance with the Oregon Unlawful Trade Practices Act (ORS 646.608), TenantGuard makes no representations, warranties, or guarantees—express or implied—that any eviction notice will be dismissed, that any landlord will settle, or that any judge will rule in your favor. Judicial decisions in Oregon Forcible Entry and Wrongful Detainer (FED) proceedings rest solely within the discretionary authority of the presiding circuit court judge.`
    },
    {
      heading: '5. Digital Purchases, Pricing & Refund Policy',
      content: `Document download packages (Standard Defense Pack $29.00; Fast-Track Defense Pack $49.00) provide immediate access to digital document formatting tools. We provide a 100% money-back guarantee if an Oregon Circuit Court clerk rejects your generated document due to a formatting defect under UTCR 2.010. Refund requests may be submitted within 30 days of purchase.`
    },
    {
      heading: '6. Crisis Intervention & Limitation of Liability',
      content: `Eviction proceedings are acute life events. TenantGuard provides reference links to the National Suicide & Crisis Lifeline (988), Lines for Life Oregon, and 211info. TenantGuard and its operators shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your use of the service or the outcome of your landlord-tenant dispute.`
    }
  ]
};

export const PRIVACY_POLICY = {
  effectiveDate: 'January 1, 2026',
  lastUpdated: 'August 2026',
  version: '2026.2.1',
  title: 'Privacy Policy (Oregon Consumer Privacy Act Compliant)',
  sections: [
    {
      heading: '1. Scope & Commitment to Privacy',
      content: `This Privacy Policy governs the collection, use, processing, and protection of consumer data across Oregon Tenant Guard in accordance with the Oregon Consumer Privacy Act (OCPA, ORS 646A.570 et seq.), the Federal Trade Commission Act (15 U.S.C. § 45), and applicable data privacy standards.`
    },
    {
      heading: '2. Information We Collect & In-Session Processing',
      content: `We collect only the minimum data necessary to perform notice audits and document transcription:
• Notice Images & Document Scans: Uploaded or captured notice photos are processed in temporary, secure execution sessions to perform optical character recognition (OCR) and date calculation.
• Case Metadata: County jurisdiction, tenant name, landlord name, and notice dates inputted by the user.
• Payment Information: Payment card processing is handled directly by Stripe. TenantGuard does not store full credit card numbers or CVV codes on our servers.`
    },
    {
      heading: '3. Prohibition on Selling Data & AI Training',
      content: `WE DO NOT SELL, RENT, OR MONETIZE YOUR PERSONAL DATA, EVIDENCES, OR NOTICE SCANS UNDER ANY CIRCUMSTANCES.
Notice uploads and user facts are never used to train public generative AI foundation models, nor are they shared with landlords, property managers, collection agencies, or data brokers.`
    },
    {
      heading: '4. Consumer Rights Under the Oregon Consumer Privacy Act (OCPA)',
      content: `Under ORS 646A.576, Oregon consumers possess the following enforceable statutory rights:
(a) Right of Access & Confirmation: The right to confirm whether we process your personal data and to access that data.
(b) Right to Correction: The right to correct inaccuracies in your personal data.
(c) Right to Deletion: The right to delete all personal data provided by or obtained about you.
(d) Right to Opt-Out: The right to opt-out of targeted advertising, data sales, or profiling with legal effects. (TenantGuard does not engage in data sales or profiling).
(e) Non-Discrimination: We will never deny services, charge different prices, or provide inferior service for exercising your privacy rights.`
    },
    {
      heading: '5. Data Retention & Local Storage Architecture',
      content: `Case history and draft pleadings are stored locally on your device's browser (LocalStorage/IndexedDB) whenever possible. You may clear your saved cases, audit history, and cached documents at any time by clicking the "Delete Case" button on your dashboard or clearing your browser cache.`
    },
    {
      heading: '6. Contact & Privacy Inquiries',
      content: `To exercise your OCPA privacy rights, request data deletion, or submit questions regarding this policy, contact our compliance team at privacy@oregontenantguard.org.`
    }
  ]
};

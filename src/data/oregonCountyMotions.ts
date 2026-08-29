/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MotionStructure {
  name: string;
  description: string;
  requiredFields: string[];
  utcrReference?: string;
  orsReference?: string;
}

export interface CountyLegalInfo {
  name: string;
  slrReference?: string;
  customMotions?: MotionStructure[];
  defaultsToStatewide: boolean;
}

export const OREGON_COUNTIES: CountyLegalInfo[] = [
  { name: "Baker", defaultsToStatewide: true },
  { name: "Benton", defaultsToStatewide: true, slrReference: "Chapter 9" },
  { 
    name: "Clackamas", 
    defaultsToStatewide: true,
    slrReference: "Chapter 9",
    customMotions: [
      {
        name: "Motion for Mediation",
        description: "Request for court-facilitated mediation under Clackamas SLR 9.081",
        requiredFields: ["Case Number", "Parties"],
        orsReference: "ORS 36.185"
      }
    ]
  },
  { name: "Clatsop", defaultsToStatewide: true },
  { name: "Columbia", defaultsToStatewide: true },
  { name: "Coos", defaultsToStatewide: true },
  { name: "Crook", defaultsToStatewide: true },
  { name: "Curry", defaultsToStatewide: true },
  { name: "Deschutes", defaultsToStatewide: true, slrReference: "Chapter 9" },
  { name: "Douglas", defaultsToStatewide: true },
  { name: "Gilliam", defaultsToStatewide: true },
  { name: "Grant", defaultsToStatewide: true },
  { name: "Harney", defaultsToStatewide: true },
  { name: "Hood River", defaultsToStatewide: true },
  { name: "Jackson", defaultsToStatewide: true, slrReference: "Chapter 9" },
  { name: "Jefferson", defaultsToStatewide: true },
  { name: "Josephine", defaultsToStatewide: true },
  { name: "Klamath", defaultsToStatewide: true },
  { name: "Lake", defaultsToStatewide: true },
  { 
    name: "Lane", 
    defaultsToStatewide: false,
    slrReference: "SLR 9.081",
    customMotions: [
      {
        name: "Lane County FED Answer Addendum",
        description: "Required additional disclosures for Lane County FED cases.",
        requiredFields: ["Hardship Declaration"],
        orsReference: "ORS 105.137"
      }
    ]
  },
  { name: "Lincoln", defaultsToStatewide: true },
  { name: "Linn", defaultsToStatewide: true },
  { name: "Malheur", defaultsToStatewide: true },
  { name: "Marion", defaultsToStatewide: true, slrReference: "SLR 9.081" },
  { name: "Morrow", defaultsToStatewide: true },
  { 
    name: "Multnomah", 
    defaultsToStatewide: false,
    slrReference: "SLR Chapter 9",
    customMotions: [
      {
        name: "Motion to Dismiss (Multnomah)",
        description: "Motion based on Multnomah County specific notice requirements.",
        requiredFields: ["Notice Date", "Service Method"],
        utcrReference: "UTCR 5.010"
      },
      {
        name: "Request for Mediation (Multnomah)",
        description: "Mandatory mediation request for certain residential FED categories.",
        requiredFields: ["Mediation Eligibility Status"]
      }
    ]
  },
  { name: "Polk", defaultsToStatewide: true },
  { name: "Sherman", defaultsToStatewide: true },
  { name: "Tillamook", defaultsToStatewide: true },
  { name: "Umatilla", defaultsToStatewide: true },
  { name: "Union", defaultsToStatewide: true },
  { name: "Wallowa", defaultsToStatewide: true },
  { name: "Wasco", defaultsToStatewide: true },
  { 
    name: "Washington", 
    defaultsToStatewide: false,
    slrReference: "SLR 9.081",
    customMotions: [
      {
        name: "Washington County Tenant Declaration",
        description: "Specific declaration of compliance with local ordinances.",
        requiredFields: ["Ordinance Reference"]
      }
    ]
  },
  { name: "Wheeler", defaultsToStatewide: true },
  { name: "Yamhill", defaultsToStatewide: true }
];

export const STATEWIDE_MOTIONS: MotionStructure[] = [
  {
    name: "Answer to Residential Eviction",
    description: "Standard statewide form to contest a residential eviction.",
    requiredFields: ["Case Number", "Defenses", "Counterclaims"],
    orsReference: "ORS 105.137"
  },
  {
    name: "Motion to Dismiss for Defective Notice",
    description: "Request to dismiss if the landlord's notice fails to meet ORS 90.394 requirements.",
    requiredFields: ["Defect Description", "Evidence Reference"],
    orsReference: "ORS 90.394"
  },
  {
    name: "Motion to Set Aside Judgment",
    description: "Request to reopen the case after a default judgment.",
    requiredFields: ["Reason for Default", "Meritorious Defense"],
    utcrReference: "UTCR 7.020",
    orsReference: "ORS 105.151"
  },
  {
    name: "Motion for Stay of Proceedings (SB 690)",
    description: "Request for a 90-day delay and stay of execution for households with children under 12 months receiving OHP/HRSN assistance per SB 690 (2026).",
    requiredFields: ["Evidence of Perinatal Status", "Evidence of OHP Assistance"],
    orsReference: "SB 690 (2026)",
    utcrReference: "UTCR 2.010"
  },
  {
    name: "Application for Fee Waiver/Deferral",
    description: "Request to wave the $88 filing fee for low-income tenants (In Forma Pauperis).",
    requiredFields: ["Income", "Public Assistance", "Expenses"],
    utcrReference: "UTCR 21.070"
  }
];

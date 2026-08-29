/**
 * Sample Oregon eviction notices with common statutory defects for instant demonstration
 */

export interface SampleNotice {
  id: string;
  name: string;
  badge: string;
  defectSummary: string;
  county: string;
  landlord: string;
  tenant: string;
  address: string;
  noticeText: string;
}

export const SAMPLE_NOTICES: SampleNotice[] = [
  {
    id: 'sample-10day-mail-defect',
    name: '10-Day Nonpayment Notice (Mailing Buffer Defect)',
    badge: 'ORS 90.155 Mailing Violation',
    defectSummary: 'Landlord served by first-class mail but failed to add mandatory 3-day mailing buffer, giving only 10 days instead of 13 days.',
    county: 'Multnomah',
    landlord: 'Cascade Property Management LLC',
    tenant: 'Jordan Miller',
    address: '1420 SE Belmont St, Apt 4B, Portland, OR 97214',
    noticeText: `NOTICE OF TERMINATION FOR NONPAYMENT OF RENT
(ORS 90.394)

TO TENANT: Jordan Miller
ADDRESS: 1420 SE Belmont St, Apt 4B, Portland, OR 97214
LANDLORD: Cascade Property Management LLC

DATE OF NOTICE: October 8, 2026
METHOD OF SERVICE: Sent via First Class Regular Mail

PLEASE TAKE NOTICE that your rent is past due in the amount of:
- Past Due Rent: $1,450.00
- Late Fee: $75.00
- Utility Surcharge: $50.00
TOTAL AMOUNT DEMANDED: $1,575.00

You must pay the full amount of $1,575.00 on or before October 18, 2026 at 5:00 PM, or your rental agreement will terminate and an eviction action (FED) will be filed against you in Multnomah County Circuit Court.

Payment may be made at: 500 SW 5th Ave, Suite 200, Portland, OR 97204.
Hours: Mon-Fri 9am-4pm.`
  },
  {
    id: 'sample-multilingual-missing',
    name: '13-Day Nonpayment Notice (Missing Multilingual Disclosures)',
    badge: 'ORS 105.136 Violation',
    defectSummary: 'Notice omits the 2026 statutory multilingual notice of tenant eviction defense rights in required languages.',
    county: 'Lane',
    landlord: 'Emerald Valley Rentals',
    tenant: 'Alex Rivera',
    address: '882 E 19th Ave, Unit 2, Eugene, OR 97403',
    noticeText: `NOTICE TO VACATE OR PAY RENT
(Oregon Revised Statutes Chapter 90)

TO: Alex Rivera
PREMISES: 882 E 19th Ave, Unit 2, Eugene, OR 97403
DATE OF SERVICE: September 5, 2026
SERVICE METHOD: Personally delivered to Tenant

Demand is hereby made for payment of delinquent rent in the sum of $1,200.00 for the month of September 2026.

Unless said rent is paid in full on or before September 18, 2026, your tenancy will be terminated and legal proceedings will be commenced to recover possession of the premises and statutory damages.

Dated: September 5, 2026
Emerald Valley Rentals, Landlord`
  },
  {
    id: 'sample-retaliation-habitability',
    name: '30-Day For-Cause Notice (Retaliation & Habitability)',
    badge: 'ORS 90.385 Retaliation Defense',
    defectSummary: 'Issued 14 days after tenant reported severe mold and heating failure in writing.',
    county: 'Washington',
    landlord: 'Pacific Crest Real Estate',
    tenant: 'Sarah & David Chen',
    address: '4520 SW Watson Ave, Beaverton, OR 97005',
    noticeText: `30-DAY NOTICE OF TERMINATION FOR CAUSE
(ORS 90.392)

DATE: November 12, 2026
TO: Sarah & David Chen
ADDRESS: 4520 SW Watson Ave, Beaverton, OR 97005
COUNTY: Washington County, Oregon

You are hereby notified that your rental agreement will terminate on December 12, 2026 for the following alleged lease violations:
1. Noise complaints regarding late evening hours.
2. Storing personal items on exterior walkway.

You may cure these violations by removing items within 14 days (November 26, 2026). If not cured, you must vacate by December 12, 2026.

Pacific Crest Real Estate`
  }
];

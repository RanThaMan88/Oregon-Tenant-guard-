import { LegalResource } from '../types';

export const LEGAL_RESOURCES: LegalResource[] = [
  {
    name: 'Legal Aid Services of Oregon',
    phone: '503-224-4086',
    url: 'https://lasoregon.org/',
    counties: ['Multnomah', 'Clackamas', 'Washington', 'Lane', 'Marion'],
    type: 'legal_aid'
  },
  {
    name: 'Community Alliance of Tenants (CAT)',
    phone: '503-288-0130',
    url: 'https://www.oregoncat.org/',
    counties: ['All'],
    type: 'advocacy'
  },
  {
    name: 'Oregon Law Help',
    phone: 'N/A',
    url: 'https://oregonlawhelp.org/',
    counties: ['All'],
    type: 'legal_aid'
  },
  {
    name: 'Portland Housing Bureau',
    phone: '503-823-1303',
    url: 'https://www.portland.gov/phb',
    counties: ['Multnomah'],
    type: 'advocacy'
  },
  {
    name: 'Springfield Eugene Tenant Association',
    phone: '541-972-3000',
    url: 'https://www.seta.org/',
    counties: ['Lane'],
    type: 'advocacy'
  }
];

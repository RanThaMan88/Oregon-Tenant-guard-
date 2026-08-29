export interface Testimonial {
  id: string;
  initials: string;
  county: string;
  text: string;
  outcome: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    initials: 'J.D.',
    county: 'Multnomah',
    text: 'I was terrified when I got a 72-hour notice. This tool found that my landlord didn\'t add the 3-day mailing buffer. Case dismissed!',
    outcome: 'Case Dismissed'
  },
  {
    id: '2',
    initials: 'S.M.',
    county: 'Lane',
    text: 'The Fee Waiver generator saved me $88 right away. The Evidence Log made me feel prepared for my hearing.',
    outcome: 'Filing Fee Waived'
  },
  {
    id: '3',
    initials: 'A.R.',
    county: 'Washington',
    text: 'The automatic detection of the missing 211info text was the key. My landlord had to start over, giving me time to move safely.',
    outcome: '90 Day Stay'
  }
];

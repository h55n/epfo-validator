export const CLAIM_TYPES = [
  {
    id: 'FINAL_SETTLEMENT',
    form: 'Form 19',
    icon: '🏦',
    title: 'Full Withdrawal on Leaving Job',
    titleHi: 'पूर्ण निकासी (नौकरी छोड़ने पर)',
    description: 'Withdraw your entire PF balance after leaving your last job. You must have been unemployed for at least 2 months.',
    badge: 'Most Common',
  },
  {
    id: 'PARTIAL_WITHDRAWAL',
    form: 'Form 31',
    icon: '🏥',
    title: 'Advance for Emergency / Housing',
    titleHi: 'आंशिक निकासी (आपात / आवास)',
    description: 'Withdraw a portion of your balance for medical expenses, housing, education, or marriage. You continue employment.',
    badge: null,
  },
  {
    id: 'PENSION',
    form: 'Form 10C',
    icon: '📋',
    title: 'EPS Pension Withdrawal',
    titleHi: 'EPS पेंशन निकासी',
    description: 'Withdraw your Employee Pension Scheme balance. Available only if you have less than 10 years of service.',
    badge: null,
  },
]

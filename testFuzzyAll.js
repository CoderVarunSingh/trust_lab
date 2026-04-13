const { fuzzyScore } = require('./server/utils/fuzzyMatch.js');
const tests = [
  'Complete Blood Count (CBC)', 'Lipid Profile', 'Thyroid Profile (T3, T4, TSH)',
  'HbA1c', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Vitamin D',
  'Vitamin B12', 'Fasting Blood Sugar (FBS)', 'Post Prandial Blood Sugar (PPBS)',
  'Urine Routine & Microscopy', 'Serum Uric Acid', 'Electrolytes (Na, K, Cl)',
  'CRP (C-Reactive Protein)', 'D-Dimer', 'Ferritin', 'Prothrombin Time (PT/INR)',
  'Widal Test', 'Dengue NS1 Antigen', 'Malaria Parasite Smear', 'Typhidot',
  'COVID-19 RT-PCR', 'Hepatitis B Surface Antigen (HBsAg)', 'HIV 1 & 2 Antibodies',
  'VDRL (Syphilis)', 'PSA (Prostate Specific Antigen)', 'CA-125', 'CEA',
  'AFP (Alpha Fetoprotein)', 'Beta HCG', 'Prolactin', 'FSH (Follicle Stimulating Hormone)',
  'LH (Luteinizing Hormone)', 'Testosterone', 'Cortisol', 'Iron Profile',
  'Calcium', 'Phosphorus', 'Amylase', 'Lipase', 'Full Body Health Checkup',
  'Diabetic Profile Mini'
];

tests.forEach(t => {
  const score = fuzzyScore('unnao', t);
  if (score >= 0.4) console.log(`unnao vs ${t}: ${score}`);
});

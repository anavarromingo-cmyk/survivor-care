import { GuidelineRule, ExposureType, RiskLevel, EvidenceLevel, Sex } from './types';

// This simulates the database of rules extracted from COG v6.0 and PanCare
export const CLINICAL_RULES: GuidelineRule[] = [
  // --- ANTHRACYCLINES (Cardiotoxicity) ---
  {
    id: 'COG-34-Anthracyclines',
    guidelineSource: 'COG_v6',
    sectionReference: 'Section 34 / 77',
    exposureType: ExposureType.Chemotherapy,
    lateEffectCategory: 'Cardiovascular',
    riskLevel: RiskLevel.High,
    recommendationTextClinician: 'Screen for cardiomyopathy. Traditional CVRFs significantly increase risk.',
    recommendationTextPatient: 'Your heart needs regular check-ups because one of the medicines you received (anthracyclines) can affect how the heart muscle pumps.',
    testModality: 'Echocardiogram',
    startTimeCondition: 'Entry into long-term follow-up',
    interval: 'Every 2-5 years based on dose',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp) => {
      const agents = ['doxorubicin', 'daunorubicin', 'epirubicin', 'idarubicin', 'mitoxantrone'];
      return agents.some(a => exp.name.toLowerCase().includes(a));
    }
  },
  
  // --- CHEST RADIATION (Breast Cancer) ---
  {
    id: 'COG-73-BreastCa',
    guidelineSource: 'COG_v6',
    sectionReference: 'Section 73',
    exposureType: ExposureType.Radiation,
    lateEffectCategory: 'Secondary Malignancy',
    riskLevel: RiskLevel.High,
    recommendationTextClinician: 'Annual Mammogram and Breast MRI recommended for females treated with chest radiation.',
    recommendationTextPatient: 'Because you had radiation to the chest area, it is very important to check your breasts regularly to catch any changes early.',
    testModality: 'Mammogram + MRI',
    startTimeCondition: 'Age 25 or 8 years post-radiation (whichever later)',
    interval: 'Annual',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp, patient) => {
      return exp.type === ExposureType.Radiation && 
             (exp.name.toLowerCase().includes('chest') || exp.name.toLowerCase().includes('mantle') || exp.name.toLowerCase().includes('axilla')) &&
             patient.sex === Sex.Female;
    }
  },

  // --- CHEST RADIATION (Pulmonary) ---
  {
    id: 'COG-75-Pulmonary',
    guidelineSource: 'COG_v6',
    sectionReference: 'Section 75',
    exposureType: ExposureType.Radiation,
    lateEffectCategory: 'Pulmonary',
    riskLevel: RiskLevel.Moderate,
    recommendationTextClinician: 'Baseline PFTs. Repeat as clinically indicated. Pulmonary fibrosis risk.',
    recommendationTextPatient: 'Radiation to the chest can sometimes stiffen the lungs. We recommend a breathing test to establish a baseline.',
    testModality: 'PFTs (Spirometry + DLCO)',
    startTimeCondition: 'Entry into follow-up',
    interval: 'Baseline, then clinically indicated',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp) => {
       return exp.type === ExposureType.Radiation && 
             (exp.name.toLowerCase().includes('chest') || exp.name.toLowerCase().includes('lung') || exp.name.toLowerCase().includes('tbi'));
    }
  },

  // --- PLATINUMS (Hearing) ---
  {
    id: 'COG-22-Hearing',
    guidelineSource: 'COG_v6',
    sectionReference: 'Section 22',
    exposureType: ExposureType.Chemotherapy,
    lateEffectCategory: 'Auditory',
    riskLevel: RiskLevel.Moderate,
    recommendationTextClinician: 'Audiology evaluation for high-frequency hearing loss.',
    recommendationTextPatient: 'Medicines like cisplatin or carboplatin can affect hearing, especially high-pitched sounds. Regular hearing tests are important.',
    testModality: 'Audiogram (>8000Hz)',
    startTimeCondition: 'Entry into follow-up',
    interval: 'Once, then as indicated',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp) => {
      return ['cisplatin', 'carboplatin'].some(a => exp.name.toLowerCase().includes(a));
    }
  },

    // --- SPLENECTOMY (Immune) ---
  {
    id: 'COG-147-Splenectomy',
    guidelineSource: 'COG_v6',
    sectionReference: 'Section 147',
    exposureType: ExposureType.Surgery,
    lateEffectCategory: 'Immune',
    riskLevel: RiskLevel.High,
    recommendationTextClinician: 'Risk of overwhelming post-splenectomy infection. Ensure vaccinations (Pneumococcal, Meningococcal, Hib). Antibiotic prophylaxis per guidelines.',
    recommendationTextPatient: 'Since your spleen was removed, your body needs extra help fighting certain bacteria. Keep vaccinations up to date and see a doctor immediately if you have a fever.',
    testModality: 'Vaccination Review',
    startTimeCondition: 'Immediate',
    interval: 'Ongoing',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp) => {
      return exp.name.toLowerCase().includes('splenectomy');
    }
  }
];

export const DRUG_DICTIONARY = [
  'Doxorubicin', 'Daunorubicin', 'Epirubicin', 'Idarubicin', 'Mitoxantrone',
  'Cisplatin', 'Carboplatin',
  'Cyclophosphamide', 'Ifosfamide',
  'Methotrexate', 'Bleomycin', 'Vincristine', 'Vinblastine',
  'Etoposide'
];

export const RADIATION_FIELDS = [
  'Total Body Irradiation (TBI)',
  'Cranial / Brain',
  'Head and Neck',
  'Mantle / Mediastinal / Chest',
  'Axilla',
  'Abdomen / Flank',
  'Pelvis',
  'Spine',
  'Extremity'
];

export const SURGERIES = [
  'Splenectomy',
  'Nephrectomy',
  'Amputation',
  'Thoracotomy',
  'Laminectomy',
  'Oophorectomy',
  'Orchiectomy'
];

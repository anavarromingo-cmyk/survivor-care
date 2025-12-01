import { GuidelineRule, ExposureType, RiskLevel, EvidenceLevel, Sex } from './types';

// Helper para buscar múltiples términos en un nombre
const matchesAny = (text: string, terms: string[]) => {
  const normalizedText = text.toLowerCase();
  return terms.some(term => normalizedText.includes(term.toLowerCase()));
};

export const CLINICAL_RULES: GuidelineRule[] = [
  // --- ANTRACICLINAS (Cardiotoxicidad) ---
  {
    id: 'COG-34-Anthracyclines',
    guidelineSource: 'COG_v6',
    sectionReference: 'Sección 34',
    exposureType: ExposureType.Chemotherapy,
    lateEffectCategory: 'Cardiovascular',
    riskLevel: RiskLevel.High,
    recommendationTextClinician: 'Cribado de miocardiopatía. Ecocardiograma periódico esencial. Factores de riesgo: Dosis acumulada, edad <5 años al tx.',
    recommendationTextPatient: 'Tu corazón necesita revisiones periódicas (Ecocardiograma) porque medicinas como la Doxorrubicina pueden debilitar el músculo cardíaco con el tiempo.',
    testModality: 'Ecocardiograma',
    startTimeCondition: 'Al entrar en seguimiento',
    interval: 'Cada 2-5 años (según dosis)',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp) => {
      // Ampliamos con nombres comerciales comunes
      const agents = [
        'doxorrubicina', 'doxorubicin', 'adriamicina', 'adriam', // Doxo
        'daunorrubicina', 'daunorubicin', 'daunomicina', // Dauno
        'epirrubicina', 'epirubicin', // Epi
        'idarrubicina', 'idarubicin', // Ida
        'mitoxantrona', 'mitoxantrone' // Mito
      ];
      return matchesAny(exp.name, agents);
    }
  },
  
  // --- RADIOTERAPIA TORÁCICA (Cáncer de Mama) ---
  {
    id: 'COG-73-BreastCa',
    guidelineSource: 'COG_v6',
    sectionReference: 'Sección 73',
    exposureType: ExposureType.Radiation,
    lateEffectCategory: 'Neoplasia Secundaria (Mama)',
    riskLevel: RiskLevel.High,
    recommendationTextClinician: 'Mamografía anual + RM de mama. Inicio a los 25 años o 8 años post-radiación (lo que ocurra después).',
    recommendationTextPatient: 'Al haber recibido radioterapia en el pecho, es muy importante vigilar tus mamas. Se recomienda resonancia y mamografía anual desde los 25 años.',
    testModality: 'Mamografía + RM Mama',
    startTimeCondition: '25 años de edad u 8 años post-radiación',
    interval: 'Anual',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp, patient) => {
      const fields = ['tórax', 'torax', 'chest', 'manto', 'mantle', 'axila', 'axilla', 'mediastino', 'mediastinum', 'pulmón', 'pulmon', 'lung'];
      return exp.type === ExposureType.Radiation && 
             matchesAny(exp.name, fields) &&
             patient.sex === Sex.Female; // Solo mujeres
    }
  },

  // --- RADIOTERAPIA PULMONAR (Fibrosis) ---
  {
    id: 'COG-75-Pulmonary',
    guidelineSource: 'COG_v6',
    sectionReference: 'Sección 75',
    exposureType: ExposureType.Radiation,
    lateEffectCategory: 'Pulmonar',
    riskLevel: RiskLevel.Moderate,
    recommendationTextClinician: 'Pruebas de función pulmonar (PFT/DLCO) basales. Repetir si hay sintomatología.',
    recommendationTextPatient: 'La radioterapia en el pecho puede afectar la elasticidad de los pulmones. Si notas que te falta el aire al ejercicio, consulta a tu médico.',
    testModality: 'Espirometría + DLCO',
    startTimeCondition: 'Entrada en seguimiento',
    interval: 'Basal, luego s/ clínica',
    evidenceStrength: EvidenceLevel.Moderate,
    exposureCriteria: (exp) => {
       const fields = ['tórax', 'torax', 'chest', 'manto', 'mantle', 'pulmón', 'pulmon', 'lung', 'tbi', 'corporal total', 'whole body'];
       return exp.type === ExposureType.Radiation && matchesAny(exp.name, fields);
    }
  },

  // --- PLATINOS (Audición) ---
  {
    id: 'COG-22-Hearing',
    guidelineSource: 'COG_v6',
    sectionReference: 'Sección 22',
    exposureType: ExposureType.Chemotherapy,
    lateEffectCategory: 'Auditivo',
    riskLevel: RiskLevel.Moderate,
    recommendationTextClinician: 'Audiometría anual hasta estabilidad (>5 años). Riesgo de hipoacusia neurosensorial.',
    recommendationTextPatient: 'Ciertos fármacos (Platinos) pueden dañar el oído interno. Hazte una prueba de audición si notas zumbidos o dificultad para escuchar en ambientes ruidosos.',
    testModality: 'Audiometría (>8kHz)',
    startTimeCondition: 'Al finalizar tratamiento',
    interval: 'Anual x 5 años, luego s/ síntomas',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp) => {
      const agents = ['cisplatino', 'cisplatin', 'carboplatino', 'carboplatin'];
      return matchesAny(exp.name, agents);
    }
  },

  // --- ALQUILANTES (Infertilidad / Leucemia Sec) ---
  {
    id: 'COG-Alkylators',
    guidelineSource: 'COG_v6',
    sectionReference: 'Sección Gen',
    exposureType: ExposureType.Chemotherapy,
    lateEffectCategory: 'Gonadal / Fertilidad',
    riskLevel: RiskLevel.Moderate,
    recommendationTextClinician: 'Evaluar función gonadal (FSH, LH, Estradiol/Testosterona). Riesgo dependiente de dosis acumulada.',
    recommendationTextPatient: 'Algunas quimioterapias fuertes pueden afectar la capacidad de tener hijos en el futuro. Es bueno hacer un análisis de hormonas.',
    testModality: 'Perfil Hormonal',
    startTimeCondition: 'Pubertad / Entrada seguimiento',
    interval: 'Según clínica',
    evidenceStrength: EvidenceLevel.Moderate,
    exposureCriteria: (exp) => {
      const agents = ['ciclofosfamida', 'cyclophosphamide', 'ifosfamida', 'ifosfamide', 'busulfan', 'melfalan', 'melphalan'];
      return matchesAny(exp.name, agents);
    }
  },

  // --- ESPLENECTOMÍA (Inmune) ---
  {
    id: 'COG-147-Splenectomy',
    guidelineSource: 'COG_v6',
    sectionReference: 'Sección 147',
    exposureType: ExposureType.Surgery,
    lateEffectCategory: 'Inmunológico',
    riskLevel: RiskLevel.High,
    recommendationTextClinician: 'Riesgo de sepsis fulminante. Vacunación estricta (Neumococo, Meningococo, Hib) y educación sobre fiebre.',
    recommendationTextPatient: 'Al no tener bazo, tu defensas contra bacterias están bajas. Fiebre alta = URGENCIA MÉDICA inmediata. Mantén vacunas al día.',
    testModality: 'Revisión Vacunal + Educación',
    startTimeCondition: 'Inmediato',
    interval: 'Continuo',
    evidenceStrength: EvidenceLevel.High,
    exposureCriteria: (exp) => {
      return matchesAny(exp.name, ['esplenectomía', 'splenectomy', 'bazo', 'spleen']);
    }
  }
];

export const DRUG_DICTIONARY = [
  'Doxorrubicina', 'Cisplatino', 'Carboplatino', 'Ciclofosfamida', 
  'Ifosfamida', 'Metotrexato', 'Vincristina', 'Etopósido', 
  'Bleomicina', 'Actinomicina-D'
];

export const RADIATION_FIELDS = [
  'Cráneo / Cerebro',
  'Tórax / Manto',
  'Abdomen',
  'Pelvis',
  'Columna',
  'Corporal Total (TBI)',
  'Extremidad'
];

export const SURGERIES = [
  'Esplenectomía', 'Nefrectomía', 'Amputación', 'Toracotomía'
];
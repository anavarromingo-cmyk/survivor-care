export enum Sex {
  Male = 'Male',
  Female = 'Female'
}

export enum ExposureType {
  Chemotherapy = 'Chemotherapy',
  Radiation = 'Radiation',
  Surgery = 'Surgery',
  HSCT = 'HSCT'
}

export enum RiskLevel {
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High'
}

export enum EvidenceLevel {
  High = 'High',
  Moderate = 'Moderate',
  Low = 'Low'
}

export interface Patient {
  id: string;
  age: number;
  birthYear: number;
  diagnosisYear: number;
  sex: Sex;
  tumorType: string;
}

export interface Exposure {
  id: string;
  type: ExposureType;
  name: string;
  dose?: number;
  unit?: string;
  date?: string;
}

export interface GuidelineRule {
  id: string;
  guidelineSource: string;
  sectionReference: string;
  exposureType: ExposureType;
  lateEffectCategory: string;
  riskLevel: RiskLevel;
  recommendationTextClinician: string;
  recommendationTextPatient: string;
  testModality: string;
  startTimeCondition: string;
  interval: string;
  evidenceStrength: EvidenceLevel;
  exposureCriteria: (exp: Exposure, patient: Patient) => boolean;
}

export interface FollowUpRecommendation {
  id: string;
  ruleId: string;
  lateEffect: string;
  riskLevel: RiskLevel;
  test: string;
  frequency: string;
  startCriteria: string;
  clinicianText: string;
  patientText: string;
  source: string;
  evidence: EvidenceLevel;
}

export interface FollowUpPlan {
  patient: Patient;
  exposures: Exposure[];
  recommendations: FollowUpRecommendation[];
  generatedAt: Date;
  generatedBy: string;
}
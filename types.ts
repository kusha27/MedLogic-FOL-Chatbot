
export enum SymptomID {
  FEVER = 'fever',
  COUGH = 'cough',
  HEADACHE = 'headache',
  RUNNY_NOSE = 'runny_nose',
  SORE_THROAT = 'sore_throat',
  FATIGUE = 'fatigue',
  MUSCLE_ACHE = 'muscle_ache',
  SNEEZING = 'sneezing',
  ITCHY_EYES = 'itchy_eyes',
  NAUSEA = 'nausea',
  LIGHT_SENSITIVITY = 'light_sensitivity',
  STIFF_NECK = 'stiff_neck',
  SHORTNESS_BREATH = 'shortness_breath',
  CHEST_PAIN = 'chest_pain',
}

export interface Symptom {
  id: SymptomID;
  label: string;
  synonyms: string[];
}

export interface Disease {
  id: string;
  name: string;
  description: string;
}

export interface Rule {
  id: string;
  conclusion: string; // Disease ID
  antecedents: SymptomID[]; // Must have these symptoms
  exclusions?: SymptomID[]; // Should NOT have these symptoms
  priority: number;
  description?: string;
}

export interface MedicalKnowledgeBase {
  version: string;
  lastUpdated: string;
  symptoms: Symptom[];
  diseases: Disease[];
  rules: Rule[];
}

export interface ProofStep {
  ruleId: string;
  conclusion: string;
  evidence: SymptomID[];
  missing: SymptomID[];
  conflicts: SymptomID[];
  score: number;
}

export interface DiagnosisResult {
  diseaseId: string;
  diseaseName: string;
  score: number;
  explanation: string;
  proof: ProofStep;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    identifiedSymptoms?: SymptomID[];
    diagnoses?: DiagnosisResult[];
  };
}

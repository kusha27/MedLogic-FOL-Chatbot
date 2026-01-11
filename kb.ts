
import { SymptomID, MedicalKnowledgeBase } from './types';

export const MED_KB: MedicalKnowledgeBase = {
  version: "1.2.0",
  lastUpdated: "2024-05-20",
  symptoms: [
    { id: SymptomID.FEVER, label: 'Fever', synonyms: ['high temperature', 'feverish', 'chills', 'pyrexia'] },
    { id: SymptomID.COUGH, label: 'Cough', synonyms: ['coughing', 'dry cough', 'wet cough', 'hacking'] },
    { id: SymptomID.HEADACHE, label: 'Headache', synonyms: ['head pain', 'migraine', 'throbbing head'] },
    { id: SymptomID.RUNNY_NOSE, label: 'Runny Nose', synonyms: ['rhinorrhea', 'nasal congestion', 'stuffy nose'] },
    { id: SymptomID.SORE_THROAT, label: 'Sore Throat', synonyms: ['painful swallowing', 'scratchy throat', 'pharyngitis'] },
    { id: SymptomID.FATIGUE, label: 'Fatigue', synonyms: ['tiredness', 'exhaustion', 'lethargy', 'weakness'] },
    { id: SymptomID.MUSCLE_ACHE, label: 'Muscle Ache', synonyms: ['body aches', 'myalgia', 'sore muscles'] },
    { id: SymptomID.SNEEZING, label: 'Sneezing', synonyms: ['sternutation', 'constant sneezing'] },
    { id: SymptomID.ITCHY_EYES, label: 'Itchy Eyes', synonyms: ['watery eyes', 'red eyes', 'ocular itching'] },
    { id: SymptomID.NAUSEA, label: 'Nausea', synonyms: ['feeling sick', 'queasiness', 'vomiting'] },
    { id: SymptomID.LIGHT_SENSITIVITY, label: 'Light Sensitivity', synonyms: ['photophobia', 'hurts to look at light'] },
    { id: SymptomID.STIFF_NECK, label: 'Stiff Neck', synonyms: ['neck pain', 'limited neck movement'] },
    { id: SymptomID.SHORTNESS_BREATH, label: 'Shortness of Breath', synonyms: ['dyspnea', 'difficulty breathing'] },
    { id: SymptomID.CHEST_PAIN, label: 'Chest Pain', synonyms: ['angina', 'tightness in chest'] },
  ],
  diseases: [
    { id: 'flu', name: 'Influenza (Flu)', description: 'A common viral infection that can be deadly, especially in high-risk groups.' },
    { id: 'cold', name: 'Common Cold', description: 'A viral infection of your nose and throat.' },
    { id: 'allergies', name: 'Seasonal Allergies', description: 'Immune system reaction to pollen, pets, or other substances.' },
    { id: 'migraine', name: 'Migraine', description: 'A headache that can cause severe throbbing pain or a pulsing sensation.' },
    { id: 'meningitis', name: 'Meningitis (Urgent)', description: 'Inflammation of the brain and spinal cord membranes, typically caused by an infection.' },
    { id: 'covid19', name: 'COVID-19', description: 'A disease caused by a new coronavirus called SARS-CoV-2.' },
    { id: 'pneumonia', name: 'Pneumonia', description: 'An infection that inflames one or both lungs.' },
    { id: 'bronchitis', name: 'Bronchitis', description: 'Inflammation of the bronchial tubes.' },
    { id: 'strep_throat', name: 'Strep Throat', description: 'Bacterial infection causing sore throat.' },
    { id: 'asthma', name: 'Asthma', description: 'Condition causing airway narrowing and swelling.' },
    { id: 'sinusitis', name: 'Sinusitis', description: 'Inflammation of sinus lining.' },
    { id: 'tension_headache', name: 'Tension Headache', description: 'Mild pain felt as a tight band around the head.' },
  ],
  rules: [
    { id: 'R1', conclusion: 'flu', antecedents: [SymptomID.FEVER, SymptomID.COUGH, SymptomID.MUSCLE_ACHE, SymptomID.FATIGUE], priority: 10, description: "Classic flu presentation with systemic body aches and respiratory symptoms." },
    { id: 'R2', conclusion: 'cold', antecedents: [SymptomID.RUNNY_NOSE, SymptomID.SORE_THROAT, SymptomID.SNEEZING], exclusions: [SymptomID.FEVER], priority: 5, description: "Typical upper respiratory infection without significant fever." },
    { id: 'R3', conclusion: 'allergies', antecedents: [SymptomID.ITCHY_EYES, SymptomID.SNEEZING, SymptomID.RUNNY_NOSE], exclusions: [SymptomID.FEVER], priority: 8, description: "Histamine response characterized by ocular itching and sneezing." },
    { id: 'R4', conclusion: 'migraine', antecedents: [SymptomID.HEADACHE, SymptomID.NAUSEA, SymptomID.LIGHT_SENSITIVITY], priority: 7, description: "Neurological headache involving sensory sensitivity and nausea." },
    { id: 'R5', conclusion: 'meningitis', antecedents: [SymptomID.FEVER, SymptomID.HEADACHE, SymptomID.STIFF_NECK], priority: 20, description: "Urgent bacterial/viral indicator with meningeal irritation triad." },
    { id: 'R6', conclusion: 'covid19', antecedents: [SymptomID.FEVER, SymptomID.COUGH, SymptomID.SHORTNESS_BREATH], priority: 15, description: "Lower respiratory infection with fever and shortness of breath." },
    { id: 'R7', conclusion: 'flu', antecedents: [SymptomID.FEVER, SymptomID.HEADACHE, SymptomID.FATIGUE], priority: 9, description: "Systemic viral prodrome with high fever and fatigue." },
    { id: 'R8', conclusion: 'pneumonia', antecedents: [SymptomID.FEVER, SymptomID.COUGH, SymptomID.SHORTNESS_BREATH, SymptomID.CHEST_PAIN], priority: 18, description: "Acute pulmonary consolidation indicators." },
    { id: 'R10', conclusion: 'bronchitis', antecedents: [SymptomID.COUGH, SymptomID.FATIGUE, SymptomID.SHORTNESS_BREATH], priority: 11, description: "Inflammation of bronchial pathways causing persistent cough." },
    { id: 'R11', conclusion: 'strep_throat', antecedents: [SymptomID.SORE_THROAT, SymptomID.FEVER, SymptomID.HEADACHE], exclusions: [SymptomID.COUGH], priority: 14, description: "Bacterial pharyngitis usually lacks a viral-style cough." },
    { id: 'R12', conclusion: 'asthma', antecedents: [SymptomID.SHORTNESS_BREATH, SymptomID.COUGH, SymptomID.CHEST_PAIN], exclusions: [SymptomID.FEVER], priority: 13, description: "Reactive airway disease without infectious indicators." },
    { id: 'R13', conclusion: 'sinusitis', antecedents: [SymptomID.HEADACHE, SymptomID.RUNNY_NOSE, SymptomID.COUGH], priority: 9, description: "Cranial pressure from sinus blockage with post-nasal drip." },
    { id: 'R14', conclusion: 'tension_headache', antecedents: [SymptomID.HEADACHE, SymptomID.FATIGUE], exclusions: [SymptomID.NAUSEA], priority: 6, description: "Stress-related headache lacking gastric involvement." },
  ]
};

export const SYMPTOMS = MED_KB.symptoms;
export const DISEASES = MED_KB.diseases;
export const RULES = MED_KB.rules;

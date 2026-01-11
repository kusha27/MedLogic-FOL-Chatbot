
import { SymptomID, Rule, ProofStep, DiagnosisResult } from './types';
import { RULES, DISEASES, SYMPTOMS } from './kb';

export function runInference(userSymptoms: SymptomID[]): DiagnosisResult[] {
  const results: DiagnosisResult[] = [];

  for (const rule of RULES) {
    const matched = rule.antecedents.filter(s => userSymptoms.includes(s));
    const missing = rule.antecedents.filter(s => !userSymptoms.includes(s));
    const conflicts = (rule.exclusions || []).filter(s => userSymptoms.includes(s));

    let score = matched.length / rule.antecedents.length;
    
    if (conflicts.length > 0) {
      score = score * (0.1 ** conflicts.length);
    }

    if (score > 0.2) {
      const disease = DISEASES.find(d => d.id === rule.conclusion);
      if (disease) {
        const proof: ProofStep = {
          ruleId: rule.id,
          conclusion: disease.id,
          evidence: matched,
          missing: missing,
          conflicts: conflicts,
          score: score
        };

        const existingResult = results.find(r => r.diseaseId === disease.id);
        if (existingResult) {
          if (score > existingResult.score) {
            existingResult.score = score;
            existingResult.proof = proof;
          }
        } else {
          results.push({
            diseaseId: disease.id,
            diseaseName: disease.name,
            score: score,
            explanation: generateExplanation(proof, disease.name),
            proof: proof
          });
        }
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function generateExplanation(proof: ProofStep, diseaseName: string): string {
  const evidenceLabels = proof.evidence.map(id => SYMPTOMS.find(s => s.id === id)?.label).join(', ');
  const missingLabels = proof.missing.map(id => SYMPTOMS.find(s => s.id === id)?.label).join(', ');
  const conflictLabels = proof.conflicts.map(id => SYMPTOMS.find(s => s.id === id)?.label).join(', ');

  let text = `Rule ${proof.ruleId} fired because you have ${evidenceLabels}. `;
  
  if (proof.missing.length > 0) {
    text += `However, typical symptoms like ${missingLabels} are missing. `;
  }

  if (proof.conflicts.length > 0) {
    text += `Warning: ${conflictLabels} are usually NOT associated with ${diseaseName}, which lowers confidence. `;
  }

  return text;
}

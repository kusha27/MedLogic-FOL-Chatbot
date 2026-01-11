
import { GoogleGenAI, Type } from "@google/genai";
import { SYMPTOMS } from "./kb";
import { SymptomID } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractSymptomsFromText(userInput: string): Promise<SymptomID[]> {
  const prompt = `
    Analyze the following user health report and extract known symptoms from this specific list:
    ${SYMPTOMS.map(s => `${s.id}: ${s.label} (synonyms: ${s.synonyms.join(', ')})`).join('\n')}

    User Input: "${userInput}"

    Return the list of matched Symptom IDs in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["symptoms"]
        }
      }
    });

    const json = JSON.parse(response.text);
    const results: SymptomID[] = [];
    
    if (Array.isArray(json.symptoms)) {
      for (const s of json.symptoms) {
        if (Object.values(SymptomID).includes(s as SymptomID)) {
          results.push(s as SymptomID);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return [];
  }
}

export async function generateHealthAdvice(diagnoses: any[], symptoms: SymptomID[]): Promise<string> {
  const symptomNames = symptoms.map(id => SYMPTOMS.find(s => s.id === id)?.label).join(', ');
  const diagnosisDetails = diagnoses.map(d => `${d.diseaseName} (${Math.round(d.score * 100)}% match)`).join(', ');

  const prompt = `
    The patient reports: ${symptomNames}.
    Our rule-based engine suggested these potential issues: ${diagnosisDetails}.
    
    Provide a brief, empathetic medical chatbot response. 
    Explain that this is for informational purposes only and they should see a doctor.
    Keep it professional and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Based on your symptoms, I have calculated some potential matches. Please consult a professional.";
  }
}

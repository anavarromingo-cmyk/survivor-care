import { GoogleGenerativeAI } from "@google/generative-ai";
import { Exposure, ExposureType } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const parseProtocolPDF = async (base64Data: string): Promise<Exposure[]> => {
  if (!apiKey) {
    alert("Falta la API Key en el archivo .env");
    throw new Error("Falta API Key");
  }

  try {
    console.log("🔍 Seleccionando modelo ESTABLE (ignorando experimentales)...");
    
    // Obtener lista
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();
    const models = listData.models || [];
    const modelNames = models.map((m: any) => m.name.replace("models/", ""));

    // --- LÓGICA DE SELECCIÓN SEGURA ---
    let chosenModelName = "";

    // 1. Prioridad ABSOLUTA: El modelo estándar más rápido y estable (High Quota)
    // En tu lista aparece como 'gemini-flash-latest' o 'gemini-1.5-flash'
    if (modelNames.includes("gemini-1.5-flash")) {
        chosenModelName = "gemini-1.5-flash";
    } else if (modelNames.includes("gemini-flash-latest")) {
        chosenModelName = "gemini-flash-latest";
    } 
    // 2. Fallback: El modelo Pro estable
    else if (modelNames.includes("gemini-1.5-pro")) {
        chosenModelName = "gemini-1.5-pro";
    }
    // 3. Fallback: Cualquier Flash que NO sea experimental
    else {
        const safeFlash = modelNames.find((n: string) => n.includes("flash") && !n.includes("exp") && !n.includes("preview"));
        if (safeFlash) chosenModelName = safeFlash;
    }

    // Si aún así no encuentra, forzamos el estándar (a veces la lista engaña)
    if (!chosenModelName) {
        chosenModelName = "gemini-1.5-flash";
    }

    console.log(`✅ USANDO MODELO ESTABLE: ${chosenModelName}`);

    // Ejecutar IA
    const model = genAI!.getGenerativeModel({ model: chosenModelName });

    const prompt = `
      Eres un oncólogo experto. Analiza el PDF adjunto.
      Extrae EXCLUSIVAMENTE en formato JSON:
      1. Quimioterapia (nombre fármaco).
      2. Radioterapia (zona anatómica).
      3. Cirugías oncológicas.
      
      IMPORTANTE:
      - Devuelve SOLO un Array JSON.
      - Ejemplo: [{ "type": "Chemotherapy", "name": "Cisplatino", "dose": 50, "unit": "mg/m2" }]
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "application/pdf" } },
    ]);

    const response = await result.response;
    const text = response.text();
    console.log("🟡 Respuesta recibida:", text);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("La IA no devolvió un JSON válido.");

    const data = JSON.parse(jsonMatch[0]);

    return data.map((item: any) => ({
      id: crypto.randomUUID(),
      type: mapType(item.type),
      name: item.name || "Sin nombre",
      dose: item.dose ? Number(item.dose) : undefined,
      unit: item.unit || undefined
    }));

  } catch (error: any) {
    console.error("🔴 ERROR:", error);
    
    if (error.message.includes("429")) {
        alert("⚠️ Cuota excedida momentáneamente. Espera 1 minuto y vuelve a intentarlo.");
    } else {
        alert(`Error: ${error.message}`);
    }
    throw error;
  }
};

function mapType(typeStr: string): ExposureType {
  const t = typeStr ? typeStr.toLowerCase() : '';
  if (t.includes('quimio') || t.includes('chemo')) return ExposureType.Chemotherapy;
  if (t.includes('radio') || t.includes('radia')) return ExposureType.Radiation;
  if (t.includes('cirug') || t.includes('surg')) return ExposureType.Surgery;
  return ExposureType.Chemotherapy;
}

export const simplifyTextForPatient = async (text: string) => text;
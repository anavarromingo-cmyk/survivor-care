import React, { useState } from 'react';
import { Exposure, ExposureType } from '../types';
import { parseProtocolPDF } from '../services/geminiService';
import { DRUG_DICTIONARY, RADIATION_FIELDS, SURGERIES } from '../constants';

interface Props {
  exposures: Exposure[];
  setExposures: (e: Exposure[]) => void;
}

export const TreatmentInput: React.FC<Props> = ({ exposures, setExposures }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'pdf'>('manual');
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper robusto para convertir archivo a Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        // Validación crítica: asegurar que tenemos datos
        if (!result || !result.includes(',')) {
            reject(new Error("El archivo no se pudo leer correctamente."));
            return;
        }
        // Extraemos solo la parte base64 (después de la coma)
        const base64Clean = result.split(',')[1];
        if (!base64Clean || base64Clean.length === 0) {
            reject(new Error("El archivo parece estar vacío."));
            return;
        }
        resolve(base64Clean);
      };
      
      reader.onerror = error => reject(error);
      
      // Importante: Leer como URL de datos
      reader.readAsDataURL(file);
    });
  };

  const handleAddExposure = (type: ExposureType, name: string) => {
    setExposures([...exposures, { id: crypto.randomUUID(), type, name }]);
  };

  const handleRemoveExposure = (id: string) => {
    setExposures(exposures.filter(e => e.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validaciones previas
    if (file.type !== 'application/pdf') {
        alert("Por favor sube solo archivos PDF.");
        return;
    }
    if (file.size === 0) {
        alert("El archivo está vacío (0 bytes).");
        return;
    }

    setIsProcessing(true);

    try {
        console.log(`📂 Leyendo archivo: ${file.name} (${file.size} bytes)`);
        
        // 2. Conversión segura
        const base64Data = await fileToBase64(file);
        console.log(`binary data length: ${base64Data.length}`); // Log para depurar
        
        // 3. Envío a Gemini
        const extracted = await parseProtocolPDF(base64Data);
        
        if (extracted.length === 0) {
            alert("Gemini leyó el PDF pero no detectó tratamientos oncológicos claros.");
        } else {
            setExposures([...exposures, ...extracted]);
            alert(`¡Éxito! Se han extraído ${extracted.length} tratamientos.`);
        }

    } catch (err: any) {
        console.error("Error en subida:", err);
        if (err.message?.includes("pages")) {
             alert("Error 400: Google dice que 'El documento no tiene páginas'. \n\nPosibles causas:\n1. El PDF está dañado.\n2. Es un PDF protegido con contraseña.\n3. Intenta abrirlo, dale a 'Imprimir -> Guardar como PDF' y sube ese nuevo archivo.");
        } else {
             alert(`Error: ${err.message}`);
        }
    } finally {
        setIsProcessing(false);
        e.target.value = ''; // Limpiar input
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50">
        <nav className="flex -mb-px" aria-label="Tabs">
          {['manual', 'pdf'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`${
                activeTab === tab
                  ? 'border-medical-500 text-medical-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'pdf' ? 'Subir Protocolo (IA)' : 'Entrada Manual'}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Añadir Quimioterapia</label>
              <select 
                className="block w-full rounded-md border-slate-300 border p-2"
                onChange={(e) => {
                   if(e.target.value) handleAddExposure(ExposureType.Chemotherapy, e.target.value);
                   e.target.value = "";
                }}
              >
                <option value="">Seleccionar Agente...</option>
                {DRUG_DICTIONARY.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Añadir Radioterapia</label>
              <select 
                className="block w-full rounded-md border-slate-300 border p-2"
                onChange={(e) => {
                   if(e.target.value) handleAddExposure(ExposureType.Radiation, e.target.value);
                   e.target.value = "";
                }}
              >
                <option value="">Seleccionar Campo...</option>
                {RADIATION_FIELDS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* PDF Upload Tab */}
        {activeTab === 'pdf' && (
          <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-white transition-colors">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="mt-4 flex text-sm text-slate-600 justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-medical-600 hover:text-medical-500 focus-within:outline-none px-2">
                <span>Seleccionar PDF Clínico</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileUpload} disabled={isProcessing} />
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2">Sube un resumen de alta o protocolo de quimioterapia.</p>
            
            {isProcessing && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-medical-700 bg-medical-50 p-2 rounded-md animate-pulse">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Procesando documento...</span>
                </div>
            )}
          </div>
        )}

        {/* Current List */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-slate-900 mb-4 flex justify-between items-center">
             <span>Exposiciones Detectadas ({exposures.length})</span>
             {exposures.length > 0 && <button onClick={() => setExposures([])} className="text-xs text-red-500 hover:underline">Borrar todo</button>}
          </h4>
          
          {exposures.length === 0 ? (
            <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-100 text-center">
                Aún no hay datos. Sube un PDF o añade manualmente.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 border rounded-md bg-white">
              {exposures.map((exp) => (
                <li key={exp.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded mr-3 w-20 text-center
                      ${exp.type === ExposureType.Chemotherapy ? 'bg-purple-100 text-purple-800' : 
                        exp.type === ExposureType.Radiation ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      {exp.type === ExposureType.Chemotherapy ? 'QUIMIO' : exp.type === ExposureType.Radiation ? 'RADIO' : 'CIRUGÍA'}
                    </span>
                    <div>
                        <div className="font-medium text-slate-900">{exp.name}</div>
                        {(exp.dose || exp.unit) && <div className="text-xs text-slate-500">Dosis detectada: {exp.dose} {exp.unit}</div>}
                    </div>
                  </div>
                  <button onClick={() => handleRemoveExposure(exp.id)} className="text-slate-400 hover:text-red-600 p-2">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
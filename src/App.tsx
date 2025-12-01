import React, { useState } from 'react';
import { Patient, Exposure, FollowUpPlan, Sex } from './types';
import { generateFollowUpPlan } from './services/riskEngine';
import { PatientForm } from './components/PatientForm';
import { TreatmentInput } from './components/TreatmentInput';
import { FollowUpReport } from './components/FollowUpReport';

const App: React.FC = () => {
  // Application State
  const [step, setStep] = useState<number>(1);
  const [clinicianName, setClinicianName] = useState("Dr. Oncólogo");
  
  const [patient, setPatient] = useState<Patient>({
    id: crypto.randomUUID(),
    age: 18,
    birthYear: 2006,
    diagnosisYear: 2015,
    sex: Sex.Male,
    tumorType: ''
  });

  const [exposures, setExposures] = useState<Exposure[]>([]);
  const [plan, setPlan] = useState<FollowUpPlan | null>(null);

  const handleGeneratePlan = () => {
    const generatedPlan = generateFollowUpPlan(patient, exposures, clinicianName);
    setPlan(generatedPlan);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Navbar - Hidden when printing */}
      <header className="bg-medical-700 shadow-sm no-print">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-lg font-bold text-white flex items-center">
            <span className="bg-white text-medical-700 p-1 rounded mr-2">SC</span>
            SurvivorCare
          </h1>
          <div className="text-white text-sm">
             Médico: <input type="text" value={clinicianName} onChange={e => setClinicianName(e.target.value)} className="bg-medical-800 border-none rounded px-2 py-1 text-white text-sm" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Progress Stepper - No Print */}
        <div className="mb-8 no-print">
            <div className="flex items-center">
                <div className={`flex-1 border-t-4 ${step >= 1 ? 'border-medical-600' : 'border-slate-200'} transition-colors`}></div>
                <span className={`px-4 font-bold ${step >= 1 ? 'text-medical-800' : 'text-slate-400'}`}>1. Paciente</span>
                <div className={`flex-1 border-t-4 ${step >= 2 ? 'border-medical-600' : 'border-slate-200'} transition-colors`}></div>
                <span className={`px-4 font-bold ${step >= 2 ? 'text-medical-800' : 'text-slate-400'}`}>2. Tratamiento</span>
                <div className={`flex-1 border-t-4 ${step >= 3 ? 'border-medical-600' : 'border-slate-200'} transition-colors`}></div>
                <span className={`px-4 font-bold ${step >= 3 ? 'text-medical-800' : 'text-slate-400'}`}>3. Plan</span>
                <div className={`flex-1 border-t-4 ${step >= 3 ? 'border-medical-600' : 'border-slate-200'} transition-colors`}></div>
            </div>
        </div>

        {/* Step 1: Patient Demographics */}
        {step === 1 && (
            <div className="space-y-6">
                <PatientForm patient={patient} setPatient={setPatient} />
                <div className="flex justify-end">
                    <button onClick={() => setStep(2)} className="bg-medical-600 text-white px-6 py-2 rounded-md hover:bg-medical-700 shadow-sm">Siguiente: Detalles del Tratamiento &rarr;</button>
                </div>
            </div>
        )}

        {/* Step 2: Treatment Exposures */}
        {step === 2 && (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800 mb-4">
                  <strong>Consejo:</strong> Puedes subir un PDF del resumen de tratamiento para autopoblar las exposiciones, o introducirlas manualmente usando los diccionarios de las guías COG/PanCare.
                </div>
                <TreatmentInput exposures={exposures} setExposures={setExposures} />
                <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="text-slate-600 px-6 py-2 hover:text-slate-900">&larr; Atrás</button>
                    <button 
                      onClick={handleGeneratePlan} 
                      disabled={exposures.length === 0}
                      className={`px-6 py-2 rounded-md shadow-sm text-white ${exposures.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-medical-600 hover:bg-medical-700'}`}
                    >
                        Generar Plan de Seguimiento
                    </button>
                </div>
            </div>
        )}

        {/* Step 3: Report */}
        {step === 3 && plan && (
            <div>
                <div className="mb-4 no-print">
                    <button onClick={() => setStep(2)} className="text-sm text-medical-600 hover:underline">&larr; Editar Datos de Tratamiento</button>
                </div>
                <FollowUpReport plan={plan} />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { FollowUpPlan, RiskLevel } from '../types';
// @ts-ignore (html2pdf a veces carece de tipos definidos)
import html2pdf from 'html2pdf.js';

interface Props {
  plan: FollowUpPlan;
}

export const FollowUpReport: React.FC<Props> = ({ plan }) => {
  const [view, setView] = useState<'clinician' | 'patient'>('clinician');
  const [isGenerating, setIsGenerating] = useState(false);

  const getRiskBadge = (level: RiskLevel) => {
    const colors = {
      [RiskLevel.High]: 'bg-red-100 text-red-800 border border-red-200',
      [RiskLevel.Moderate]: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      [RiskLevel.Low]: 'bg-green-100 text-green-800 border border-green-200',
    };
    const labels = {
      [RiskLevel.High]: 'Riesgo Alto',
      [RiskLevel.Moderate]: 'Riesgo Moderado',
      [RiskLevel.Low]: 'Riesgo Bajo',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[level]}`}>{labels[level]}</span>;
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 100));

    const element = document.getElementById('printable-report');
    
    if (!element) {
        alert("No se pudo encontrar el contenido del informe.");
        setIsGenerating(false);
        return;
    }

    const opt = {
      margin: [10, 10, 10, 10], 
      filename: `SurvivorCare_${view === 'clinician' ? 'Clinico' : 'Paciente'}_${plan.patient.id.slice(0,6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        windowWidth: 1200 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        // Uso directo de la librería importada
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("Error generando PDF:", err);
        alert("Hubo un error generando el PDF. Se abrirá la impresión del navegador.");
        window.print();
    }
    
    setIsGenerating(false);
  };

  return (
    // ... (El resto del JSX se mantiene idéntico al que subiste) ...
    // Copia exactamente el contenido del return(...) de tu archivo FollowUpReport.tsx original aquí
    <div className="space-y-6">
      {/* Controls - Hidden in Print */}
      <div className="flex justify-between items-center no-print bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex space-x-4">
          <button 
            onClick={() => setView('clinician')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'clinician' ? 'bg-medical-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            Informe Clínico
          </button>
          <button 
            onClick={() => setView('patient')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'patient' ? 'bg-medical-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            Guía para el Paciente
          </button>
        </div>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={`flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-medical-700 bg-medical-100 hover:bg-medical-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 ${isGenerating ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isGenerating ? (
             <>Generando...</>
          ) : (
             <>Descargar PDF</>
          )}
        </button>
      </div>

      {/* Printable Area */}
      <div className="bg-white p-10 shadow-lg print:shadow-none print:p-0 max-w-4xl mx-auto text-slate-900" id="printable-report">
        
        {/* Header */}
        <div className="border-b-2 border-medical-100 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-medical-800 tracking-tight">Plan de Seguimiento SurvivorCare</h1>
            <div className="mt-2 text-sm text-slate-500 flex flex-col">
              <span>Generado por: <span className="font-medium text-slate-700">{plan.generatedBy}</span></span>
              <span>Fecha: {plan.generatedAt.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right text-sm bg-slate-50 p-3 rounded-md border border-slate-100">
            <p className="mb-1"><span className="text-slate-500">Paciente ID:</span> <span className="font-mono font-medium">{plan.patient.id.slice(0,8)}</span></p>
            <p className="mb-1"><span className="text-slate-500">Edad:</span> <span className="font-medium">{plan.patient.age} años</span> ({plan.patient.sex === 'Male' ? 'H' : 'M'})</p>
            <p><span className="text-slate-500">Diagnóstico:</span> <span className="font-medium">{plan.patient.tumorType}</span> ({plan.patient.diagnosisYear})</p>
          </div>
        </div>

        {/* Content based on View */}
        {view === 'clinician' ? (
          <div className="space-y-8">
            {/* Exposure Summary */}
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
              <h2 className="font-bold text-medical-900 mb-3 text-sm uppercase tracking-wider flex items-center">
                Resumen del Tratamiento
              </h2>
              <div className="flex flex-wrap gap-2">
                {plan.exposures.length > 0 ? plan.exposures.map(e => (
                  <span key={e.id} className="bg-white border border-slate-300 px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm">
                    {e.name} {e.dose ? `(${e.dose} ${e.unit})` : ''}
                  </span>
                )) : <span className="text-slate-400 italic text-sm">Sin exposiciones registradas</span>}
              </div>
            </div>

            {/* Recommendations Table */}
            <div>
              <h2 className="font-bold text-xl mb-4 border-l-4 border-medical-500 pl-3 text-slate-800">Recomendaciones Estratificadas por Riesgo</h2>
              {plan.recommendations.length > 0 ? (
                <div className="overflow-hidden border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">Efecto Tardío</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/6">Riesgo</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">Prueba</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/6">Frecuencia</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-1/6">Ref.</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 text-sm">
                      {plan.recommendations.map(rec => (
                        <tr key={rec.id} className={rec.riskLevel === RiskLevel.High ? 'bg-red-50/50' : ''}>
                          <td className="px-4 py-4">
                              <div className="font-semibold text-slate-900">{rec.lateEffect}</div>
                              <div className="text-xs text-slate-500 mt-1 leading-tight">{rec.clinicianText}</div>
                          </td>
                          <td className="px-4 py-4 align-top">{getRiskBadge(rec.riskLevel)}</td>
                          <td className="px-4 py-4 align-top font-medium text-slate-800">{rec.test}</td>
                          <td className="px-4 py-4 align-top text-slate-700">{rec.frequency}</td>
                          <td className="px-4 py-4 text-slate-500 text-xs align-top">
                            <div className="font-medium">{rec.source}</div>
                            <div>(Nivel {rec.evidence})</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-500">No se encontraron recomendaciones específicas basadas en las exposiciones ingresadas.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 rounded-md border border-yellow-100 text-xs text-yellow-800">
              <p><strong>Nota Clínica:</strong> Estas recomendaciones se derivan automáticamente de las guías COG v6.0 y PanCare (2024). La implementación debe individualizarse según el juicio clínico y las comorbilidades del paciente.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Patient Friendly View */}
            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-bold text-medical-700">Tu Hoja de Ruta de Salud</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                ¡Hola! Basado en los tratamientos que recibiste para curar tu cáncer, hemos preparado esta guía personalizada. 
                El objetivo no es asustarte, sino darte el poder de mantenerte saludable. Muchos supervivientes tienen una vida plena y sana, 
                y estos controles son solo para asegurarnos de detectar cualquier pequeño problema antes de que se convierta en uno grande.
              </p>
            </div>

            <div className="grid gap-6">
              {plan.recommendations.map(rec => (
                <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-0 shadow-sm overflow-hidden break-inside-avoid">
                  <div className={`px-6 py-3 border-b flex items-center justify-between ${rec.riskLevel === RiskLevel.High ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${rec.riskLevel === RiskLevel.High ? 'bg-red-500' : 'bg-medical-500'}`}></span>
                      Salud {rec.lateEffect}
                    </h3>
                    {rec.riskLevel === RiskLevel.High && <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Importante</span>}
                  </div>
                  
                  <div className="p-6">
                    <p className="text-slate-700 mb-5 leading-relaxed text-base">{rec.patientText}</p>
                    
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start">
                      <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-full shadow-sm">
                        <svg className="h-5 w-5 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tu Plan de Acción</h4>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                           <span className="text-base font-bold text-medical-700">{rec.test}</span>
                           <span className="text-sm text-slate-600">({rec.frequency})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 break-inside-avoid mt-8">
              <div className="flex items-center mb-4">
                 <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                 </div>
                 <h3 className="font-bold text-xl text-green-800">Estilo de Vida: Lo que TÚ puedes hacer</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start p-3 bg-white/60 rounded-lg">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-green-900 text-sm">Lleva una dieta equilibrada rica en frutas, verduras y fibra para proteger tu corazón y colon.</span>
                </div>
                <div className="flex items-start p-3 bg-white/60 rounded-lg">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-green-900 text-sm"><strong>No fumes.</strong> Es el factor de riesgo #1 que más puedes controlar.</span>
                </div>
                <div className="flex items-start p-3 bg-white/60 rounded-lg">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-green-900 text-sm">Usa protector solar (SPF 30+) y ropa protectora, tu piel puede ser más sensible al sol.</span>
                </div>
                <div className="flex items-start p-3 bg-white/60 rounded-lg">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-green-900 text-sm">Mantén al día tu calendario de vacunación nacional (incluyendo gripe anual).</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Footer */}
        <div className="mt-16 pt-6 border-t border-slate-300 text-center text-xs text-slate-400 break-inside-avoid flex flex-col items-center">
          <p className="font-medium text-slate-500">© {new Date().getFullYear()} — SurvivorCare — Uso exclusivo investigación</p>
          <p className="mt-1">Generado con SurvivorCare v1.0</p>
        </div>
      </div>
    </div>
  );
};
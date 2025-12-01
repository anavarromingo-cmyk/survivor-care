import { Patient, Exposure, FollowUpPlan, FollowUpRecommendation } from '../types';
import { CLINICAL_RULES } from '../constants';

/**
 * Deterministic Risk Engine
 * Aplica reglas de COG/PanCare a las exposiciones del paciente.
 */
export const generateFollowUpPlan = (
  patient: Patient,
  exposures: Exposure[],
  clinicianName: string
): FollowUpPlan => {
  
  console.log("🚀 INICIANDO MOTOR DE RIESGO...");
  console.log("Pacientes:", patient);
  console.log("Exposiciones a analizar:", exposures.length);

  const recommendations: FollowUpRecommendation[] = [];

  // Iterar sobre cada exposición del paciente
  exposures.forEach(exposure => {
    console.log(`\n🔍 Analizando exposición: "${exposure.name}" (Tipo: ${exposure.type})`);

    // 1. Filtrar reglas que sean del mismo TIPO (Quimio vs Radio vs Cirugía)
    const potentialRules = CLINICAL_RULES.filter(
      r => r.exposureType === exposure.type
    );

    console.log(`   -> Se encontraron ${potentialRules.length} reglas potenciales para este tipo.`);

    potentialRules.forEach(rule => {
      // 2. Evaluar si cumple los criterios específicos (Nombre del fármaco, Dosis, Sexo, Edad...)
      try {
        const isMatch = rule.exposureCriteria(exposure, patient);

        if (isMatch) {
          console.log(`   ✅ ¡MATCH! Cumple regla: ${rule.id}`);
          recommendations.push({
            id: crypto.randomUUID(),
            ruleId: rule.id,
            lateEffect: rule.lateEffectCategory,
            riskLevel: rule.riskLevel,
            test: rule.testModality,
            frequency: rule.interval,
            startCriteria: rule.startTimeCondition,
            clinicianText: rule.recommendationTextClinician,
            patientText: rule.recommendationTextPatient,
            source: `${rule.guidelineSource} - ${rule.sectionReference}`,
            evidence: rule.evidenceStrength
          });
        } else {
           // Descomenta esto si quieres ver por qué fallan las reglas (puede llenar mucho la consola)
           // console.log(`      ❌ No cumple criterio para regla: ${rule.id}`);
        }
      } catch (err) {
        console.error(`      ⚠️ Error evaluando regla ${rule.id}:`, err);
      }
    });
  });

  // Eliminar duplicados (si varias drogas activan la misma regla de corazón, solo mostrar una vez)
  const uniqueRecommendations = recommendations.reduce((acc, current) => {
    const x = acc.find(item => item.ruleId === current.ruleId);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as FollowUpRecommendation[]);

  // Ordenar por nivel de riesgo (Alto primero)
  uniqueRecommendations.sort((a, b) => {
    const riskScore = { High: 3, Moderate: 2, Low: 1 };
    return riskScore[b.riskLevel] - riskScore[a.riskLevel];
  });

  console.log(`🏁 FINALIZADO. Recomendaciones generadas: ${uniqueRecommendations.length}`);
  
  return {
    patient,
    exposures,
    recommendations: uniqueRecommendations,
    generatedAt: new Date(),
    generatedBy: clinicianName
  };
};
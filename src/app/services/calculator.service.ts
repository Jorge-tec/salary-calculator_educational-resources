import { Injectable } from '@angular/core';
import { 
  LiquidationFormInput, 
  LiquidationResult, 
  FormulaStep, 
  YEAR_CONFIGS 
} from '../models/liquidation.model';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  /**
   * Cálculo de días según el estándar comercial laboral colombiano (mes de 30 días, año de 360 días).
   */
  calculateCommercialDays(startDateStr: string, endDateStr: string): number {
    if (!startDateStr || !endDateStr) return 0;

    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');

    if (end < start) return 0;

    const y1 = start.getFullYear();
    const m1 = start.getMonth() + 1;
    let d1 = start.getDate();

    const y2 = end.getFullYear();
    const m2 = end.getMonth() + 1;
    let d2 = end.getDate();

    // Ajuste comercial: si el día es 31, se computa como 30
    if (d1 === 31) d1 = 30;
    if (d2 === 31) d2 = 30;

    const days = (y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1) + 1;
    return Math.max(1, days);
  }

  /**
   * Convierte días comerciales a cadena legible "X años, Y meses y Z días"
   */
  formatWorkedTime(totalDays: number): string {
    const years = Math.floor(totalDays / 360);
    const remainderAfterYears = totalDays % 360;
    const months = Math.floor(remainderAfterYears / 30);
    const days = remainderAfterYears % 30;

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);

    return parts.join(', ');
  }

  calculateLiquidation(input: LiquidationFormInput): LiquidationResult {
    // 1. Obtener parámetros del año
    const yearConfig = YEAR_CONFIGS.find(y => y.year === input.smmlvYear) || YEAR_CONFIGS[0];
    const smmlv = input.customSmmlv && input.customSmmlv > 0 ? input.customSmmlv : yearConfig.smmlv;
    const baseSalary = Number(input.baseSalary) || 0;
    
    // Regla legal del CST y Ley 15 de 1959:
    // 1. Tope legal inquebrantable: ningún trabajador que devengue más de 2 SMMLV tiene derecho.
    // 2. Si devenga hasta 2 SMMLV, es opcional según la modalidad contractual (teletrabajo, suministro de ruta, etc.).
    const twoSmmlv = smmlv * 2;
    const qualifiesForTransport = baseSalary > 0 && baseSalary <= twoSmmlv;

    let appliesTransport = false;
    let transportAllowance = 0;
    let transportLegalStatusText = '';

    if (baseSalary <= 0) {
      transportLegalStatusText = 'Salario no ingresado';
    } else if (!qualifiesForTransport) {
      // Salario > 2 SMMLV -> INHABILITADO POR LA LEY 15 DE 1959
      appliesTransport = false;
      transportAllowance = 0;
      transportLegalStatusText = `No aplica por mandato legal: Salario > 2 SMMLV ($${baseSalary.toLocaleString('es-CO')} > $${twoSmmlv.toLocaleString('es-CO')})`;
    } else {
      // Salario <= 2 SMMLV -> Cumple tope, pero es OPCIONAL según modalidad de contrato
      const isIncluded = input.includeTransportAllowance !== false; // por defecto aplica si no se desmarca
      if (isIncluded) {
        appliesTransport = true;
        transportAllowance = input.customTransportAllowance !== undefined ? input.customTransportAllowance : yearConfig.transportAllowance;
        transportLegalStatusText = `Aplica Auxilio Legal ($${transportAllowance.toLocaleString('es-CO')}/mes - Cumple ≤ 2 SMMLV)`;
      } else {
        appliesTransport = false;
        transportAllowance = 0;
        switch (input.transportExclusionReason) {
          case 'TELETRABAJO':
            transportLegalStatusText = 'Excluido por tipo de contrato: Teletrabajo / Trabajo en Casa (Ley 2088/2020 - Sin desplazamiento)';
            break;
          case 'EMPRESA_SUMINISTRA':
            transportLegalStatusText = 'Excluido: Empleador suministra ruta/transporte completo (Ley 15/1959 Art. 2)';
            break;
          case 'VIVE_EN_SITIO':
            transportLegalStatusText = 'Excluido: Trabajador reside en el mismo lugar de trabajo';
            break;
          default:
            transportLegalStatusText = 'Excluido según estipulación del contrato de trabajo';
            break;
        }
      }
    }

    const salaryInSmmlv = smmlv > 0 ? Number((baseSalary / smmlv).toFixed(2)) : 0;
    const isHighSalary = baseSalary >= (10 * smmlv);

    // 2. Días laborados
    const workedDaysTotal = this.calculateCommercialDays(input.startDate, input.endDate);
    const timeWorkedString = this.formatWorkedTime(workedDaysTotal);

    // Días laborados en el año corriente (para cesantías e intereses)
    const end = new Date(input.endDate + 'T00:00:00');
    const startOfYear = `${end.getFullYear()}-01-01`;
    const effectiveYearStart = input.startDate > startOfYear ? input.startDate : startOfYear;
    const workedDaysCurrentYear = this.calculateCommercialDays(effectiveYearStart, input.endDate);

    // Días laborados en el semestre corriente (para prima de servicios)
    const isSecondSemester = end.getMonth() >= 6;
    const startOfSemester = isSecondSemester ? `${end.getFullYear()}-07-01` : `${end.getFullYear()}-01-01`;
    const effectiveSemesterStart = input.startDate > startOfSemester ? input.startDate : startOfSemester;
    const workedDaysCurrentSemester = this.calculateCommercialDays(effectiveSemesterStart, input.endDate);

    // Días faltantes de contrato (para término fijo u obra)
    let missingContractDays = 0;
    if (input.contractType === 'TERMINO_FIJO' && input.fixedContractEndDate) {
      missingContractDays = this.calculateCommercialDays(input.endDate, input.fixedContractEndDate) - 1;
      if (missingContractDays < 0) missingContractDays = 0;
    } else if (input.contractType === 'OBRA_LABOR') {
      if (input.fixedContractEndDate) {
        missingContractDays = this.calculateCommercialDays(input.endDate, input.fixedContractEndDate) - 1;
      }
      // Por ley, obra o labor nunca es inferior a 15 días si faltaba tiempo
      if (missingContractDays < 15) missingContractDays = 15;
    }

    // 3. Cálculos de bases salariales
    const baseWithTransport = baseSalary + transportAllowance;
    const dailyBaseSalary = baseSalary / 30;
    const dailyBaseWithTransport = baseWithTransport / 30;

    // 4. Salario pendiente
    const pendingDays = input.pendingSalaryDays || 0;
    const pendingSalaryAmount = Math.round(dailyBaseWithTransport * pendingDays);

    // 5. Cesantías (Art. 249 CST): (Salario Base + Aux. Transp) × Días año / 360
    const cesantiasAmount = Math.round((baseWithTransport * workedDaysCurrentYear) / 360);

    // 6. Intereses sobre Cesantías (Ley 52 de 1975): Cesantías × Días año × 0.12 / 360
    const interesesCesantiasAmount = Math.round((cesantiasAmount * workedDaysCurrentYear * 0.12) / 360);

    // 7. Prima de Servicios (Art. 306 CST): (Salario Base + Aux. Transp) × Días semestre / 360
    const primaServiciosAmount = Math.round((baseWithTransport * workedDaysCurrentSemester) / 360);

    // 8. Vacaciones (Art. 186 CST): Salario Base × Días / 720 (¡No incluye auxilio de transporte!)
    let vacationDaysCalculated = 0;
    let vacacionesAmount = 0;

    if (input.useCalculatedVacations) {
      vacationDaysCalculated = Number(((workedDaysTotal * 15) / 360).toFixed(2));
      vacacionesAmount = Math.round((input.baseSalary * workedDaysTotal) / 720);
    } else {
      vacationDaysCalculated = input.pendingVacationDays || 0;
      vacacionesAmount = Math.round(dailyBaseSalary * vacationDaysCalculated);
    }

    // 9. Indemnización por Despido (Art. 64 CST)
    let indemnityDays = 0;
    let indemnityAmount = 0;
    const formulaSteps: FormulaStep[] = [];

    // Fórmulas para prestaciones
    formulaSteps.push({
      concept: 'Salarios Pendientes',
      legalReference: 'Art. 134 del Código Sustantivo del Trabajo',
      lawBasis: 'Código Sustantivo del Trabajo (CST) - Pago de salarios acumulados devengados',
      formulaDescription: '(Salario Base + Auxilio de Transporte) ÷ 30 × Días Pendientes',
      mathExpression: `($${baseSalary.toLocaleString('es-CO')} + $${transportAllowance.toLocaleString('es-CO')}) ÷ 30 × ${pendingDays} días`,
      subtotal: pendingSalaryAmount,
      explanation: `Remuneración ordinaria pendiente por pagar de ${pendingDays} días al momento del retiro laboral.`,
      includesTransport: appliesTransport
    });

    formulaSteps.push({
      concept: 'Cesantías',
      legalReference: 'Art. 249 del Código Sustantivo del Trabajo',
      lawBasis: 'CST Art. 249 y Ley 1 de 1963 Art. 7 (Inclusión de Auxilio de Transporte)',
      formulaDescription: '(Salario Base + Auxilio Transporte) × Días Laborados en el Año ÷ 360',
      mathExpression: `($${baseSalary.toLocaleString('es-CO')} + $${transportAllowance.toLocaleString('es-CO')}) × ${workedDaysCurrentYear} ÷ 360`,
      subtotal: cesantiasAmount,
      explanation: `Un mes de salario por cada año laborado o proporcional por fracción en el periodo anual (${workedDaysCurrentYear} días en el año en curso).`,
      includesTransport: appliesTransport
    });

    formulaSteps.push({
      concept: 'Intereses sobre Cesantías',
      legalReference: 'Ley 52 de 1975 y Decreto Reglamentario 116 de 1976',
      lawBasis: 'Ley 52 de 1975 Art. 1 - Rendimiento del 12% anual sobre el saldo de cesantías',
      formulaDescription: '(Cesantías × Días Laborados Año × 12%) ÷ 360',
      mathExpression: `($${cesantiasAmount.toLocaleString('es-CO')} × ${workedDaysCurrentYear} × 0.12) ÷ 360`,
      subtotal: interesesCesantiasAmount,
      explanation: `Interés legal del 12% anual reconocido al trabajador sobre el valor acumulado de sus cesantías en el periodo anual.`,
      includesTransport: false,
      notes: 'Se calcula directamente sobre el valor final de las cesantías liquidadas.'
    });

    formulaSteps.push({
      concept: 'Prima de Servicios',
      legalReference: 'Art. 306 del Código Sustantivo del Trabajo',
      lawBasis: 'CST Art. 306 (Modificado por Ley 1788 de 2016 - Universalización de la Prima)',
      formulaDescription: '(Salario Base + Auxilio Transporte) × Días Laborados en el Semestre ÷ 360',
      mathExpression: `($${baseSalary.toLocaleString('es-CO')} + $${transportAllowance.toLocaleString('es-CO')}) × ${workedDaysCurrentSemester} ÷ 360`,
      subtotal: primaServiciosAmount,
      explanation: `15 días de salario por cada semestre trabajado o proporcionalmente por fracción (${workedDaysCurrentSemester} días en el semestre en curso).`,
      includesTransport: appliesTransport
    });

    formulaSteps.push({
      concept: 'Compensación de Vacaciones',
      legalReference: 'Art. 186 y Art. 192 del Código Sustantivo del Trabajo',
      lawBasis: 'CST Art. 186 y Art. 189 (Compensación en dinero al término del contrato)',
      formulaDescription: input.useCalculatedVacations
        ? 'Salario Base × Total Días Laborados ÷ 720'
        : 'Salario Diario (Base ÷ 30) × Días Pendientes Reportados',
      mathExpression: input.useCalculatedVacations
        ? `$${baseSalary.toLocaleString('es-CO')} × ${workedDaysTotal} ÷ 720`
        : `($${baseSalary.toLocaleString('es-CO')} ÷ 30) × ${vacationDaysCalculated} días`,
      subtotal: vacacionesAmount,
      explanation: `15 días hábiles remunerados por cada año de servicios prestados (${vacationDaysCalculated} días a liquidar). Nota: Por mandato expreso del Art. 192 CST, las vacaciones se liquidan EXCLUSIVAMENTE sobre el salario ordinario, excluyendo auxilio de transporte.`,
      includesTransport: false
    });

    // Cálculo de indemnización según motivo y tipo de contrato
    if (input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA') {
      if (input.contractType === 'INDEFINIDO') {
        if (!isHighSalary) {
          // Salario < 10 SMMLV (Art. 64 numeral 4 lit. a)
          // 30 días primer año + 20 días por año subsiguiente y proporcional
          if (workedDaysTotal <= 360) {
            indemnityDays = 30;
          } else {
            const extraDays = workedDaysTotal - 360;
            const extraIndemnityDays = (extraDays / 360) * 20;
            indemnityDays = 30 + extraIndemnityDays;
          }
          indemnityAmount = Math.round(dailyBaseSalary * indemnityDays);

          formulaSteps.push({
            concept: 'Indemnización por Despido sin Justa Causa (Término Indefinido)',
            legalReference: 'Art. 64 del CST, modificado por Ley 789 de 2002 Art. 28 (Salario < 10 SMMLV)',
            lawBasis: 'Código Sustantivo del Trabajo Art. 64 Numeral 4 Literal A',
            formulaDescription: workedDaysTotal <= 360
              ? '30 días de salario (Hasta 1 año de servicio)'
              : '30 días (1er año) + [ (Días adicionales ÷ 360) × 20 días ]',
            mathExpression: workedDaysTotal <= 360
              ? `($${baseSalary.toLocaleString('es-CO')} ÷ 30) × 30 días`
              : `($${baseSalary.toLocaleString('es-CO')} ÷ 30) × [ 30 + ((${workedDaysTotal} - 360) ÷ 360 × 20) = ${indemnityDays.toFixed(2)} días ]`,
            subtotal: indemnityAmount,
            explanation: `Al ganar menos de 10 SMMLV ($${baseSalary.toLocaleString('es-CO')} < $${(10 * smmlv).toLocaleString('es-CO')}), la ley otorga 30 días de salario por el primer año y 20 días por cada año subsiguiente o fracción proporcional. Total días indemnizables: ${indemnityDays.toFixed(2)} días.`,
            includesTransport: false
          });

        } else {
          // Salario >= 10 SMMLV (Art. 64 numeral 4 lit. b)
          // 20 días primer año + 15 días por año subsiguiente y proporcional
          if (workedDaysTotal <= 360) {
            indemnityDays = 20;
          } else {
            const extraDays = workedDaysTotal - 360;
            const extraIndemnityDays = (extraDays / 360) * 15;
            indemnityDays = 20 + extraIndemnityDays;
          }
          indemnityAmount = Math.round(dailyBaseSalary * indemnityDays);

          formulaSteps.push({
            concept: 'Indemnización por Despido sin Justa Causa (Término Indefinido - Salario Alto)',
            legalReference: 'Art. 64 del CST, modificado por Ley 789 de 2002 Art. 28 (Salario ≥ 10 SMMLV)',
            lawBasis: 'Código Sustantivo del Trabajo Art. 64 Numeral 4 Literal B',
            formulaDescription: workedDaysTotal <= 360
              ? '20 días de salario (Hasta 1 año de servicio)'
              : '20 días (1er año) + [ (Días adicionales ÷ 360) × 15 días ]',
            mathExpression: workedDaysTotal <= 360
              ? `($${baseSalary.toLocaleString('es-CO')} ÷ 30) × 20 días`
              : `($${baseSalary.toLocaleString('es-CO')} ÷ 30) × [ 20 + ((${workedDaysTotal} - 360) ÷ 360 × 15) = ${indemnityDays.toFixed(2)} días ]`,
            subtotal: indemnityAmount,
            explanation: `Al devengar 10 SMMLV o más ($${baseSalary.toLocaleString('es-CO')} ≥ $${(10 * smmlv).toLocaleString('es-CO')}), la ley otorga 20 días de salario por el primer año y 15 días adicionales por cada año subsiguiente o fracción. Total días indemnizables: ${indemnityDays.toFixed(2)} días.`,
            includesTransport: false
          });
        }
      } else if (input.contractType === 'TERMINO_FIJO') {
        indemnityDays = missingContractDays;
        indemnityAmount = Math.round(dailyBaseSalary * indemnityDays);

        formulaSteps.push({
          concept: 'Indemnización Contrato a Término Fijo',
          legalReference: 'Art. 64 del CST, numeral 3',
          lawBasis: 'Código Sustantivo del Trabajo Art. 64 Numeral 3 (Lucro cesante pactado)',
          formulaDescription: 'Salario Diario × Días Faltantes para el Vencimiento del Contrato',
          mathExpression: `($${baseSalary.toLocaleString('es-CO')} ÷ 30) × ${missingContractDays} días restantes`,
          subtotal: indemnityAmount,
          explanation: `El empleador debe cancelar el equivalente a los salarios del tiempo que faltare para cumplir el plazo estipulado del contrato (${missingContractDays} días hasta ${input.fixedContractEndDate || 'fin de contrato'}).`,
          includesTransport: false
        });
      } else if (input.contractType === 'OBRA_LABOR') {
        indemnityDays = missingContractDays;
        indemnityAmount = Math.round(dailyBaseSalary * indemnityDays);

        formulaSteps.push({
          concept: 'Indemnización Contrato por Obra o Labor',
          legalReference: 'Art. 64 del CST, numeral 3',
          lawBasis: 'Código Sustantivo del Trabajo Art. 64 Numeral 3',
          formulaDescription: 'Salarios del tiempo faltante para culminar la obra (Mínimo legal de 15 días)',
          mathExpression: `($${baseSalary.toLocaleString('es-CO')} ÷ 30) × ${missingContractDays} días`,
          subtotal: indemnityAmount,
          explanation: `El valor de los salarios correspondientes al tiempo faltante para completar la obra o labor determinada. La ley fija un mínimo indemnizable de 15 días de salario.`,
          includesTransport: false
        });
      }
    } else {
      // Justa causa o renuncia voluntaria
      indemnityDays = 0;
      indemnityAmount = 0;

      const reasonLabel = input.terminationReason === 'DESPIDO_CON_JUSTA_CAUSA' 
        ? 'Despido con Justa Causa (Art. 62 CST)' 
        : (input.terminationReason === 'RENUNCIA_VOLUNTARIA' ? 'Renuncia Voluntaria del Trabajador' : 'Vencimiento Natural del Plazo Pactado');

      formulaSteps.push({
        concept: 'Indemnización por Despido',
        legalReference: input.terminationReason === 'DESPIDO_CON_JUSTA_CAUSA' ? 'Art. 62 del CST' : 'Art. 61 del CST',
        lawBasis: 'Código Sustantivo del Trabajo - Terminación sin responsabilidad indemnizatoria para el empleador',
        formulaDescription: 'No genera indemnización ($0 COP)',
        mathExpression: '$0 COP',
        subtotal: 0,
        explanation: `En caso de ${reasonLabel}, la ley laboral colombiana NO obliga al empleador al pago de indemnización por perjuicios. Sin embargo, el trabajador conserva el derecho irrevocable e irrenunciable al pago completo de todas sus prestaciones sociales y salarios devengados.`,
        includesTransport: false
      });
    }

    const totalPrestaciones = pendingSalaryAmount + cesantiasAmount + interesesCesantiasAmount + primaServiciosAmount + vacacionesAmount;
    const totalLiquidacion = totalPrestaciones + indemnityAmount;

    return {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      input,
      workedDaysTotal,
      workedDaysCurrentYear,
      workedDaysCurrentSemester,
      missingContractDays,
      timeWorkedString,
      smmlv,
      transportAllowance,
      qualifiesForTransportBySalary: qualifiesForTransport,
      appliesTransportAllowance: appliesTransport,
      transportExclusionReason: input.transportExclusionReason,
      transportLegalStatusText,
      salaryInSmmlv,
      isHighSalary,
      pendingSalaryAmount,
      cesantiasAmount,
      interesesCesantiasAmount,
      primaServiciosAmount,
      vacacionesAmount,
      vacationDaysCalculated,
      indemnityDays: Number(indemnityDays.toFixed(2)),
      indemnityAmount,
      totalPrestaciones,
      totalLiquidacion,
      formulaSteps
    };
  }

  generateId(): string {
    return 'liq_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  }
}

export type TerminationReason = 
  | 'DESPIDO_SIN_JUSTA_CAUSA' 
  | 'DESPIDO_CON_JUSTA_CAUSA' 
  | 'RENUNCIA_VOLUNTARIA' 
  | 'TERMINACION_PLAZO_FIJO';

export type ContractType = 
  | 'INDEFINIDO' 
  | 'TERMINO_FIJO' 
  | 'OBRA_LABOR';

export interface YearConfig {
  year: number;
  smmlv: number;
  transportAllowance: number;
  label: string;
}

export const YEAR_CONFIGS: YearConfig[] = [
  {
    year: 2025,
    smmlv: 1423500,
    transportAllowance: 200000,
    label: '2025 (SMMLV: $1.423.500 | Aux. Transp: $200.000)'
  },
  {
    year: 2024,
    smmlv: 1300000,
    transportAllowance: 162000,
    label: '2024 (SMMLV: $1.300.000 | Aux. Transp: $162.000)'
  }
];

export type TransportExclusionReason = 
  | 'SUPERIOR_2_SMMLV' 
  | 'TELETRABAJO' 
  | 'EMPRESA_SUMINISTRA' 
  | 'VIVE_EN_SITIO' 
  | 'OTRA_EXCLUSION';

export interface LiquidationFormInput {
  employeeName: string;
  employeeId: string;
  companyName: string;
  contractType: ContractType;
  terminationReason: TerminationReason;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  fixedContractEndDate?: string; // Para término fijo u obra o labor
  baseSalary: number;
  includeTransportAllowance?: boolean; // Opcional si devenga <= 2 SMMLV
  transportExclusionReason?: TransportExclusionReason;
  customTransportAllowance?: number;
  pendingSalaryDays: number;
  pendingVacationDays?: number; // Si tiene saldo específico de días
  useCalculatedVacations: boolean; // Si calcula automáticamente desde fecha de inicio o usa días acumulados
  notes?: string;
  smmlvYear: number;
  customSmmlv?: number;
}

export interface FormulaStep {
  concept: string;
  legalReference: string;
  lawBasis: string;
  formulaDescription: string;
  mathExpression: string;
  subtotal: number;
  explanation: string;
  includesTransport: boolean;
  notes?: string;
}

export interface LiquidationResult {
  id: string;
  createdAt: string;
  input: LiquidationFormInput;
  
  // Días y periodos calculados
  workedDaysTotal: number;
  workedDaysCurrentYear: number;
  workedDaysCurrentSemester: number;
  missingContractDays: number;
  timeWorkedString: string;

  // Parámetros económicos
  smmlv: number;
  transportAllowance: number;
  qualifiesForTransportBySalary: boolean; // salario <= 2 SMMLV
  appliesTransportAllowance: boolean;
  transportExclusionReason?: TransportExclusionReason;
  transportLegalStatusText: string;
  salaryInSmmlv: number;
  isHighSalary: boolean; // >= 10 SMMLV

  // Desglose de liquidación
  pendingSalaryAmount: number;
  cesantiasAmount: number;
  interesesCesantiasAmount: number;
  primaServiciosAmount: number;
  vacacionesAmount: number;
  vacationDaysCalculated: number;
  
  // Indemnización
  indemnityDays: number;
  indemnityAmount: number;
  
  // Totales
  totalPrestaciones: number;
  totalLiquidacion: number;

  // Fórmulas detalladas
  formulaSteps: FormulaStep[];
}

import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DevengoItem {
  id: string;
  name: string;
  description: string;
  detail: string;
  weight: string;
  amount: number;
  category: 'fijos' | 'variables' | 'exentos';
  accentColor: string;
}

export interface DeduccionItem {
  id: string;
  name: string;
  description: string;
  rateType: string;
  quotaShare: string;
  amount: number;
  category: 'fiscales' | 'seg_social' | 'planes_flex';
  accentColor: string;
}

@Component({
  selector: 'app-payroll-processing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payroll-processing.component.html',
  styleUrl: './payroll-processing.component.css'
})
export class PayrollProcessingComponent {
  @Output() onOpenCalculator = new EventEmitter<void>();
  @Output() onOpenSimulation = new EventEmitter<void>();

  // Filter signals
  readonly devengosFilter = signal<'todos' | 'fijos' | 'variables' | 'exentos'>('todos');
  readonly deduccionesFilter = signal<'todos' | 'fiscales' | 'seg_social' | 'planes_flex'>('todos');

  // Interactive step signal
  readonly activeStep = signal<number>(3);
  readonly isCalculating = signal<boolean>(false);
  readonly showSuccessModal = signal<boolean>(false);
  readonly statusMessage = signal<string | null>(null);

  // Devengos Data
  readonly devengosList: DevengoItem[] = [
    {
      id: 'd1',
      name: 'Salario Base Fijo',
      description: 'Categoría profesional Convenio',
      detail: '1,420 contratos',
      weight: '74.8%',
      amount: 3450000,
      category: 'fijos',
      accentColor: '#2563eb'
    },
    {
      id: 'd2',
      name: 'Complementos de Puesto',
      description: 'Responsabilidad y disponibilidad',
      detail: '418 titulares',
      weight: '10.4%',
      amount: 480200,
      category: 'fijos',
      accentColor: '#3b82f6'
    },
    {
      id: 'd3',
      name: 'Horas Extras & Nocturnidad',
      description: '284 horas validadas en portal',
      detail: '86 registros',
      weight: '3.6%',
      amount: 165000,
      category: 'variables',
      accentColor: '#059669'
    },
    {
      id: 'd4',
      name: 'Bonos & Productividad',
      description: 'KPIs trimestrales certificados',
      detail: '210 incentivos',
      weight: '8.5%',
      amount: 39000,
      category: 'variables',
      accentColor: '#10b981'
    },
    {
      id: 'd5',
      name: 'Dietas y Beneficios Exentos',
      description: 'Transporte, kilometraje, guardería',
      detail: '512 empleados',
      weight: '2.7%',
      amount: 125000,
      category: 'exentos',
      accentColor: '#93c5fd'
    }
  ];

  // Deducciones Data
  readonly deduccionesList: DeduccionItem[] = [
    {
      id: 'r1',
      name: 'Retención IRPF (Hacienda)',
      description: 'Tipo medio ponderado estatal/autonómico',
      rateType: '21.4% medio',
      quotaShare: '62.4%',
      amount: 742000,
      category: 'fiscales',
      accentColor: '#dc2626'
    },
    {
      id: 'r2',
      name: 'Seguridad Social (Empleado)',
      description: 'Cuota obrera estándar obligatoria',
      rateType: '4.70% base cotiz.',
      quotaShare: '18.2%',
      amount: 216679.40,
      category: 'seg_social',
      accentColor: '#b91c1c'
    },
    {
      id: 'r3',
      name: 'Contingencias & Desempleo',
      description: 'Desempleo + FP + MEI aplicable',
      rateType: '1.60% tramo gen.',
      quotaShare: '6.2%',
      amount: 73760.60,
      category: 'seg_social',
      accentColor: '#64748b'
    },
    {
      id: 'r4',
      name: 'Anticipos y Préstamos',
      description: 'Amortización de anticipos concedidos',
      rateType: '19 nóminas',
      quotaShare: '2.7%',
      amount: 32000,
      category: 'planes_flex',
      accentColor: '#94a3b8'
    },
    {
      id: 'r5',
      name: 'Copago Seguro & Flex',
      description: 'Póliza médica privada + Guardería',
      rateType: '388 adheridos',
      quotaShare: '10.5%',
      amount: 125010,
      category: 'planes_flex',
      accentColor: '#93c5fd'
    }
  ];

  // Filtered views
  get filteredDevengos(): DevengoItem[] {
    const f = this.devengosFilter();
    if (f === 'todos') return this.devengosList;
    return this.devengosList.filter(item => item.category === f);
  }

  get filteredDeducciones(): DeduccionItem[] {
    const f = this.deduccionesFilter();
    if (f === 'todos') return this.deduccionesList;
    return this.deduccionesList.filter(item => item.category === f);
  }

  // Totals
  readonly totalDevengado = 4610200;
  readonly totalDeducciones = 1189450;
  readonly totalNeto = 3420750;
  readonly totalEmpleados = 1420;
  readonly totalPlantilla = 1428;
  readonly cuotaPatronal = 421750;

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  setStep(stepNumber: number): void {
    if (stepNumber <= 3) {
      this.activeStep.set(stepNumber);
    }
  }

  triggerValidation(): void {
    this.isCalculating.set(true);
    this.statusMessage.set('Validando reglas de nómina, bases cotizables e incidencias de asistencia...');
    setTimeout(() => {
      this.isCalculating.set(false);
      this.statusMessage.set('¡Cálculo verificado con éxito! Sin diferencias en cuadrante SEPA.');
      setTimeout(() => this.statusMessage.set(null), 4000);
    }, 1200);
  }

  openCstCalculator(): void {
    this.onOpenCalculator.emit();
  }

  downloadSepaXml(): void {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>RH-PAY-202410-001</MsgId>\n      <CreDtTm>2024-10-24T10:00:00Z</CreDtTm>\n      <NbOfTxs>1420</NbOfTxs>\n      <CtrlSum>3420750.00</CtrlSum>\n      <InitgPty><Nm>RH Enterprise Global S.L.</Nm></InitgPty>\n    </GrpHdr>\n  </CstmrCdtTrfInitn>\n</Document>`;
    const blob = new Blob([xmlHeader], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remesa_sepa_octubre_2024.xml';
    a.click();
    window.URL.revokeObjectURL(url);
    this.statusMessage.set('Descargado fichero SEPA XML: remesa_sepa_octubre_2024.xml');
    setTimeout(() => this.statusMessage.set(null), 3000);
  }

  downloadDraftPdf(): void {
    this.statusMessage.set('Generando lote de recibos individuales en formato PDF...');
    setTimeout(() => {
      this.statusMessage.set('Lote de 1,420 recibos generado correctamente en cola de impresión.');
      setTimeout(() => this.statusMessage.set(null), 3500);
    }, 1000);
  }

  sendToFinanceApproval(): void {
    this.activeStep.set(4);
    this.showSuccessModal.set(true);
  }

  closeModal(): void {
    this.showSuccessModal.set(false);
  }
}

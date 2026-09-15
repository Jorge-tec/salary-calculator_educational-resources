import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SalaryEquityRow {
  department: string;
  headcount: string;
  dotColor: string;
  p25: string;
  p50: string;
  p75: string;
  totalPayroll: string;
  parityRatio: string;
}

export interface PredefinedReport {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  framework: string;
  frequency: string;
  statusBadge: string;
  statusType: 'ok' | 'pwc' | 'closed' | 'error';
  lastUpdated: string;
  downloadType: 'dual' | 'pdf_only' | 'action';
}

@Component({
  selector: 'app-people-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './people-analytics.component.html',
  styleUrl: './people-analytics.component.css'
})
export class PeopleAnalyticsComponent {
  @Output() onOpenCalculator = new EventEmitter<void>();
  @Output() onOpenEvaluations = new EventEmitter<void>();

  readonly activePeriod = signal<'q3q4' | 'fiscal' | 'custom'>('q3q4');
  readonly toastMessage = signal<string | null>(null);
  readonly isScheduleModalOpen = signal<boolean>(false);
  readonly isRiskModalOpen = signal<boolean>(false);

  // Programar envío
  scheduleFrequency: string = 'Mensual (primer lunes de mes)';
  scheduleRecipients: string = 'direccion.rrhh@nexushr.es, comite.direccion@nexushr.es';
  scheduleFormat: string = 'PDF Ejecutivo + Resumen BI';

  // Datos de equidad salarial
  readonly equityRows = signal<SalaryEquityRow[]>([
    {
      department: 'Ingeniería & Tecnología',
      headcount: '482 FTE',
      dotColor: 'bg-primary',
      p25: '48.200 €',
      p50: '62.500 €',
      p75: '81.000 €',
      totalPayroll: '30.125.000 €',
      parityRatio: '99.4% (Par)'
    },
    {
      department: 'Ventas & Cuentas Clave',
      headcount: '320 FTE',
      dotColor: 'bg-primary-container',
      p25: '36.000 €',
      p50: '54.000 €',
      p75: '74.500 €',
      totalPayroll: '17.280.000 €',
      parityRatio: '98.8% (Par)'
    },
    {
      department: 'Operaciones & Soporte',
      headcount: '395 FTE',
      dotColor: 'bg-secondary',
      p25: '28.500 €',
      p50: '36.200 €',
      p75: '45.000 €',
      totalPayroll: '14.299.000 €',
      parityRatio: '99.1% (Par)'
    },
    {
      department: 'Legal, Compliance & Finanzas',
      headcount: '142 FTE',
      dotColor: 'bg-surface-variant',
      p25: '42.000 €',
      p50: '58.000 €',
      p75: '76.000 €',
      totalPayroll: '8.236.000 €',
      parityRatio: '99.6% (Par)'
    }
  ]);

  // Informes predefinidos
  readonly reports = signal<PredefinedReport[]>([
    {
      id: 'REP-01',
      title: 'Registro Retributivo Obligatorio',
      subtitle: 'Valores medios, medianas y complementos por grupo profesional',
      icon: 'table_view',
      framework: 'Real Decreto 902/2020',
      frequency: 'Anual / Continuo',
      statusBadge: 'Actualizado hoy',
      statusType: 'ok',
      lastUpdated: 'Hoy, 09:15',
      downloadType: 'dual'
    },
    {
      id: 'REP-02',
      title: 'Auditoría de Igualdad de Género Q3',
      subtitle: 'Diagnóstico cuantitativo e informe de impacto salarial paritario',
      icon: 'assignment_turned_in',
      framework: 'Ley Orgánica 3/2007',
      frequency: 'Trimestral',
      statusBadge: 'Certificado PwC',
      statusType: 'pwc',
      lastUpdated: '15 Oct 2024',
      downloadType: 'pdf_only'
    },
    {
      id: 'REP-03',
      title: 'Reporte Consolidado de Coste Laboral Total',
      subtitle: 'Costes brutos, cotizaciones SS empresariales, beneficios y previsiones',
      icon: 'account_balance_wallet',
      framework: 'Contabilidad de Gestión & IFRS',
      frequency: 'Mensual',
      statusBadge: 'Mensual Cerrado (Sep)',
      statusType: 'closed',
      lastUpdated: '01 Oct 2024',
      downloadType: 'dual'
    },
    {
      id: 'REP-04',
      title: 'Mapa de Riesgo de Fuga de Talento Clave (Predictivo AI)',
      subtitle: 'Modelo predictivo basado en feedback, antigüedad, bandas y promociones',
      icon: 'psychology',
      framework: 'Comité Retención Estratégica',
      frequency: 'En tiempo real',
      statusBadge: '14 alertas activas',
      statusType: 'error',
      lastUpdated: 'Hoy, 10:30',
      downloadType: 'action'
    }
  ]);

  exportExecutiveReport(): void {
    this.showToast('Generando Informe Ejecutivo Consolidado People Analytics (PDF / PowerBI / Excel)...');
    setTimeout(() => {
      this.showToast('Descarga completada: Executive_People_Analytics_Report_2024.pdf');
    }, 1500);
  }

  downloadReport(report: PredefinedReport, format: 'xlsx' | 'pdf'): void {
    this.showToast(`Descargando "${report.title}" en formato ${format.toUpperCase()}...`);
  }

  openScheduleModal(): void {
    this.isScheduleModalOpen.set(true);
  }

  closeScheduleModal(): void {
    this.isScheduleModalOpen.set(false);
  }

  saveSchedule(): void {
    this.closeScheduleModal();
    this.showToast('Envío automático configurado: se remitirá el informe a ' + this.scheduleRecipients);
  }

  openRiskModal(): void {
    this.isRiskModalOpen.set(true);
  }

  closeRiskModal(): void {
    this.isRiskModalOpen.set(false);
  }

  goTo9BoxGrid(): void {
    this.closeRiskModal();
    this.onOpenEvaluations.emit();
  }

  regenerateAllReports(): void {
    this.showToast('Regenerando datasets normativos con ETL en tiempo real...');
    setTimeout(() => {
      this.showToast('✔ Los 4 informes regulatorios han sido sincronizados y validados.');
    }, 1200);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4500);
  }
}

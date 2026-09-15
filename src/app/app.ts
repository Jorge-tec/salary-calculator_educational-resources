import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiquidationResult, LiquidationFormInput } from './models/liquidation.model';
import { StorageService } from './services/storage.service';
import { LiquidationFormComponent } from './components/liquidation-form/liquidation-form.component';
import { ResultsSummaryComponent } from './components/results-summary/results-summary.component';
import { FormulaInspectorComponent } from './components/formula-inspector/formula-inspector.component';
import { RecordsTableComponent } from './components/records-table/records-table.component';
import { PrintSheetComponent } from './components/print-sheet/print-sheet.component';
import { ExecutiveDashboardComponent } from './components/executive-dashboard/executive-dashboard.component';
import { VacationsCalendarComponent } from './components/vacations-calendar/vacations-calendar.component';
import { PayrollProcessingComponent } from './components/payroll-processing/payroll-processing.component';
import { EmployeeDirectoryComponent, DirectoryEmployee } from './components/employee-directory/employee-directory.component';
import { DocumentsContractsComponent } from './components/documents-contracts/documents-contracts.component';
import { PerformanceEvaluationsComponent } from './components/performance-evaluations/performance-evaluations.component';
import { TimeAttendanceComponent } from './components/time-attendance/time-attendance.component';
import { SystemConfigurationComponent } from './components/system-configuration/system-configuration.component';
import { PeopleAnalyticsComponent } from './components/people-analytics/people-analytics.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LiquidationFormComponent,
    ResultsSummaryComponent,
    FormulaInspectorComponent,
    RecordsTableComponent,
    PrintSheetComponent,
    ExecutiveDashboardComponent,
    VacationsCalendarComponent,
    PayrollProcessingComponent,
    EmployeeDirectoryComponent,
    DocumentsContractsComponent,
    PerformanceEvaluationsComponent,
    TimeAttendanceComponent,
    SystemConfigurationComponent,
    PeopleAnalyticsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly currentLiquidation = signal<LiquidationResult | null>(null);
  readonly editingInput = signal<LiquidationFormInput | null>(null);
  readonly printLiquidation = signal<LiquidationResult | null>(null);
  readonly activeView = signal<'dashboard' | 'calculator' | 'records' | 'normative' | 'vacations' | 'payroll' | 'directory' | 'documents' | 'evaluations' | 'attendance' | 'configuration' | 'analytics'>('analytics');
  readonly toastMessage = signal<string | null>(null);
  readonly sidebarCollapsed = signal<boolean>(false);
  readonly requestedPreset = signal<string | null>(null);
  
  // Búsqueda global
  globalSearchQuery: string = '';

  constructor(public storageService: StorageService) {}

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  goToView(view: 'dashboard' | 'calculator' | 'records' | 'normative' | 'vacations' | 'payroll' | 'directory' | 'documents' | 'evaluations' | 'attendance' | 'configuration' | 'analytics'): void {
    this.activeView.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startNewLiquidation(): void {
    this.editingInput.set(null);
    this.requestedPreset.set(null);
    this.goToView('calculator');
  }

  openCalculatorWithEmployee(emp: DirectoryEmployee): void {
    // Convierte el empleado del directorio en un input del formulario de liquidación CST
    const monthlySalary = Math.round(emp.baseSalary / 12);
    this.editingInput.set({
      employeeName: emp.name,
      employeeId: emp.code,
      companyName: 'NexusHR Enterprise (' + emp.location + ')',
      contractType: 'INDEFINIDO',
      terminationReason: 'DESPIDO_SIN_JUSTA_CAUSA',
      startDate: '2021-06-15',
      endDate: '2024-10-31',
      baseSalary: monthlySalary > 0 ? monthlySalary : 5500000,
      includeTransportAllowance: false,
      transportExclusionReason: 'SUPERIOR_2_SMMLV',
      pendingSalaryDays: 0,
      useCalculatedVacations: true,
      smmlvYear: 2024
    });
    this.showToast(`Datos cargados para simulación CST: ${emp.name} (${emp.role})`);
    this.goToView('calculator');
  }

  openWithPreset(presetKey: string): void {
    this.requestedPreset.set(presetKey);
    this.goToView('calculator');
  }

  onCalculationUpdated(result: LiquidationResult): void {
    this.currentLiquidation.set(result);
  }

  saveLiquidation(liquidation: LiquidationResult): void {
    this.storageService.saveLiquidation(liquidation);
    this.showToast(`Liquidación de "${liquidation.input.employeeName || 'Colaborador'}" guardada en la base de datos local.`);
  }

  loadRecordToForm(record: LiquidationResult): void {
    this.editingInput.set({ ...record.input });
    this.goToView('calculator');
    this.showToast(`Expediente cargado: ${record.input.employeeName || 'Colaborador'}`);
  }

  openPrintModal(liquidation: LiquidationResult): void {
    this.printLiquidation.set(liquidation);
  }

  closePrintModal(): void {
    this.printLiquidation.set(null);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }

  handleGlobalSearch(): void {
    if (!this.globalSearchQuery.trim()) return;
    this.goToView('records');
  }
}

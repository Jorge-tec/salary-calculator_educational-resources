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
  readonly activeView = signal<'dashboard' | 'calculator' | 'records' | 'normative' | 'vacations' | 'payroll' | 'directory' | 'documents' | 'evaluations' | 'attendance' | 'configuration' | 'analytics'>('dashboard');
  readonly toastMessage = signal<string | null>(null);
  readonly sidebarCollapsed = signal<boolean>(false);
  readonly requestedPreset = signal<string | null>(null);

  // Sede corporativa activa
  readonly activeSede = signal<string>('Sede Madrid (Principal)');
  readonly showSedeDropdown = signal<boolean>(false);
  readonly sedesList: string[] = [
    'Sede Madrid (Principal)',
    'Sede Barcelona (Tech Hub)',
    'Hub Remoto España (Teletrabajo)'
  ];

  // Centro de Notificaciones
  readonly showNotifications = signal<boolean>(false);
  readonly showUserProfile = signal<boolean>(false);
  readonly showHelpModal = signal<boolean>(false);
  readonly unreadNotificationsCount = signal<number>(4);
  readonly notificationsList = signal([
    {
      id: 'n1',
      title: 'Solicitud de vacaciones urgente: Sara Villanueva (10 días)',
      time: 'Hace 15 min',
      read: false,
      icon: 'flight_takeoff',
      targetView: 'vacations' as const
    },
    {
      id: 'n2',
      title: 'Fichaje fuera de tolerancia: 14 empleados con descuadre hoy',
      time: 'Hace 42 min',
      read: false,
      icon: 'schedule',
      targetView: 'attendance' as const
    },
    {
      id: 'n3',
      title: 'Contrato de obra y servicio vence en 6 días: Alejandro Ruiz',
      time: 'Hace 2 horas',
      read: false,
      icon: 'description',
      targetView: 'documents' as const
    },
    {
      id: 'n4',
      title: 'Cierre de nómina Octubre 2024 listo para validación SEPA',
      time: 'Hace 3 horas',
      read: false,
      icon: 'payments',
      targetView: 'payroll' as const
    }
  ]);
  
  // Búsqueda global
  globalSearchQuery: string = '';

  constructor(public storageService: StorageService) {}

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleSedeDropdown(): void {
    this.showSedeDropdown.update(v => !v);
  }

  selectSede(sede: string): void {
    this.activeSede.set(sede);
    this.showSedeDropdown.set(false);
    this.showToast(`Sede corporativa cambiada a: ${sede}`);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    this.showUserProfile.set(false);
  }

  toggleUserProfile(): void {
    this.showUserProfile.update(v => !v);
    this.showNotifications.set(false);
  }

  markAllNotificationsRead(): void {
    this.notificationsList.update(list => list.map(n => ({ ...n, read: true })));
    this.unreadNotificationsCount.set(0);
    this.showToast('Todas las notificaciones han sido marcadas como leídas.');
  }

  clickNotification(notif: any): void {
    notif.read = true;
    this.unreadNotificationsCount.update(c => Math.max(0, c - 1));
    this.showNotifications.set(false);
    this.goToView(notif.targetView);
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
    const q = this.globalSearchQuery.toLowerCase().trim();
    if (q.includes('vacaci') || q.includes('permiso') || q.includes('ausenc')) {
      this.goToView('vacations');
      this.showToast(`Búsqueda: filtrando en Vacaciones y Permisos por "${this.globalSearchQuery}"`);
    } else if (q.includes('nomin') || q.includes('pago') || q.includes('sepa') || q.includes('salari')) {
      this.goToView('payroll');
      this.showToast(`Búsqueda: navegando a Nómina Global por "${this.globalSearchQuery}"`);
    } else if (q.includes('fich') || q.includes('asistenc') || q.includes('hora') || q.includes('reloj')) {
      this.goToView('attendance');
      this.showToast(`Búsqueda: navegando a Control Horario por "${this.globalSearchQuery}"`);
    } else if (q.includes('contrat') || q.includes('doc') || q.includes('pdf') || q.includes('expedien')) {
      this.goToView('documents');
      this.showToast(`Búsqueda: navegando a Documentos y Contratos por "${this.globalSearchQuery}"`);
    } else if (q.includes('evalua') || q.includes('okr') || q.includes('9-box') || q.includes('rendimien')) {
      this.goToView('evaluations');
      this.showToast(`Búsqueda: navegando a Evaluaciones y 9-Box por "${this.globalSearchQuery}"`);
    } else if (q.includes('analit') || q.includes('report') || q.includes('rotac') || q.includes('kpi') || q.includes('bi')) {
      this.goToView('analytics');
      this.showToast(`Búsqueda: navegando a People Analytics por "${this.globalSearchQuery}"`);
    } else if (q.includes('config') || q.includes('sede') || q.includes('admin') || q.includes('rol')) {
      this.goToView('configuration');
      this.showToast(`Búsqueda: navegando a Configuración por "${this.globalSearchQuery}"`);
    } else if (q.includes('liquid') || q.includes('cst') || q.includes('indemniz')) {
      this.goToView('calculator');
      this.showToast(`Búsqueda: abriendo Calculadora CST por "${this.globalSearchQuery}"`);
    } else {
      this.goToView('directory');
      this.showToast(`Búsqueda de colaborador: "${this.globalSearchQuery}" en Directorio`);
    }
  }
}

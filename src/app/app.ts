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
    VacationsCalendarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly currentLiquidation = signal<LiquidationResult | null>(null);
  readonly editingInput = signal<LiquidationFormInput | null>(null);
  readonly printLiquidation = signal<LiquidationResult | null>(null);
  readonly activeView = signal<'dashboard' | 'calculator' | 'records' | 'normative' | 'vacations'>('vacations');
  readonly toastMessage = signal<string | null>(null);
  readonly sidebarCollapsed = signal<boolean>(false);
  readonly requestedPreset = signal<string | null>(null);
  
  // Búsqueda global
  globalSearchQuery: string = '';

  constructor(public storageService: StorageService) {}

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  goToView(view: 'dashboard' | 'calculator' | 'records' | 'normative' | 'vacations'): void {
    this.activeView.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startNewLiquidation(): void {
    this.editingInput.set(null);
    this.requestedPreset.set(null);
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

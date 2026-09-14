import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidationResult, LiquidationFormInput } from './models/liquidation.model';
import { StorageService } from './services/storage.service';
import { LiquidationFormComponent } from './components/liquidation-form/liquidation-form.component';
import { ResultsSummaryComponent } from './components/results-summary/results-summary.component';
import { FormulaInspectorComponent } from './components/formula-inspector/formula-inspector.component';
import { RecordsTableComponent } from './components/records-table/records-table.component';
import { PrintSheetComponent } from './components/print-sheet/print-sheet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LiquidationFormComponent,
    ResultsSummaryComponent,
    FormulaInspectorComponent,
    RecordsTableComponent,
    PrintSheetComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly currentLiquidation = signal<LiquidationResult | null>(null);
  readonly editingInput = signal<LiquidationFormInput | null>(null);
  readonly printLiquidation = signal<LiquidationResult | null>(null);
  readonly activeView = signal<'calculator' | 'records' | 'normative'>('calculator');
  readonly toastMessage = signal<string | null>(null);

  constructor(public storageService: StorageService) {}

  onCalculationUpdated(result: LiquidationResult): void {
    this.currentLiquidation.set(result);
  }

  saveLiquidation(liquidation: LiquidationResult): void {
    this.storageService.saveLiquidation(liquidation);
    this.showToast(`Liquidación de "${liquidation.input.employeeName || 'Colaborador'}" guardada en la tabla organizacional.`);
  }

  loadRecordToForm(record: LiquidationResult): void {
    this.editingInput.set({ ...record.input });
    this.activeView.set('calculator');
    this.showToast(`Caso cargado: ${record.input.employeeName || 'Colaborador'}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
}

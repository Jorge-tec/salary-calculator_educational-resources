import { Injectable, signal } from '@angular/core';
import { LiquidationResult } from '../models/liquidation.model';
import { CalculatorService } from './calculator.service';

const STORAGE_KEY = 'colombia_liquidaciones_saved_v1';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly savedLiquidationsSignal = signal<LiquidationResult[]>([]);
  public readonly savedLiquidations = this.savedLiquidationsSignal.asReadonly();

  constructor(private calculator: CalculatorService) {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as LiquidationResult[];
        this.savedLiquidationsSignal.set(parsed);
      } else {
        // Iniciar en blanco para que el evaluador/certificador ingrese sus propios datos
        this.savedLiquidationsSignal.set([]);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
      this.savedLiquidationsSignal.set([]);
    }
  }

  saveLiquidation(liquidation: LiquidationResult): void {
    const current = [...this.savedLiquidationsSignal()];
    const index = current.findIndex(item => item.id === liquidation.id);

    if (index >= 0) {
      current[index] = liquidation;
    } else {
      current.unshift(liquidation);
    }

    this.persist(current);
  }

  deleteLiquidation(id: string): void {
    const filtered = this.savedLiquidationsSignal().filter(item => item.id !== id);
    this.persist(filtered);
  }

  clearAll(): void {
    this.persist([]);
  }

  private persist(items: LiquidationResult[]): void {
    this.savedLiquidationsSignal.set(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error persisting to localStorage:', e);
    }
  }

  seedInitialCases(): void {
    const sample1 = this.calculator.calculateLiquidation({
      employeeName: 'Carlos Andrés Morales',
      employeeId: '1.020.450.789',
      companyName: 'Soluciones Andinas SAS',
      contractType: 'INDEFINIDO',
      terminationReason: 'DESPIDO_SIN_JUSTA_CAUSA',
      startDate: '2022-01-15',
      endDate: '2025-06-30',
      baseSalary: 2800000,
      pendingSalaryDays: 15,
      useCalculatedVacations: true,
      notes: 'Despido unilateral sin justa causa. Aplica indemnización por 3 años y 5 meses de servicio.',
      smmlvYear: 2025
    });

    const sample2 = this.calculator.calculateLiquidation({
      employeeName: 'Mariana Duque Vélez',
      employeeId: '1.144.321.890',
      companyName: 'Logística & Comercio SAS',
      contractType: 'TERMINO_FIJO',
      terminationReason: 'DESPIDO_SIN_JUSTA_CAUSA',
      startDate: '2024-01-01',
      endDate: '2024-09-30',
      fixedContractEndDate: '2024-12-31',
      baseSalary: 1800000,
      pendingSalaryDays: 30,
      useCalculatedVacations: true,
      notes: 'Contrato a 1 año terminado 3 meses antes sin causa justa. Indemnización por salarios faltantes.',
      smmlvYear: 2024
    });

    const sample3 = this.calculator.calculateLiquidation({
      employeeName: 'Jorge Eduardo Silva',
      employeeId: '79.845.123',
      companyName: 'Innovatech Colombia',
      contractType: 'INDEFINIDO',
      terminationReason: 'RENUNCIA_VOLUNTARIA',
      startDate: '2023-03-01',
      endDate: '2025-03-15',
      baseSalary: 5500000,
      pendingSalaryDays: 15,
      useCalculatedVacations: true,
      notes: 'Renuncia voluntaria irrevocable. No causa indemnización según CST.',
      smmlvYear: 2025
    });

    this.persist([sample1, sample2, sample3]);
  }

  exportToCSV(): void {
    const list = this.savedLiquidationsSignal();
    if (!list.length) return;

    const headers = [
      'ID',
      'Fecha Creación',
      'Colaborador',
      'Documento',
      'Empresa',
      'Tipo Contrato',
      'Motivo Terminación',
      'Fecha Inicio',
      'Fecha Fin',
      'Días Totales',
      'Salario Base',
      'Auxilio Transporte',
      'Salario Pendiente',
      'Cesantías',
      'Intereses Cesantías',
      'Prima Servicios',
      'Vacaciones',
      'Indemnización Art 64',
      'Total Liquidación'
    ];

    const rows = list.map(item => [
      `"${item.id}"`,
      `"${item.createdAt}"`,
      `"${item.input.employeeName}"`,
      `"${item.input.employeeId || ''}"`,
      `"${item.input.companyName || ''}"`,
      `"${item.input.contractType}"`,
      `"${item.input.terminationReason}"`,
      `"${item.input.startDate}"`,
      `"${item.input.endDate}"`,
      item.workedDaysTotal,
      item.input.baseSalary,
      item.transportAllowance,
      item.pendingSalaryAmount,
      item.cesantiasAmount,
      item.interesesCesantiasAmount,
      item.primaServiciosAmount,
      item.vacacionesAmount,
      item.indemnityAmount,
      item.totalLiquidacion
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `liquidaciones_laborales_colombia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

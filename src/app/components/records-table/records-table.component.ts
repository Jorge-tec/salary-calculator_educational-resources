import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiquidationResult, TerminationReason } from '../../models/liquidation.model';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-records-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-container-card">
      <div class="table-header">
        <div class="header-info">
          <div class="badge-row">
            <span class="badge-count">{{ records().length }} registros</span>
            <span class="badge-status">Persistencia Local Activa</span>
          </div>
          <h3>Tabla Organizacional de Validaciones Guardadas</h3>
          <p class="subtitle">Guarda, compara y gestiona diferentes escenarios y liquidaciones laborales</p>
        </div>

        <div class="header-actions">
          <button type="button" class="btn-seed-demo" (click)="storageService.seedInitialCases()">
            🧪 Cargar Casos de Prueba
          </button>
          <button type="button" class="btn-outline" (click)="storageService.exportToCSV()" [disabled]="records().length === 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar a CSV
          </button>
          <button type="button" class="btn-danger-outline" (click)="clearAllRecords()" [disabled]="records().length === 0">
            Limpiar Todo
          </button>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filter-toolbar">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Buscar por colaborador, documento o empresa..." 
            class="search-input" />
        </div>

        <div class="filter-pills">
          <button 
            type="button" 
            class="pill" 
            [class.active]="selectedFilter() === 'ALL'"
            (click)="selectedFilter.set('ALL')">
            Todos ({{ records().length }})
          </button>
          <button 
            type="button" 
            class="pill" 
            [class.active]="selectedFilter() === 'DESPIDO_SIN_JUSTA_CAUSA'"
            (click)="selectedFilter.set('DESPIDO_SIN_JUSTA_CAUSA')">
            Despido Injustificado
          </button>
          <button 
            type="button" 
            class="pill" 
            [class.active]="selectedFilter() === 'DESPIDO_CON_JUSTA_CAUSA'"
            (click)="selectedFilter.set('DESPIDO_CON_JUSTA_CAUSA')">
            Con Justa Causa
          </button>
          <button 
            type="button" 
            class="pill" 
            [class.active]="selectedFilter() === 'RENUNCIA_VOLUNTARIA'"
            (click)="selectedFilter.set('RENUNCIA_VOLUNTARIA')">
            Renuncia
          </button>
        </div>
      </div>

      <!-- Tabla Principal -->
      <div class="table-responsive">
        @if (filteredRecords().length === 0) {
          <div class="empty-table-state">
            <div class="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h4>Tabla Organizacional Vacía</h4>
            <p>Puedes calcular tus propios casos desde el formulario en blanco y guardarlos aquí, o presionar el siguiente botón para cargar 3 casos de prueba demostrativos.</p>
            <button type="button" class="btn-seed-large" (click)="storageService.seedInitialCases()">
              🧪 Cargar 3 Casos de Prueba (Demo)
            </button>
          </div>
        } @else {
          <table class="org-table">
            <thead>
              <tr>
                <th>Colaborador & Empresa</th>
                <th>Tipo de Contrato</th>
                <th>Motivo de Retiro</th>
                <th>Tiempo Laborado</th>
                <th>Salario Base</th>
                <th>Indemnización</th>
                <th>Prestaciones</th>
                <th>Total a Pagar</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredRecords(); track item.id) {
                <tr [class.selected-row]="activeId === item.id">
                  <td>
                    <div class="employee-cell">
                      <span class="emp-name">{{ item.input.employeeName || 'Sin nombre' }}</span>
                      <span class="emp-meta">
                        CC: {{ item.input.employeeId || 'N/A' }} 
                        @if (item.input.companyName) {
                          &bull; {{ item.input.companyName }}
                        }
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge-contract">{{ formatContractType(item.input.contractType) }}</span>
                  </td>
                  <td>
                    <span class="badge-reason" [ngClass]="getReasonBadgeClass(item.input.terminationReason)">
                      {{ formatReason(item.input.terminationReason) }}
                    </span>
                  </td>
                  <td>
                    <div class="time-cell">
                      <strong>{{ item.workedDaysTotal }} días</strong>
                      <span class="sub-date">{{ item.input.startDate }} al {{ item.input.endDate }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="salary-cell">
                      <span>{{ item.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
                      @if (item.transportAllowance > 0) {
                        <span class="transp-badge">+ Transp.</span>
                      }
                    </div>
                  </td>
                  <td>
                    @if (item.indemnityAmount > 0) {
                      <span class="indemnity-amount">
                        {{ item.indemnityAmount | currency:'COP':'symbol-narrow':'1.0-0' }}
                        <small>({{ item.indemnityDays }} d)</small>
                      </span>
                    } @else {
                      <span class="no-indemnity-text">$0 COP</span>
                    }
                  </td>
                  <td>
                    <span class="prestaciones-amount">
                      {{ item.totalPrestaciones | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </td>
                  <td>
                    <span class="total-badge">
                      {{ item.totalLiquidacion | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        type="button" 
                        class="act-btn load" 
                        title="Cargar al formulario para editar o inspeccionar"
                        (click)="onLoadRecord.emit(item)">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Cargar
                      </button>
                      <button 
                        type="button" 
                        class="act-btn print" 
                        title="Imprimir acta de liquidación"
                        (click)="onPrintRecord.emit(item)">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="6 9 6 2 18 2 18 9"></polyline>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                          <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        class="act-btn delete" 
                        title="Eliminar registro"
                        (click)="deleteRecord(item.id)">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .table-container-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
    }

    .badge-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.4rem;
    }

    .badge-count {
      background: #0284c7;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }

    .badge-status {
      background: #f1f5f9;
      color: #64748b;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }

    .header-info h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn-seed-demo {
      background: #eff6ff;
      border: 1px solid #93c5fd;
      color: #1d4ed8;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-seed-demo:hover {
      background: #1d4ed8;
      color: #ffffff;
      border-color: #1d4ed8;
    }

    .btn-seed-large {
      margin-top: 1rem;
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
    }

    .btn-seed-large:hover {
      background: #0369a1;
      transform: translateY(-1px);
    }

    .btn-outline, .btn-danger-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-outline {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
    }

    .btn-outline:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-danger-outline {
      border: 1px solid #fecaca;
      background: #fff5f5;
      color: #dc2626;
    }

    .btn-danger-outline:hover:not(:disabled) {
      background: #fee2e2;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .filter-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.45rem 0.85rem;
      flex: 1;
      min-width: 260px;
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.85rem;
      color: #1e293b;
      width: 100%;
    }

    .filter-pills {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
    }

    .pill {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #64748b;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .pill:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .pill.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    .table-responsive {
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }

    .org-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.84rem;
      text-align: left;
    }

    .org-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .org-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }

    .selected-row {
      background: #f0fdf4;
    }

    .employee-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .emp-name {
      font-weight: 700;
      color: #0f172a;
    }

    .emp-meta {
      font-size: 0.73rem;
      color: #64748b;
    }

    .badge-contract {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      background: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .badge-reason {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .badge-reason.unjustified { background: #fee2e2; color: #b91c1c; }
    .badge-reason.justified { background: #fef3c7; color: #b45309; }
    .badge-reason.resignation { background: #e0e7ff; color: #4338ca; }
    .badge-reason.term { background: #f1f5f9; color: #475569; }

    .time-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .sub-date {
      font-size: 0.72rem;
      color: #64748b;
    }

    .salary-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      font-weight: 600;
    }

    .transp-badge {
      font-size: 0.68rem;
      color: #059669;
      font-weight: 700;
    }

    .indemnity-amount {
      color: #dc2626;
      font-weight: 800;
    }

    .indemnity-amount small {
      color: #64748b;
      font-weight: normal;
      margin-left: 0.2rem;
    }

    .no-indemnity-text {
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .prestaciones-amount {
      font-weight: 600;
      color: #0f172a;
    }

    .total-badge {
      display: inline-block;
      font-size: 0.9rem;
      font-weight: 800;
      color: #0369a1;
      background: #f0f9ff;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
    }

    .actions-col {
      text-align: right;
    }

    .action-buttons {
      display: flex;
      gap: 0.35rem;
      justify-content: flex-end;
    }

    .act-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s;
    }

    .act-btn.load {
      background: #f8fafc;
      color: #0284c7;
      border-color: #bae6fd;
    }

    .act-btn.load:hover {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }

    .act-btn.print:hover {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    .act-btn.delete {
      color: #ef4444;
      border-color: #fecaca;
    }

    .act-btn.delete:hover {
      background: #ef4444;
      color: #ffffff;
      border-color: #ef4444;
    }

    .empty-table-state {
      text-align: center;
      padding: 3.5rem 1.5rem;
      color: #64748b;
    }

    .empty-icon {
      margin-bottom: 0.75rem;
    }

    .empty-table-state h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.4rem 0;
    }

    .empty-table-state p {
      font-size: 0.85rem;
      max-width: 420px;
      margin: 0 auto;
    }
  `]
})
export class RecordsTableComponent {
  @Input() activeId: string = '';
  @Output() onLoadRecord = new EventEmitter<LiquidationResult>();
  @Output() onPrintRecord = new EventEmitter<LiquidationResult>();

  searchQuery = '';
  readonly selectedFilter = signal<'ALL' | TerminationReason>('ALL');

  constructor(public storageService: StorageService) {}

  get records() {
    return this.storageService.savedLiquidations;
  }

  readonly filteredRecords = computed(() => {
    let list = this.records();
    const query = this.searchQuery.toLowerCase().trim();
    const filter = this.selectedFilter();

    if (filter !== 'ALL') {
      list = list.filter(item => item.input.terminationReason === filter);
    }

    if (query) {
      list = list.filter(item => 
        (item.input.employeeName && item.input.employeeName.toLowerCase().includes(query)) ||
        (item.input.employeeId && item.input.employeeId.toLowerCase().includes(query)) ||
        (item.input.companyName && item.input.companyName.toLowerCase().includes(query))
      );
    }

    return list;
  });

  deleteRecord(id: string): void {
    if (confirm('¿Estás seguro de eliminar este registro de liquidación?')) {
      this.storageService.deleteLiquidation(id);
    }
  }

  clearAllRecords(): void {
    if (confirm('¿Deseas eliminar TODAS las liquidaciones guardadas?')) {
      this.storageService.clearAll();
    }
  }

  formatContractType(type: string): string {
    switch (type) {
      case 'INDEFINIDO': return 'Término Indefinido';
      case 'TERMINO_FIJO': return 'Término Fijo';
      case 'OBRA_LABOR': return 'Obra o Labor';
      default: return type;
    }
  }

  formatReason(reason: string): string {
    switch (reason) {
      case 'DESPIDO_SIN_JUSTA_CAUSA': return 'Despido Sin Justa Causa';
      case 'DESPIDO_CON_JUSTA_CAUSA': return 'Despido Con Justa Causa';
      case 'RENUNCIA_VOLUNTARIA': return 'Renuncia Voluntaria';
      case 'TERMINACION_PLAZO_FIJO': return 'Fin Plazo Pactado';
      default: return reason;
    }
  }

  getReasonBadgeClass(reason: string): string {
    switch (reason) {
      case 'DESPIDO_SIN_JUSTA_CAUSA': return 'unjustified';
      case 'DESPIDO_CON_JUSTA_CAUSA': return 'justified';
      case 'RENUNCIA_VOLUNTARIA': return 'resignation';
      default: return 'term';
    }
  }
}

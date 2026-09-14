import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidationResult } from '../../models/liquidation.model';

@Component({
  selector: 'app-results-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!liquidation || (liquidation.workedDaysTotal === 0 && (!liquidation.input.baseSalary || liquidation.input.baseSalary <= 0))) {
      <div class="empty-results-card">
        <div class="empty-results-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2"></rect>
            <line x1="8" y1="6" x2="16" y2="6"></line>
            <line x1="16" y1="14" x2="16" y2="18"></line>
            <path d="M16 10h.01"></path>
            <path d="M12 10h.01"></path>
            <path d="M8 10h.01"></path>
          </svg>
        </div>
        <h3>Formulario en Blanco &bull; Listo para Evaluar</h3>
        <p>Ingresa la <strong>Fecha de Ingreso</strong>, <strong>Fecha de Retiro</strong> y el <strong>Salario Básico</strong> para generar la liquidación en tiempo real, o carga un escenario en la barra superior de <strong>Versión de Pruebas</strong>.</p>
      </div>
    } @else {
      <div class="results-container">
        <!-- Tarjeta Principal: Total a Pagar -->
        <div class="hero-total-card">
          <div class="hero-content">
            <div class="hero-text">
              <span class="hero-badge">Total Liquidación Definitiva</span>
              <h2 class="hero-amount">{{ liquidation.totalLiquidacion | currency:'COP':'symbol-narrow':'1.0-0' }}</h2>
              <p class="hero-detail">
                Para <strong>{{ liquidation.input.employeeName || 'Colaborador' }}</strong> &bull;
                {{ liquidation.workedDaysTotal }} días trabajados ({{ liquidation.timeWorkedString }})
              </p>
            </div>
            <div class="hero-actions">
              <button type="button" class="btn-primary" (click)="onSave.emit(liquidation)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Guardar en Tabla
              </button>
              <button type="button" class="btn-secondary" (click)="onPrint.emit(liquidation)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Imprimir Liquidación / PDF
              </button>
            </div>
          </div>

          <!-- Barra de composición porcentual -->
          @if (liquidation.totalLiquidacion > 0) {
            <div class="breakdown-bar">
              @if (liquidation.indemnityAmount > 0) {
                <div 
                  class="bar-slice indemnity" 
                  [style.width.%]="(liquidation.indemnityAmount / liquidation.totalLiquidacion) * 100" 
                  title="Indemnización: {{ (liquidation.indemnityAmount / liquidation.totalLiquidacion) * 100 | number:'1.0-1' }}%">
                </div>
              }
              <div 
                class="bar-slice cesantias" 
                [style.width.%]="(liquidation.cesantiasAmount / liquidation.totalLiquidacion) * 100"
                title="Cesantías: {{ (liquidation.cesantiasAmount / liquidation.totalLiquidacion) * 100 | number:'1.0-1' }}%">
              </div>
              <div 
                class="bar-slice prima" 
                [style.width.%]="(liquidation.primaServiciosAmount / liquidation.totalLiquidacion) * 100"
                title="Prima: {{ (liquidation.primaServiciosAmount / liquidation.totalLiquidacion) * 100 | number:'1.0-1' }}%">
              </div>
              <div 
                class="bar-slice vacaciones" 
                [style.width.%]="(liquidation.vacacionesAmount / liquidation.totalLiquidacion) * 100"
                title="Vacaciones: {{ (liquidation.vacacionesAmount / liquidation.totalLiquidacion) * 100 | number:'1.0-1' }}%">
              </div>
              @if (liquidation.pendingSalaryAmount > 0) {
                <div 
                  class="bar-slice salario" 
                  [style.width.%]="(liquidation.pendingSalaryAmount / liquidation.totalLiquidacion) * 100"
                  title="Salario Pendiente: {{ (liquidation.pendingSalaryAmount / liquidation.totalLiquidacion) * 100 | number:'1.0-1' }}%">
                </div>
              }
            </div>
          }
        </div>

        <!-- Tarjetas de desglose rápido -->
        <div class="metric-grid">
          <!-- Indemnización Art. 64 -->
          <div class="metric-card highlight" [class.no-indemnity]="liquidation.indemnityAmount === 0">
            <div class="metric-top">
              <span class="metric-label">Indemnización Art. 64 CST</span>
              <span class="tag-status" [class.danger]="liquidation.indemnityAmount > 0" [class.neutral]="liquidation.indemnityAmount === 0">
                {{ liquidation.indemnityAmount > 0 ? (liquidation.indemnityDays + ' días de salario') : 'No aplica ($0)' }}
              </span>
            </div>
            <div class="metric-val" [class.red]="liquidation.indemnityAmount > 0">
              {{ liquidation.indemnityAmount | currency:'COP':'symbol-narrow':'1.0-0' }}
            </div>
            <div class="metric-desc">
              @if (liquidation.input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA') {
                Despido sin justa causa comprobada
              } @else if (liquidation.input.terminationReason === 'DESPIDO_CON_JUSTA_CAUSA') {
                Despido con justa causa (Art. 62 CST)
              } @else {
                Renuncia voluntaria del trabajador
              }
            </div>
          </div>

          <!-- Total Prestaciones Sociales -->
          <div class="metric-card">
            <div class="metric-top">
              <span class="metric-label">Prestaciones Sociales</span>
              <span class="tag-status success">Ley Laboral</span>
            </div>
            <div class="metric-val">
              {{ (liquidation.cesantiasAmount + liquidation.interesesCesantiasAmount + liquidation.primaServiciosAmount + liquidation.vacacionesAmount) | currency:'COP':'symbol-narrow':'1.0-0' }}
            </div>
            <div class="metric-desc">
              Cesantías, Intereses, Prima y Vacaciones
            </div>
          </div>

          <!-- Salario Pendiente -->
          <div class="metric-card">
            <div class="metric-top">
              <span class="metric-label">Salarios Pendientes</span>
              <span class="tag-status info">{{ liquidation.input.pendingSalaryDays }} días</span>
            </div>
            <div class="metric-val">
              {{ liquidation.pendingSalaryAmount | currency:'COP':'symbol-narrow':'1.0-0' }}
            </div>
            <div class="metric-desc">
              Remuneración debida al retiro
            </div>
          </div>

          <!-- Salario Base Referencia -->
          <div class="metric-card">
            <div class="metric-top">
              <span class="metric-label">Salario Base Mensual</span>
              <span class="tag-status purple">{{ liquidation.salaryInSmmlv }} SMMLV</span>
            </div>
            <div class="metric-val">
              {{ liquidation.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}
            </div>
            <div class="metric-desc">
              Aux. Transporte: 
              @if (liquidation.appliesTransportAllowance) {
                <strong style="color: #059669;">{{ liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
              } @else if (!liquidation.qualifiesForTransportBySalary) {
                <span style="color: #dc2626;">Inhabilitado (> 2 SMMLV)</span>
              } @else {
                <span style="color: #d97706;">Excluido por modalidad de contrato</span>
              }
            </div>
          </div>
        </div>

        <!-- Tabla detallada de rubros -->
        <div class="detailed-table-box">
          <table class="summary-table">
            <thead>
              <tr>
                <th>Concepto Legal</th>
                <th>Base de Cálculo</th>
                <th>Días / Factor</th>
                <th>Normativa</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              @if (liquidation.pendingSalaryAmount > 0) {
                <tr>
                  <td><strong>Salario Pendiente</strong></td>
                  <td>{{ liquidation.input.baseSalary + liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ liquidation.input.pendingSalaryDays }} días</td>
                  <td>Art. 134 CST</td>
                  <td class="text-right amount">{{ liquidation.pendingSalaryAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
              }
              <tr>
                <td><strong>Cesantías</strong></td>
                <td>{{ liquidation.input.baseSalary + liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                <td>{{ liquidation.workedDaysCurrentYear }} días en año</td>
                <td>Art. 249 CST</td>
                <td class="text-right amount">{{ liquidation.cesantiasAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </tr>
              <tr>
                <td><strong>Intereses sobre Cesantías</strong></td>
                <td>{{ liquidation.cesantiasAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                <td>12% anual proporcional</td>
                <td>Ley 52 de 1975</td>
                <td class="text-right amount">{{ liquidation.interesesCesantiasAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </tr>
              <tr>
                <td><strong>Prima de Servicios</strong></td>
                <td>{{ liquidation.input.baseSalary + liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                <td>{{ liquidation.workedDaysCurrentSemester }} días en semestre</td>
                <td>Art. 306 CST</td>
                <td class="text-right amount">{{ liquidation.primaServiciosAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </tr>
              <tr>
                <td><strong>Vacaciones Compensadas</strong></td>
                <td>{{ liquidation.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }} <span class="no-transp">(sin transp.)</span></td>
                <td>{{ liquidation.vacationDaysCalculated }} días</td>
                <td>Art. 186 CST</td>
                <td class="text-right amount">{{ liquidation.vacacionesAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </tr>
              <tr class="indemnity-row" [class.zero]="liquidation.indemnityAmount === 0">
                <td>
                  <strong>Indemnización por Despido</strong>
                  <span class="sub-label">
                    {{ liquidation.input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA' ? 'Sin Justa Causa' : 'No Causa Indemnización' }}
                  </span>
                </td>
                <td>{{ liquidation.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                <td>{{ liquidation.indemnityDays }} días de salario</td>
                <td>Art. 64 CST</td>
                <td class="text-right amount red">{{ liquidation.indemnityAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="total-label">TOTAL LIQUIDACIÓN DEFINITIVA A PAGAR:</td>
                <td class="text-right total-val">{{ liquidation.totalLiquidacion | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    }
  `,
  styles: [`
    .results-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .hero-total-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.25);
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.25rem;
    }

    .hero-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      margin-bottom: 0.5rem;
    }

    .hero-amount {
      font-size: 2.3rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 0.4rem 0;
      color: #ffffff;
    }

    .hero-detail {
      font-size: 0.88rem;
      color: #94a3b8;
      margin: 0;
    }

    .hero-detail strong {
      color: #f1f5f9;
    }

    .hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-primary {
      background: #0284c7;
      color: #ffffff;
    }

    .btn-primary:hover {
      background: #0369a1;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      backdrop-filter: blur(8px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .breakdown-bar {
      display: flex;
      height: 8px;
      border-radius: 9999px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.1);
      gap: 2px;
    }

    .bar-slice.indemnity { background: #ef4444; }
    .bar-slice.cesantias { background: #3b82f6; }
    .bar-slice.prima { background: #10b981; }
    .bar-slice.vacaciones { background: #f59e0b; }
    .bar-slice.salario { background: #8b5cf6; }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.15rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    }

    .metric-card.highlight {
      border-left: 4px solid #ef4444;
    }

    .metric-card.highlight.no-indemnity {
      border-left: 4px solid #94a3b8;
    }

    .metric-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .metric-label {
      font-size: 0.76rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .tag-status {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
    }

    .tag-status.danger { background: #fee2e2; color: #dc2626; }
    .tag-status.neutral { background: #f1f5f9; color: #64748b; }
    .tag-status.success { background: #dcfce7; color: #15803d; }
    .tag-status.info { background: #e0f2fe; color: #0369a1; }
    .tag-status.purple { background: #f3e8ff; color: #7e22ce; }

    .metric-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .metric-val.red {
      color: #dc2626;
    }

    .metric-desc {
      font-size: 0.76rem;
      color: #64748b;
    }

    .detailed-table-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }

    .summary-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .summary-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }

    .summary-table tfoot td {
      background: #f8fafc;
      padding: 1rem;
      border-top: 2px solid #e2e8f0;
    }

    .text-right { text-align: right; }

    .amount {
      font-weight: 700;
      color: #0f172a;
    }

    .amount.red {
      color: #dc2626;
    }

    .no-transp {
      font-size: 0.72rem;
      color: #64748b;
    }

    .indemnity-row.zero {
      opacity: 0.7;
    }

    .sub-label {
      display: block;
      font-size: 0.72rem;
      color: #64748b;
      font-weight: normal;
    }

    .total-label {
      font-weight: 800;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .total-val {
      font-weight: 900;
      font-size: 1.25rem;
      color: #0284c7;
    }

    .empty-results-card {
      background: #ffffff;
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 3.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .empty-results-icon {
      width: 64px;
      height: 64px;
      background: #e0f2fe;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .empty-results-card h3 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .empty-results-card p {
      font-size: 0.88rem;
      color: #64748b;
      max-width: 480px;
      margin: 0;
      line-height: 1.5;
    }
  `]
})
export class ResultsSummaryComponent {
  @Input() liquidation: LiquidationResult | null = null;
  @Output() onSave = new EventEmitter<LiquidationResult>();
  @Output() onPrint = new EventEmitter<LiquidationResult>();
}

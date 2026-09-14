import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidationResult } from '../../models/liquidation.model';

@Component({
  selector: 'app-print-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (liquidation) {
      <div class="print-overlay" (click)="onClose.emit()">
        <div class="print-modal" (click)="$event.stopPropagation()">
          <div class="modal-toolbar no-print">
            <span class="modal-title">Vista Previa de Acta de Liquidación Formal</span>
            <div class="toolbar-btns">
              <button type="button" class="btn-print-action" (click)="triggerPrint()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Imprimir Documento / Guardar PDF
              </button>
              <button type="button" class="btn-close-action" (click)="onClose.emit()">
                ✕ Cerrar
              </button>
            </div>
          </div>

          <!-- Hoja formal de liquidación colombiana -->
          <div class="document-sheet" id="printable-doc">
            <div class="doc-header">
              <div class="company-brand">
                <h2>{{ liquidation.input.companyName || 'EMPRESA / EMPLEADOR' }}</h2>
                <p class="nit-text">NIT / Identificación: ________________________</p>
              </div>
              <div class="doc-badge">
                <h1>LIQUIDACIÓN DEFINITIVA DE CONTRATO DE TRABAJO</h1>
                <span>CÓDIGO SUSTANTIVO DEL TRABAJO (COLOMBIA)</span>
              </div>
            </div>

            <div class="meta-section">
              <div class="meta-col">
                <p><strong>Nombre del Trabajador:</strong> {{ liquidation.input.employeeName || '________________________________' }}</p>
                <p><strong>Cédula de Ciudadanía:</strong> {{ liquidation.input.employeeId || '____________________' }}</p>
                <p><strong>Tipo de Contrato:</strong> {{ formatContractType(liquidation.input.contractType) }}</p>
              </div>
              <div class="meta-col">
                <p><strong>Fecha de Inicio:</strong> {{ liquidation.input.startDate }}</p>
                <p><strong>Fecha de Terminación:</strong> {{ liquidation.input.endDate }}</p>
                <p><strong>Tiempo Total Laborado:</strong> {{ liquidation.workedDaysTotal }} días ({{ liquidation.timeWorkedString }})</p>
              </div>
              <div class="meta-col">
                <p><strong>Motivo de Retiro:</strong> {{ formatReason(liquidation.input.terminationReason) }}</p>
                <p><strong>Salario Base Mensual:</strong> {{ liquidation.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
                <p><strong>Auxilio de Transporte:</strong> {{ liquidation.transportAllowance > 0 ? (liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0') : 'No Aplica' }}</p>
              </div>
            </div>

            <!-- Tabla de conceptos -->
            <table class="doc-table">
              <thead>
                <tr>
                  <th>Concepto Liquidado</th>
                  <th>Fundamento Jurídico</th>
                  <th>Base de Cálculo</th>
                  <th>Días / Factor</th>
                  <th class="text-right">Valor Total (COP)</th>
                </tr>
              </thead>
              <tbody>
                @if (liquidation.pendingSalaryAmount > 0) {
                  <tr>
                    <td>Salarios Pendientes de Pago</td>
                    <td>Art. 134 CST</td>
                    <td>{{ liquidation.input.baseSalary + liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                    <td>{{ liquidation.input.pendingSalaryDays }} días</td>
                    <td class="text-right">{{ liquidation.pendingSalaryAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  </tr>
                }
                <tr>
                  <td>Cesantías del Periodo</td>
                  <td>Art. 249 CST - Ley 1 de 1963</td>
                  <td>{{ liquidation.input.baseSalary + liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ liquidation.workedDaysCurrentYear }} días</td>
                  <td class="text-right">{{ liquidation.cesantiasAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
                <tr>
                  <td>Intereses sobre Cesantías</td>
                  <td>Ley 52 de 1975 - Dec. 116 de 1976</td>
                  <td>{{ liquidation.cesantiasAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td>12% anual comercial</td>
                  <td class="text-right">{{ liquidation.interesesCesantiasAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
                <tr>
                  <td>Prima de Servicios</td>
                  <td>Art. 306 CST - Ley 1788 de 2016</td>
                  <td>{{ liquidation.input.baseSalary + liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ liquidation.workedDaysCurrentSemester }} días</td>
                  <td class="text-right">{{ liquidation.primaServiciosAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
                <tr>
                  <td>Compensación de Vacaciones</td>
                  <td>Art. 186 y 192 CST (Sin Aux. Transp)</td>
                  <td>{{ liquidation.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ liquidation.vacationDaysCalculated }} días</td>
                  <td class="text-right">{{ liquidation.vacacionesAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
                <tr class="indemnity-print-row">
                  <td>
                    <strong>Indemnización por Despido</strong>
                    <br><small>{{ liquidation.input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA' ? 'Despido sin justa causa' : 'Terminación sin causa imputable' }}</small>
                  </td>
                  <td>Art. 64 CST (Mod. Ley 789/02)</td>
                  <td>{{ liquidation.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ liquidation.indemnityDays }} días</td>
                  <td class="text-right font-bold">{{ liquidation.indemnityAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="grand-total-row">
                  <td colspan="4" class="grand-label">TOTAL NETO A PAGAR:</td>
                  <td class="text-right grand-val">{{ liquidation.totalLiquidacion | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Paz y Salvo -->
            <div class="legal-clause">
              <h4>DECLARACIÓN DE PAZ Y SALVO LABORAL</h4>
              <p>
                Con el recibo de la suma estipulada en la presente liquidación definitiva, el trabajador manifiesta que el empleador queda a <strong>PAZ Y SALVO</strong> por todo concepto de salarios, horas extras, recargos nocturnos, dominicales y festivos, prestaciones sociales (cesantías, intereses sobre cesantías, prima de servicios), descanso remunerado (vacaciones), subsidio de transporte, indemnizaciones legales o contractuales, y demás derechos derivados del contrato de trabajo y la legislación laboral colombiana.
              </p>
            </div>

            <!-- Firmas -->
            <div class="signatures-box">
              <div class="signature-col">
                <div class="sig-line"></div>
                <p class="sig-title">EL EMPLEADOR</p>
                <p class="sig-sub">{{ liquidation.input.companyName || 'Razón Social' }}</p>
                <p class="sig-sub">NIT: _______________________</p>
              </div>

              <div class="signature-col">
                <div class="sig-line"></div>
                <p class="sig-title">EL TRABAJADOR</p>
                <p class="sig-sub">{{ liquidation.input.employeeName || 'Firma del Colaborador' }}</p>
                <p class="sig-sub">C.C. {{ liquidation.input.employeeId || '____________________' }}</p>
              </div>

              <div class="fingerprint-col">
                <div class="fingerprint-box">Huella</div>
              </div>
            </div>

            <div class="doc-footer">
              Generado electrónicamente bajo el régimen laboral del Código Sustantivo del Trabajo de Colombia.
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .print-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
      overflow-y: auto;
    }

    .print-modal {
      background: #ffffff;
      width: 100%;
      max-width: 860px;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-height: 94vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #0f172a;
      color: #ffffff;
    }

    .modal-title {
      font-weight: 700;
      font-size: 0.95rem;
    }

    .toolbar-btns {
      display: flex;
      gap: 0.6rem;
    }

    .btn-print-action {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-print-action:hover {
      background: #0369a1;
    }

    .btn-close-action {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: none;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .btn-close-action:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .document-sheet {
      padding: 2.5rem;
      background: #ffffff;
      overflow-y: auto;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1e293b;
    }

    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .company-brand h2 {
      font-size: 1.3rem;
      font-weight: 900;
      margin: 0;
      color: #0f172a;
    }

    .nit-text {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0.2rem 0 0 0;
    }

    .doc-badge {
      text-align: right;
    }

    .doc-badge h1 {
      font-size: 1rem;
      font-weight: 800;
      margin: 0;
      color: #0f172a;
    }

    .doc-badge span {
      font-size: 0.72rem;
      font-weight: 700;
      color: #0284c7;
      letter-spacing: 0.05em;
    }

    .meta-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
    }

    .meta-col p {
      margin: 0 0 0.4rem 0;
      line-height: 1.4;
    }

    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
      margin-bottom: 1.5rem;
    }

    .doc-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      padding: 0.65rem 0.75rem;
      border: 1px solid #cbd5e1;
      text-align: left;
    }

    .doc-table td {
      padding: 0.65rem 0.75rem;
      border: 1px solid #e2e8f0;
    }

    .indemnity-print-row {
      background: #fff5f5;
    }

    .grand-total-row td {
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      padding: 0.85rem;
      border-color: #0f172a;
    }

    .grand-label {
      font-size: 0.95rem;
    }

    .grand-val {
      font-size: 1.2rem;
      color: #38bdf8;
    }

    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }

    .legal-clause {
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      padding: 0.85rem 1rem;
      margin-bottom: 2rem;
      font-size: 0.75rem;
      line-height: 1.45;
      color: #334155;
    }

    .legal-clause h4 {
      margin: 0 0 0.35rem 0;
      font-size: 0.8rem;
      color: #0f172a;
    }

    .signatures-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      padding: 0 1rem;
    }

    .signature-col {
      width: 38%;
      text-align: center;
    }

    .sig-line {
      border-top: 1px solid #0f172a;
      margin-bottom: 0.5rem;
    }

    .sig-title {
      font-weight: 800;
      font-size: 0.8rem;
      margin: 0 0 0.2rem 0;
    }

    .sig-sub {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }

    .fingerprint-col {
      width: 15%;
      display: flex;
      justify-content: center;
    }

    .fingerprint-box {
      width: 70px;
      height: 90px;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .doc-footer {
      text-align: center;
      font-size: 0.7rem;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.75rem;
    }

    @media print {
      .no-print { display: none !important; }
      .print-overlay {
        position: static;
        background: transparent;
        padding: 0;
        width: 100%;
        height: auto;
      }
      .print-modal {
        box-shadow: none;
        max-width: 100%;
        max-height: none;
      }
      .document-sheet {
        padding: 0;
      }
    }
  `]
})
export class PrintSheetComponent {
  @Input() liquidation: LiquidationResult | null = null;
  @Output() onClose = new EventEmitter<void>();

  triggerPrint(): void {
    window.print();
  }

  formatContractType(type: string): string {
    switch (type) {
      case 'INDEFINIDO': return 'Término Indefinido';
      case 'TERMINO_FIJO': return 'Término Fijo';
      case 'OBRA_LABOR': return 'Por Obra o Labor';
      default: return type;
    }
  }

  formatReason(reason: string): string {
    switch (reason) {
      case 'DESPIDO_SIN_JUSTA_CAUSA': return 'Despido Unilateral Sin Justa Causa';
      case 'DESPIDO_CON_JUSTA_CAUSA': return 'Despido Con Justa Causa (Art. 62 CST)';
      case 'RENUNCIA_VOLUNTARIA': return 'Renuncia Voluntaria';
      case 'TERMINACION_PLAZO_FIJO': return 'Expiración del Plazo Fijo Pactado';
      default: return reason;
    }
  }
}

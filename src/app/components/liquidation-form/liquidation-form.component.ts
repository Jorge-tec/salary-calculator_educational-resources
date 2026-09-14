import { Component, Output, EventEmitter, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LiquidationFormInput, 
  ContractType, 
  TerminationReason, 
  YEAR_CONFIGS,
  LiquidationResult 
} from '../../models/liquidation.model';
import { CalculatorService } from '../../services/calculator.service';

@Component({
  selector: 'app-liquidation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container-card">
      <div class="form-header">
        <div class="header-top-row">
          <div class="title-wrap">
            <div class="badges-row">
              <span class="badge-certifier">Modo Certificador / Usuario</span>
              <span class="badge-accent">Formulario en Blanco</span>
            </div>
            <h3>Calculadora de Liquidación e Indemnización Laboral</h3>
            <p class="subtitle">Ingresa los datos reales del colaborador o carga un escenario de prueba para evaluar el cálculo</p>
          </div>

          <button type="button" class="btn-clear-form" (click)="resetForm()" title="Limpiar todos los campos del formulario">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Limpiar (Dejar en Blanco)
          </button>
        </div>

        <!-- Barra de Versión de Pruebas / Demostración -->
        <div class="test-version-banner">
          <div class="test-banner-title">
            <span class="test-tag">🧪 Versión de Pruebas:</span>
            <span class="test-hint">Cargar caso de prueba preconfigurado:</span>
          </div>
          <div class="test-buttons-wrap">
            <button type="button" class="btn-test-preset" (click)="applyPreset('UNJUSTIFIED_NORMAL')">
              1. Despido Injustificado (&lt; 10 SMMLV)
            </button>
            <button type="button" class="btn-test-preset" (click)="applyPreset('UNJUSTIFIED_HIGH')">
              2. Despido Salario Alto (≥ 10 SMMLV)
            </button>
            <button type="button" class="btn-test-preset" (click)="applyPreset('FIXED_TERM')">
              3. Término Fijo Faltante
            </button>
            <button type="button" class="btn-test-preset" (click)="applyPreset('RESIGNATION')">
              4. Renuncia Voluntaria
            </button>
            <button type="button" class="btn-test-preset" (click)="applyPreset('JUST_CAUSE')">
              5. Despido Justa Causa
            </button>
          </div>
        </div>
      </div>

      <form class="actual-form">
        <!-- SECCIÓN 1: DATOS DEL COLABORADOR Y EMPRESA -->
        <div class="form-section">
          <h4 class="section-title">
            <span class="step-num">1</span>
            Identificación de las Partes
          </h4>
          <div class="grid-3">
            <div class="form-group">
              <label for="empName">Nombre del Colaborador</label>
              <input 
                id="empName" 
                type="text" 
                [(ngModel)]="formData.employeeName" 
                name="employeeName" 
                placeholder="Ej. Andrés Camilo Rojas"
                (ngModelChange)="onFormChange()" />
            </div>

            <div class="form-group">
              <label for="empId">Cédula de Ciudadanía / ID</label>
              <input 
                id="empId" 
                type="text" 
                [(ngModel)]="formData.employeeId" 
                name="employeeId" 
                placeholder="Ej. 1.032.456.789"
                (ngModelChange)="onFormChange()" />
            </div>

            <div class="form-group">
              <label for="compName">Razón Social de la Empresa</label>
              <input 
                id="compName" 
                type="text" 
                [(ngModel)]="formData.companyName" 
                name="companyName" 
                placeholder="Ej. Distribuciones Colombia SAS"
                (ngModelChange)="onFormChange()" />
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: TIPO DE CONTRATO Y MOTIVO DE TERMINACIÓN -->
        <div class="form-section">
          <h4 class="section-title">
            <span class="step-num">2</span>
            Modalidad Contractual y Causal de Salida
          </h4>
          <div class="grid-2">
            <div class="form-group">
              <label for="contractType">Tipo de Contrato Laboral</label>
              <select 
                id="contractType" 
                [(ngModel)]="formData.contractType" 
                name="contractType" 
                (ngModelChange)="onFormChange()">
                <option value="INDEFINIDO">Término Indefinido (Art. 47 CST)</option>
                <option value="TERMINO_FIJO">Término Fijo (Art. 46 CST)</option>
                <option value="OBRA_LABOR">Por Obra o Labor (Art. 45 CST)</option>
              </select>
              <span class="field-hint">
                Define las reglas de indemnización del Art. 64 CST aplicables.
              </span>
            </div>

            <div class="form-group">
              <label for="terminationReason">Motivo de Retiro / Terminación</label>
              <select 
                id="terminationReason" 
                [(ngModel)]="formData.terminationReason" 
                name="terminationReason" 
                (ngModelChange)="onFormChange()">
                <option value="DESPIDO_SIN_JUSTA_CAUSA">Despido SIN Justa Causa (Indemniza Art. 64)</option>
                <option value="DESPIDO_CON_JUSTA_CAUSA">Despido CON Justa Causa (Art. 62 CST)</option>
                <option value="RENUNCIA_VOLUNTARIA">Renuncia Voluntaria (Sin indemnización)</option>
                <option value="TERMINACION_PLAZO_FIJO">Fin Natural Plazo / Obra (Sin indemnización)</option>
              </select>
              <span class="field-hint">
                Solo el despido sin justa causa genera indemnización legal a cargo del empleador.
              </span>
            </div>
          </div>

          <!-- Alerta informativa si aplica o no indemnización -->
          @if (formData.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA') {
            <div class="alert-box alert-warning">
              <div class="alert-icon">⚠️</div>
              <div class="alert-text">
                <strong>Aplica Indemnización por Despido Unilateral:</strong> Se calculará la penalidad del Art. 64 del CST según el tipo de contrato y la escala de salarios.
              </div>
            </div>
          } @else {
            <div class="alert-box alert-info">
              <div class="alert-icon">ℹ️</div>
              <div class="alert-text">
                <strong>No Genera Indemnización ($0 COP):</strong> Por configurarse {{ formData.terminationReason === 'DESPIDO_CON_JUSTA_CAUSA' ? 'justa causa legal' : 'renuncia o fin natural' }}, se liquidarán únicamente prestaciones sociales y salarios debidos.
              </div>
            </div>
          }
        </div>

        <!-- SECCIÓN 3: FECHAS Y TIEMPO LABORADO -->
        <div class="form-section">
          <h4 class="section-title">
            <span class="step-num">3</span>
            Fechas y Periodo de Contrato (Días Comerciales 360)
          </h4>
          <div class="grid-3">
            <div class="form-group">
              <label for="startDate">Fecha de Ingreso / Inicio</label>
              <input 
                id="startDate" 
                type="date" 
                [(ngModel)]="formData.startDate" 
                name="startDate" 
                (ngModelChange)="onFormChange()" />
            </div>

            <div class="form-group">
              <label for="endDate">Fecha de Retiro / Salida</label>
              <input 
                id="endDate" 
                type="date" 
                [(ngModel)]="formData.endDate" 
                name="endDate" 
                (ngModelChange)="onFormChange()" />
            </div>

            @if (formData.contractType === 'TERMINO_FIJO' || formData.contractType === 'OBRA_LABOR') {
              <div class="form-group highlight-input">
                <label for="fixedEndDate">Fecha Fin Pactada Originalmente</label>
                <input 
                  id="fixedEndDate" 
                  type="date" 
                  [(ngModel)]="formData.fixedContractEndDate" 
                  name="fixedContractEndDate" 
                  (ngModelChange)="onFormChange()" />
                <span class="field-hint">Días restantes para liquidar indemnización por lucro cesante.</span>
              </div>
            } @else {
              <div class="form-group">
                <label>Tiempo Total Calculado</label>
                <div class="read-only-badge">
                  {{ calculatedDays }} días comerciales
                </div>
                <span class="field-hint">{{ calculatedTimeString }}</span>
              </div>
            }
          </div>
        </div>

        <!-- SECCIÓN 4: SALARIOS Y AUXILIOS -->
        <div class="form-section">
          <h4 class="section-title">
            <span class="step-num">4</span>
            Salario Base y Subsidio de Transporte
          </h4>
          <div class="grid-3">
            <div class="form-group">
              <label for="baseSalary">Salario Básico Mensual (COP)</label>
              <div class="input-currency-wrap">
                <span class="currency-sign">$</span>
                <input 
                  id="baseSalary" 
                  type="number" 
                  min="0"
                  step="50000"
                  [(ngModel)]="formData.baseSalary" 
                  name="baseSalary" 
                  (ngModelChange)="onFormChange()" />
              </div>
              <div class="salary-meta">
                <span class="smmlv-ratio">Equivale a <strong>{{ (formData.baseSalary / activeSmmlv) | number:'1.2-2' }} SMMLV</strong></span>
                @if (formData.baseSalary >= (10 * activeSmmlv)) {
                  <span class="pill-high">Salario Alto (≥ 10 SMMLV)</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="smmlvYear">Año de Referencia Legal</label>
              <select 
                id="smmlvYear" 
                [(ngModel)]="formData.smmlvYear" 
                name="smmlvYear" 
                (ngModelChange)="onFormChange()">
                @for (config of yearConfigs; track config.year) {
                  <option [value]="config.year">{{ config.label }}</option>
                }
              </select>
              <span class="field-hint">
                SMMLV: {{ activeSmmlv | currency:'COP':'symbol-narrow':'1.0-0' }} | Aux: {{ activeTransport | currency:'COP':'symbol-narrow':'1.0-0' }}
              </span>
            </div>

            <div class="form-group full-width-field">
              <label>Auxilio de Transporte &bull; Código Sustantivo del Trabajo & Ley 15 de 1959</label>
              
              @if (formData.baseSalary > (activeSmmlv * 2)) {
                <!-- CASO 1: SUPERIOR A 2 SMMLV -> INHABILITADO POR MANDATO LEGAL -->
                <div class="transport-box legal-blocked">
                  <div class="box-status-blocked">
                    <span class="pill-blocked">🚫 Inhabilitado por Mandato Legal</span>
                    <strong>No Aplica Auxilio de Transporte ($0 COP)</strong>
                  </div>
                  <p class="blocked-legal-text">
                    El salario básico devengado ({{ formData.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}) supera el límite máximo legal de 2 SMMLV ({{ (activeSmmlv * 2) | currency:'COP':'symbol-narrow':'1.0-0' }}). Por mandato expreso de la <strong>Ley 15 de 1959</strong> y jurisprudencia del CST, <strong>ningún trabajador con más de 2 salarios mínimos puede percibir auxilio de transporte</strong>.
                  </p>
                </div>
              } @else if (formData.baseSalary > 0) {
                <!-- CASO 2: HASTA 2 SMMLV -> OPCIONAL SEGÚN CONDICIONES CONTRACTUALES -->
                <div class="transport-box optional-active">
                  <div class="transport-choice-header">
                    <div class="qualify-info">
                      <span class="pill-qualifies">Cumple criterio salarial: Devenga ≤ 2 SMMLV</span>
                      <span class="optional-tag">Opcional según modalidad de trabajo / contrato</span>
                    </div>

                    <label class="switch-container">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="formData.includeTransportAllowance" 
                        name="includeTransportAllowance"
                        (ngModelChange)="onFormChange()" />
                      <span class="switch-text">
                        {{ formData.includeTransportAllowance !== false ? '✓ Incluir Auxilio de Transporte' : '✗ Excluir del Contrato' }}
                      </span>
                    </label>
                  </div>

                  @if (formData.includeTransportAllowance !== false) {
                    <div class="transport-applied-info">
                      <div class="applied-badge-row">
                        <span class="amount-badge">+ {{ activeTransport | currency:'COP':'symbol-narrow':'1.0-0' }} / mes</span>
                        <span class="tag-computes">Se computa para Cesantías y Prima de Servicios</span>
                      </div>
                      <p class="transp-desc">
                        Aplica para contratos presenciales donde el trabajador costea su propio desplazamiento diario hasta el lugar de trabajo.
                      </p>
                    </div>
                  } @else {
                    <div class="transport-excluded-reasons">
                      <div class="exclusion-select-wrap">
                        <label for="transpReason">Seleccionar motivo legal de exclusión en este contrato:</label>
                        <select 
                          id="transpReason" 
                          [(ngModel)]="formData.transportExclusionReason" 
                          name="transportExclusionReason" 
                          (ngModelChange)="onFormChange()">
                          <option value="TELETRABAJO">Teletrabajo / En Casa (Ley 2088/20)</option>
                          <option value="EMPRESA_SUMINISTRA">Empresa suministra ruta / transporte (Art. 2)</option>
                          <option value="VIVE_EN_SITIO">Trabajador reside en sitio de labor</option>
                          <option value="OTRA_EXCLUSION">Otra estipulación sin desplazamiento</option>
                        </select>
                      </div>
                      <p class="exclusion-cst-note">
                        <strong>Fundamento CST:</strong> El auxilio de transporte no es salario remunerativo sino un reintegro legal de gastos de movilización. Cuando no se requiere desplazamiento efectivo, el empleador está exento legalmente de pagarlo.
                      </p>
                    </div>
                  }
                </div>
              } @else {
                <div class="transport-box empty-state-box">
                  <span class="hint-muted">Ingresa el salario para validar si aplica el auxilio de transporte (Tope legal: hasta 2 SMMLV = {{ (activeSmmlv * 2) | currency:'COP':'symbol-narrow':'1.0-0' }}).</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- SECCIÓN 5: CONCEPTOS ADICIONALES -->
        <div class="form-section">
          <h4 class="section-title">
            <span class="step-num">5</span>
            Días Pendientes de Salario y Vacaciones
          </h4>
          <div class="grid-3">
            <div class="form-group">
              <label for="pendingSalaryDays">Días de Salario Pendientes por Pagar</label>
              <input 
                id="pendingSalaryDays" 
                type="number" 
                min="0" 
                max="60"
                [(ngModel)]="formData.pendingSalaryDays" 
                name="pendingSalaryDays" 
                (ngModelChange)="onFormChange()" />
              <span class="field-hint">Días trabajados del último mes que aún no han sido cobrados.</span>
            </div>

            <div class="form-group">
              <label>Modo de Cálculo de Vacaciones</label>
              <div class="radio-options">
                <label class="radio-label">
                  <input 
                    type="radio" 
                    [value]="true" 
                    [(ngModel)]="formData.useCalculatedVacations" 
                    name="useCalculatedVacations" 
                    (ngModelChange)="onFormChange()" />
                  Proporcional histórico (Días Totales ÷ 720)
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    [value]="false" 
                    [(ngModel)]="formData.useCalculatedVacations" 
                    name="useCalculatedVacations" 
                    (ngModelChange)="onFormChange()" />
                  Ingresar días hábiles pendientes manualmente
                </label>
              </div>
            </div>

            @if (!formData.useCalculatedVacations) {
              <div class="form-group highlight-input">
                <label for="pendingVacationDays">Días de Vacaciones Pendientes</label>
                <input 
                  id="pendingVacationDays" 
                  type="number" 
                  min="0" 
                  step="0.5"
                  [(ngModel)]="formData.pendingVacationDays" 
                  name="pendingVacationDays" 
                  (ngModelChange)="onFormChange()" />
                <span class="field-hint">Saldo acumulado no disfrutado por el trabajador.</span>
              </div>
            } @else {
              <div class="form-group">
                <label>Días de Vacaciones Causados</label>
                <div class="read-only-badge">
                  {{ calculatedVacationDays }} días hábiles
                </div>
                <span class="field-hint">Calculados según Art. 186 del CST (15 días por cada 360 laborados).</span>
              </div>
            }
          </div>

          <div class="form-group full-width">
            <label for="notes">Notas u Observaciones del Caso</label>
            <input 
              id="notes" 
              type="text" 
              [(ngModel)]="formData.notes" 
              name="notes" 
              placeholder="Ej. Trabajador no disfrutó vacaciones en 2024. Terminación notificada con carta formal."
              (ngModelChange)="onFormChange()" />
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-header {
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
    }

    .header-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .badges-row {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      margin-bottom: 0.4rem;
    }

    .badge-certifier {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #065f46;
      background: #d1fae5;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
    }

    .badge-accent {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0284c7;
      background: #e0f2fe;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
    }

    .title-wrap h3 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .btn-clear-form {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear-form:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
    }

    .test-version-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #0284c7;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .test-banner-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
    }

    .test-tag {
      font-weight: 800;
      color: #0284c7;
    }

    .test-hint {
      color: #64748b;
    }

    .test-buttons-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .btn-test-preset {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-test-preset:hover {
      background: #0284c7;
      color: #ffffff;
      border-color: #0284c7;
    }

    .actual-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      border: 1px solid #f1f5f9;
      background: #fafbfc;
      padding: 1.25rem;
      border-radius: 12px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 1rem 0;
    }

    .step-num {
      width: 22px;
      height: 22px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      width: 100%;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    .form-group.full-width {
      margin-top: 0.85rem;
    }

    .form-group.highlight-input {
      background: #eff6ff;
      padding: 0.6rem;
      border-radius: 8px;
      border: 1px solid #bfdbfe;
    }

    label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
      word-break: break-word;
    }

    input[type="text"],
    input[type="date"],
    input[type="number"],
    select {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 8px;
      padding: 0.55rem 0.75rem;
      font-size: 0.86rem;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    select {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
    }

    input:focus, select:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }

    .field-hint {
      font-size: 0.72rem;
      color: #64748b;
      line-height: 1.3;
    }

    .input-currency-wrap {
      display: flex;
      align-items: center;
      position: relative;
    }

    .currency-sign {
      position: absolute;
      left: 0.75rem;
      font-weight: 700;
      color: #64748b;
      font-size: 0.9rem;
    }

    .input-currency-wrap input {
      padding-left: 1.6rem;
      width: 100%;
      font-weight: 700;
      font-size: 0.95rem;
      color: #0f172a;
    }

    .salary-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .smmlv-ratio {
      font-size: 0.74rem;
      color: #475569;
    }

    .pill-high {
      font-size: 0.68rem;
      font-weight: 700;
      color: #b91c1c;
      background: #fee2e2;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .read-only-badge {
      background: #e2e8f0;
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      font-weight: 700;
      color: #0f172a;
      font-size: 0.88rem;
    }

    .full-width-field {
      grid-column: 1 / -1;
    }

    .transport-box {
      border-radius: 12px;
      padding: 1rem;
      margin-top: 0.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .transport-box.legal-blocked {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #ef4444;
    }

    .box-status-blocked {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.86rem;
      color: #991b1b;
    }

    .pill-blocked {
      background: #dc2626;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .blocked-legal-text {
      font-size: 0.78rem;
      color: #7f1d1d;
      line-height: 1.45;
      margin: 0;
    }

    .transport-box.optional-active {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #0284c7;
    }

    .transport-choice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .qualify-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pill-qualifies {
      background: #dcfce7;
      color: #166534;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .optional-tag {
      font-size: 0.74rem;
      color: #64748b;
    }

    .switch-container {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
    }

    .switch-text {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0284c7;
    }

    .transport-applied-info {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      background: #f0fdf4;
      padding: 0.75rem;
      border-radius: 8px;
    }

    .applied-badge-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .amount-badge {
      font-size: 0.86rem;
      font-weight: 800;
      color: #166534;
      background: #dcfce7;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
    }

    .tag-computes {
      font-size: 0.72rem;
      font-weight: 600;
      color: #15803d;
    }

    .transp-desc {
      font-size: 0.76rem;
      color: #166534;
      margin: 0;
      line-height: 1.4;
    }

    .transport-excluded-reasons {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .exclusion-select-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .exclusion-select-wrap label {
      font-size: 0.75rem;
      color: #475569;
      font-weight: 600;
    }

    .exclusion-select-wrap select {
      padding: 0.45rem 0.65rem;
      font-size: 0.82rem;
    }

    .exclusion-cst-note {
      font-size: 0.74rem;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    .empty-state-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      padding: 0.75rem;
      text-align: center;
    }

    .hint-muted {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .radio-options {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: #334155;
      cursor: pointer;
    }

    .alert-box {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.8rem;
      margin-top: 0.75rem;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
      word-break: break-word;
    }

    .alert-text {
      min-width: 0;
      flex: 1;
      word-break: break-word;
    }

    .alert-warning {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }

    .alert-info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }

    .alert-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .form-container-card {
        padding: 1rem 0.75rem;
        border-radius: 12px;
        gap: 1rem;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }

      .header-top-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }

      .btn-clear-form {
        width: 100%;
        justify-content: center;
      }

      .test-version-banner {
        padding: 0.65rem 0.75rem;
      }

      .test-buttons-wrap {
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 0.35rem;
        scrollbar-width: thin;
      }

      .btn-test-preset {
        flex-shrink: 0;
        white-space: nowrap;
      }

      .form-section {
        padding: 0.95rem 0.75rem;
        border-radius: 10px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        overflow: hidden;
      }

      .grid-2, .grid-3 {
        grid-template-columns: 100%;
        width: 100%;
        min-width: 0;
        gap: 0.85rem;
        box-sizing: border-box;
      }

      .transport-choice-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.6rem;
      }

      .switch-container {
        width: 100%;
        justify-content: space-between;
      }

      .salary-meta {
        flex-wrap: wrap;
      }
    }
  `]
})
export class LiquidationFormComponent implements OnInit, OnChanges {
  @Input() initialData: LiquidationFormInput | null = null;
  @Output() onCalculate = new EventEmitter<LiquidationResult>();

  yearConfigs = YEAR_CONFIGS;

  formData: LiquidationFormInput = {
    employeeName: '',
    employeeId: '',
    companyName: '',
    contractType: 'INDEFINIDO',
    terminationReason: 'DESPIDO_SIN_JUSTA_CAUSA',
    startDate: '',
    endDate: '',
    fixedContractEndDate: '',
    baseSalary: 0,
    pendingSalaryDays: 0,
    useCalculatedVacations: true,
    pendingVacationDays: 0,
    notes: '',
    smmlvYear: 2025
  };

  calculatedDays = 0;
  calculatedTimeString = '';
  calculatedVacationDays = 0;
  activeSmmlv = 1423500;
  activeTransport = 200000;
  appliesTransport = false;

  constructor(private calculator: CalculatorService) {}

  resetForm(): void {
    this.formData = {
      employeeName: '',
      employeeId: '',
      companyName: '',
      contractType: 'INDEFINIDO',
      terminationReason: 'DESPIDO_SIN_JUSTA_CAUSA',
      startDate: '',
      endDate: '',
      fixedContractEndDate: '',
      baseSalary: 0,
      includeTransportAllowance: true,
      pendingSalaryDays: 0,
      useCalculatedVacations: true,
      pendingVacationDays: 0,
      notes: '',
      smmlvYear: 2025
    };
    this.onFormChange();
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.formData = { ...this.initialData };
    }
    this.onFormChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.formData = { ...this.initialData };
      this.onFormChange();
    }
  }

  onFormChange(): void {
    const config = this.yearConfigs.find(c => c.year === this.formData.smmlvYear) || this.yearConfigs[0];
    this.activeSmmlv = config.smmlv;
    this.activeTransport = config.transportAllowance;

    // Regla legal: Solo tiene derecho si devenga <= 2 SMMLV
    const qualifies = this.formData.baseSalary > 0 && this.formData.baseSalary <= (2 * this.activeSmmlv);
    
    if (!qualifies) {
      // Prohibido por ley si supera 2 SMMLV
      this.appliesTransport = false;
    } else {
      // Opcional según modalidad contractual si devenga <= 2 SMMLV
      this.appliesTransport = this.formData.includeTransportAllowance !== false;
    }

    // Días
    this.calculatedDays = this.calculator.calculateCommercialDays(this.formData.startDate, this.formData.endDate);
    this.calculatedTimeString = this.calculator.formatWorkedTime(this.calculatedDays);
    this.calculatedVacationDays = Number(((this.calculatedDays * 15) / 360).toFixed(2));

    // Ejecutar cálculo y emitir
    const result = this.calculator.calculateLiquidation(this.formData);
    this.onCalculate.emit(result);
  }

  applyPreset(presetType: string): void {
    switch (presetType) {
      case 'UNJUSTIFIED_NORMAL':
        this.formData = {
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
          notes: 'Despido sin justa causa. 30 días primer año + 20 días por año subsiguiente.',
          smmlvYear: 2025
        };
        break;

      case 'UNJUSTIFIED_HIGH':
        this.formData = {
          employeeName: 'Diana Carolina Suárez',
          employeeId: '52.987.654',
          companyName: 'Banca & Inversiones Andina',
          contractType: 'INDEFINIDO',
          terminationReason: 'DESPIDO_SIN_JUSTA_CAUSA',
          startDate: '2021-06-01',
          endDate: '2025-05-31',
          baseSalary: 16500000,
          pendingSalaryDays: 30,
          useCalculatedVacations: true,
          notes: 'Salario superior a 10 SMMLV. Escala 20 días 1er año + 15 días años siguientes.',
          smmlvYear: 2025
        };
        break;

      case 'FIXED_TERM':
        this.formData = {
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
          notes: 'Terminación anticipada de contrato a término fijo (3 meses faltantes).',
          smmlvYear: 2024
        };
        break;

      case 'RESIGNATION':
        this.formData = {
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
          notes: 'Renuncia voluntaria irrevocable. No causa indemnización.',
          smmlvYear: 2025
        };
        break;

      case 'JUST_CAUSE':
        this.formData = {
          employeeName: 'Héctor Fabio Ramírez',
          employeeId: '98.765.432',
          companyName: 'Constructora del Valle',
          contractType: 'INDEFINIDO',
          terminationReason: 'DESPIDO_CON_JUSTA_CAUSA',
          startDate: '2022-08-10',
          endDate: '2025-02-28',
          baseSalary: 2300000,
          pendingSalaryDays: 28,
          useCalculatedVacations: true,
          notes: 'Despido fundamentado en Art. 62 numeral 6 CST. Sin indemnización.',
          smmlvYear: 2025
        };
        break;
    }

    this.onFormChange();
  }
}

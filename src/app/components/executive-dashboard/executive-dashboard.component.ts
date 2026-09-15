import { Component, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { LiquidationResult } from '../../models/liquidation.model';

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <!-- Encabezado y Barra de Acciones Ejecutivas -->
      <div class="dash-top-bar">
        <div class="dash-heading-wrap">
          <div class="breadcrumb-trail">
            <span class="crumb-link">NexusHR Laboral</span>
            <span class="material-symbols-outlined crumb-sep">chevron_right</span>
            <span class="crumb-current">Dashboard Ejecutivo</span>
          </div>
          <h1 class="dash-title">Monitoreo de Liquidaciones e Indemnizaciones CST</h1>
          <p class="dash-subtitle">Consolidado en tiempo real de pasivos laborales, derechos prestacionales y causas de retiro (Colombia)</p>
        </div>

        <div class="dash-top-actions">
          <button type="button" class="btn-dash-action secondary" (click)="storageService.exportToCSV()" [disabled]="records().length === 0">
            <span class="material-symbols-outlined">download</span>
            <span>Descargar Reporte CSV</span>
          </button>
          <button type="button" class="btn-dash-action primary" (click)="onNewLiquidation.emit()">
            <span class="material-symbols-outlined">add</span>
            <span>+ Nueva Liquidación</span>
          </button>
        </div>
      </div>

      <!-- Banner de Estado del Sistema y Parámetros Oficiales -->
      <div class="normative-strip">
        <div class="normative-col">
          <div class="system-status-indicator">
            <span class="status-dot-pulse"></span>
            <span class="status-text">Régimen Jurídico Vigente</span>
          </div>
          <span class="normative-desc">Código Sustantivo del Trabajo (CST) &bull; Ley 789 de 2002 &bull; Ley 15 de 1959</span>
        </div>
        <div class="normative-badges">
          <div class="kpi-mini-pill">
            <span class="pill-lbl">SMMLV 2025:</span>
            <span class="pill-val">$1.423.500 COP</span>
          </div>
          <div class="kpi-mini-pill">
            <span class="pill-lbl">Aux. Transporte:</span>
            <span class="pill-val">$200.000 COP</span>
          </div>
          <div class="kpi-mini-pill highlight">
            <span class="pill-lbl">Tope Auxilio:</span>
            <span class="pill-val">&le; 2 SMMLV ($2.847.000)</span>
          </div>
        </div>
      </div>

      <!-- Fila 1: Grid de 4 KPI Cards Ejecutivas (Estilo NexusHR Enterprise) -->
      <div class="kpis-grid">
        <!-- KPI 1: Casos Registrados -->
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-tag">Total Casos Gestionados</span>
            <div class="kpi-icon-box blue">
              <span class="material-symbols-outlined">groups</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-number">{{ records().length }}</span>
            <span class="kpi-badge-trend positive">
              <span class="material-symbols-outlined">analytics</span>
              {{ totalWorkedYears() }} años totales
            </span>
          </div>
          <div class="kpi-footer-bar">
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="records().length > 0 ? 100 : 0"></div>
            </div>
            <span class="progress-text">{{ unjustCount() }} despidos sin justa causa</span>
          </div>
        </div>

        <!-- KPI 2: Pasivo por Indemnizaciones Art. 64 -->
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-tag">Indemnizaciones Art. 64 CST</span>
            <div class="kpi-icon-box amber">
              <span class="material-symbols-outlined">gavel</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-number">{{ totalIndemnity() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            <span class="kpi-badge-trend warning">
              <span class="material-symbols-outlined">priority_high</span>
              Riesgo Indemnizatorio
            </span>
          </div>
          <div class="kpi-footer-sub">
            <span>{{ unjustCount() }} casos causaron indemnización</span>
            <span class="kpi-accent-pct">{{ indemnityPercentage() | number:'1.0-1' }}% del total</span>
          </div>
        </div>

        <!-- KPI 3: Prestaciones Sociales Totales -->
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-tag">Prestaciones Sociales (Cesantías, Primas, Vac.)</span>
            <div class="kpi-icon-box green">
              <span class="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-number">{{ totalPrestaciones() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            <span class="kpi-badge-trend success">
              <span class="material-symbols-outlined">verified</span>
              Derechos Ciertos
            </span>
          </div>
          <div class="kpi-footer-sub">
            <span>Cesantías, Intereses, Prima y Vacaciones</span>
            <span class="kpi-accent-pct text-green">100% exigibles</span>
          </div>
        </div>

        <!-- KPI 4: Monto Global Consolidado -->
        <div class="kpi-card highlight-hero">
          <div class="kpi-card-header">
            <span class="kpi-tag">Gran Total Liquidado</span>
            <div class="kpi-icon-box dark-blue">
              <span class="material-symbols-outlined">account_balance_wallet</span>
            </div>
          </div>
          <div class="kpi-main-val">
            <span class="kpi-number hero-num">{{ grandTotal() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
          </div>
          <div class="kpi-footer-sub">
            <span>Promedio por colaborador:</span>
            <strong class="font-mono-num">{{ averageLiquidation() | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
          </div>
        </div>
      </div>

      <!-- Fila 2: Accesos Rápidos y Distribución de Causas -->
      <div class="dash-middle-grid">
        <!-- Tarjeta de Distribución de Causas de Retiro -->
        <div class="card-enterprise causes-card">
          <div class="card-ent-header">
            <div class="header-tit-icon">
              <span class="material-symbols-outlined text-primary">pie_chart</span>
              <h3>Distribución por Causa de Terminación</h3>
            </div>
            <span class="badge-pill primary">Análisis de Retiros</span>
          </div>

          <div class="causes-breakdown-list">
            <div class="cause-row">
              <div class="cause-info">
                <span class="cause-bullet red"></span>
                <span class="cause-name">Despido Sin Justa Causa (Art. 64 CST)</span>
              </div>
              <div class="cause-stats">
                <span class="cause-count">{{ unjustCount() }} casos</span>
                <span class="cause-val">{{ unjustTotal() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            </div>

            <div class="cause-row">
              <div class="cause-info">
                <span class="cause-bullet green"></span>
                <span class="cause-name">Renuncia Voluntaria del Trabajador</span>
              </div>
              <div class="cause-stats">
                <span class="cause-count">{{ resignationCount() }} casos</span>
                <span class="cause-val">{{ resignationTotal() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            </div>

            <div class="cause-row">
              <div class="cause-info">
                <span class="cause-bullet gray"></span>
                <span class="cause-name">Despido Con Justa Causa / Término Fijo</span>
              </div>
              <div class="cause-stats">
                <span class="cause-count">{{ otherCount() }} casos</span>
                <span class="cause-val">{{ otherTotal() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta de Acciones y Casos de Demostración -->
        <div class="card-enterprise quick-tools-card">
          <div class="card-ent-header">
            <div class="header-tit-icon">
              <span class="material-symbols-outlined text-primary">science</span>
              <h3>Simulaciones Rápidas & Certificación</h3>
            </div>
            <span class="badge-pill success">Modo Evaluación</span>
          </div>

          <p class="quick-intro">
            Prueba al instante los diferentes escenarios jurídicos colombianos o carga casos prediseñados para auditoría:
          </p>

          <div class="quick-buttons-grid">
            <button type="button" class="btn-quick-scenario" (click)="onOpenCalculator.emit('UNJUSTIFIED_NORMAL')">
              <div class="btn-icon blue">⚖️</div>
              <div class="btn-txt">
                <strong>Despido Injustificado (&lt; 10 SMMLV)</strong>
                <span>30 días primer año + 20 días por subsiguiente</span>
              </div>
            </button>

            <button type="button" class="btn-quick-scenario" (click)="onOpenCalculator.emit('UNJUSTIFIED_HIGH')">
              <div class="btn-icon purple">💼</div>
              <div class="btn-txt">
                <strong>Salario Alto (&ge; 10 SMMLV)</strong>
                <span>20 días primer año + 15 días por subsiguiente</span>
              </div>
            </button>

            <button type="button" class="btn-quick-scenario" (click)="onOpenCalculator.emit('FIXED_TERM')">
              <div class="btn-icon amber">📅</div>
              <div class="btn-txt">
                <strong>Contrato a Término Fijo</strong>
                <span>Indemnización por salarios faltantes</span>
              </div>
            </button>

            <button type="button" class="btn-quick-scenario" (click)="onOpenCalculator.emit('RESIGNATION')">
              <div class="btn-icon green">📝</div>
              <div class="btn-txt">
                <strong>Renuncia Voluntaria</strong>
                <span>Liquidación de derechos ciertos sin indemnización</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Fila 3: Tabla de Casos Recientes -->
      <div class="card-enterprise recent-table-card">
        <div class="card-ent-header">
          <div class="header-tit-icon">
            <span class="material-symbols-outlined text-primary">table_rows</span>
            <h3>Expedientes de Liquidación Recientes</h3>
          </div>
          <div class="table-actions-top">
            <button type="button" class="btn-link-action" (click)="onViewAllRecords.emit()">
              <span>Ver todos los registros ({{ records().length }})</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        @if (records().length === 0) {
          <div class="empty-dash-state">
            <div class="empty-icon-circle">
              <span class="material-symbols-outlined">folder_open</span>
            </div>
            <h4>No hay expedientes guardados aún</h4>
            <p>Puedes calcular tu primer caso en la calculadora o cargar 3 casos de prueba para explorar el panel.</p>
            <div class="empty-btn-wrap">
              <button type="button" class="btn-seed-now" (click)="storageService.seedInitialCases()">
                🧪 Cargar 3 Casos de Demostración
              </button>
              <button type="button" class="btn-calc-now" (click)="onNewLiquidation.emit()">
                + Crear Primera Liquidación
              </button>
            </div>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="enterprise-table">
              <thead>
                <tr>
                  <th>Colaborador / ID</th>
                  <th>Empresa</th>
                  <th>Contrato</th>
                  <th>Motivo de Retiro</th>
                  <th>Tiempo Laborado</th>
                  <th>Indemnización</th>
                  <th class="text-right">Total Liquidación</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of recentRecords(); track item.id) {
                  <tr>
                    <td>
                      <div class="emp-identity-cell">
                        <div class="emp-avatar">{{ getInitials(item.input.employeeName) }}</div>
                        <div class="emp-details">
                          <strong class="emp-name">{{ item.input.employeeName || 'Colaborador' }}</strong>
                          <span class="emp-id">C.C. {{ item.input.employeeId || 'N/A' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="company-name">{{ item.input.companyName || 'Empresa No Registrada' }}</span>
                    </td>
                    <td>
                      <span class="contract-badge">{{ item.input.contractType }}</span>
                    </td>
                    <td>
                      <span class="reason-pill" [class.danger]="item.input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA'" [class.neutral]="item.input.terminationReason !== 'DESPIDO_SIN_JUSTA_CAUSA'">
                        {{ item.input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA' ? 'Despido Injustificado' : (item.input.terminationReason === 'RENUNCIA_VOLUNTARIA' ? 'Renuncia' : 'Justa Causa') }}
                      </span>
                    </td>
                    <td>
                      <span class="worked-days-tag">{{ item.workedDaysTotal }} días</span>
                    </td>
                    <td>
                      <span class="indemnity-amount" [class.has-indemnity]="item.indemnityAmount > 0">
                        {{ item.indemnityAmount > 0 ? (item.indemnityAmount | currency:'COP':'symbol-narrow':'1.0-0') : '$0' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <strong class="total-amount">{{ item.totalLiquidacion | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
                    </td>
                    <td class="text-center">
                      <div class="table-row-actions">
                        <button type="button" class="btn-row-action" title="Cargar caso en Calculadora" (click)="onLoadRecord.emit(item)">
                          <span class="material-symbols-outlined">edit_square</span>
                        </button>
                        <button type="button" class="btn-row-action" title="Imprimir Acta Oficial" (click)="onPrintRecord.emit(item)">
                          <span class="material-symbols-outlined">print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
    }

    /* Top Bar */
    .dash-top-bar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
    }

    @media (min-width: 768px) {
      .dash-top-bar {
        flex-direction: row;
        align-items: flex-end;
      }
    }

    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 12px;
      color: var(--outline);
      margin-bottom: 0.25rem;
    }

    .crumb-sep {
      font-size: 14px;
    }

    .crumb-current {
      color: var(--on-surface);
      font-weight: 600;
    }

    .dash-title {
      font-size: 1.625rem;
      color: var(--on-surface);
      letter-spacing: -0.02em;
    }

    .dash-subtitle {
      color: var(--on-surface-variant);
      font-size: 13px;
      margin-top: 0.125rem;
    }

    .dash-top-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-dash-action {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      height: 38px;
      padding: 0 1rem;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
    }

    .btn-dash-action.primary {
      background-color: var(--primary-container);
      color: var(--on-primary);
      box-shadow: var(--shadow-sm);
    }

    .btn-dash-action.primary:hover {
      background-color: var(--primary);
    }

    .btn-dash-action.secondary {
      background-color: var(--surface);
      color: var(--on-surface);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-xs);
    }

    .btn-dash-action.secondary:hover:not(:disabled) {
      background-color: var(--surface-container-low);
    }

    .btn-dash-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Normative Strip */
    .normative-strip {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background-color: var(--surface);
      border: 1px solid var(--surface-container-high);
      border-radius: var(--radius-lg);
      padding: 0.875rem 1.25rem;
      box-shadow: var(--shadow-xs);
    }

    @media (min-width: 900px) {
      .normative-strip {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .system-status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 13px;
      color: var(--on-surface);
    }

    .status-dot-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    .normative-desc {
      font-size: 12px;
      color: var(--on-surface-variant);
      margin-top: 0.125rem;
    }

    .normative-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .kpi-mini-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      background-color: var(--surface-container-low);
      border-radius: var(--radius-md);
      font-size: 11px;
    }

    .kpi-mini-pill.highlight {
      background-color: var(--primary-light);
      border: 1px solid var(--surface-container-highest);
    }

    .pill-lbl {
      color: var(--outline);
    }

    .pill-val {
      font-weight: 600;
      color: var(--primary);
    }

    /* KPIs Grid */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .kpis-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .kpis-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .kpi-card {
      background-color: var(--surface);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-xs);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .kpi-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .kpi-card.highlight-hero {
      background: linear-gradient(135deg, #0b1c30 0%, #172b4d 100%);
      color: #ffffff;
      border: none;
    }

    .kpi-card.highlight-hero .kpi-tag {
      color: #94a3b8;
    }

    .kpi-card.highlight-hero .kpi-number {
      color: #ffffff;
    }

    .kpi-card.highlight-hero .kpi-footer-sub {
      color: #cbd5e1;
    }

    .kpi-card.highlight-hero .font-mono-num {
      color: #60a5fa;
    }

    .kpi-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .kpi-tag {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--outline);
    }

    .kpi-icon-box {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon-box.blue {
      background-color: var(--surface-container-low);
      color: var(--primary);
    }

    .kpi-icon-box.amber {
      background-color: var(--warning-light);
      color: var(--warning-dark);
    }

    .kpi-icon-box.green {
      background-color: var(--tertiary-light);
      color: var(--tertiary);
    }

    .kpi-icon-box.dark-blue {
      background-color: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    .kpi-main-val {
      margin-bottom: 0.875rem;
    }

    .kpi-number {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--on-surface);
      display: block;
    }

    .kpi-number.hero-num {
      color: #ffffff;
    }

    .kpi-badge-trend {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 11px;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      margin-top: 0.375rem;
    }

    .kpi-badge-trend.positive {
      background-color: var(--surface-container-low);
      color: var(--primary);
    }

    .kpi-badge-trend.warning {
      background-color: var(--error-container);
      color: var(--on-error-container);
    }

    .kpi-badge-trend.success {
      background-color: var(--tertiary-light);
      color: var(--tertiary);
    }

    .kpi-footer-bar {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .progress-track {
      width: 100%;
      height: 4px;
      background-color: var(--surface-container-high);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--primary);
      border-radius: 9999px;
    }

    .progress-text {
      font-size: 11px;
      color: var(--outline);
    }

    .kpi-footer-sub {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--on-surface-variant);
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.625rem;
    }

    .kpi-accent-pct {
      font-weight: 600;
      color: var(--error);
    }

    .kpi-accent-pct.text-green {
      color: var(--tertiary);
    }

    /* Middle Grid */
    .dash-middle-grid {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 1.25rem;
    }

    @media (min-width: 1024px) {
      .dash-middle-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .card-enterprise {
      background-color: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      padding: 1.25rem;
      box-shadow: var(--shadow-xs);
    }

    .card-ent-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--surface-container-low);
      padding-bottom: 0.75rem;
    }

    .header-tit-icon {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-tit-icon h3 {
      font-size: 1rem;
      font-weight: 600;
    }

    .causes-breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .cause-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0.75rem;
      background-color: var(--surface-container-low);
      border-radius: var(--radius-md);
    }

    .cause-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cause-bullet {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .cause-bullet.red {
      background-color: var(--error);
    }

    .cause-bullet.green {
      background-color: var(--tertiary);
    }

    .cause-bullet.gray {
      background-color: var(--secondary);
    }

    .cause-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--on-surface);
    }

    .cause-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .cause-count {
      font-size: 11px;
      color: var(--outline);
    }

    .cause-val {
      font-size: 13px;
      font-weight: 600;
      color: var(--on-surface);
    }

    .quick-intro {
      font-size: 12px;
      color: var(--on-surface-variant);
      margin-bottom: 0.875rem;
    }

    .quick-buttons-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.625rem;
    }

    @media (min-width: 600px) {
      .quick-buttons-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .btn-quick-scenario {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background-color: var(--surface);
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-quick-scenario:hover {
      background-color: var(--surface-container-low);
      border-color: var(--primary);
      transform: translateY(-1px);
    }

    .btn-icon {
      font-size: 1.25rem;
      line-height: 1;
    }

    .btn-txt {
      display: flex;
      flex-direction: column;
    }

    .btn-txt strong {
      font-size: 12px;
      color: var(--on-surface);
    }

    .btn-txt span {
      font-size: 11px;
      color: var(--outline);
    }

    /* Recent Table Card */
    .table-actions-top {
      display: flex;
      align-items: center;
    }

    .btn-link-action {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      color: var(--primary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-link-action:hover {
      text-decoration: underline;
    }

    .enterprise-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .enterprise-table th {
      text-align: left;
      padding: 0.625rem 0.75rem;
      font-size: 11px;
      font-weight: 600;
      color: var(--outline);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid var(--border-subtle);
      background-color: var(--surface-container-low);
    }

    .enterprise-table td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
    }

    .emp-identity-cell {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .emp-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background-color: var(--surface-container-high);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
    }

    .emp-details {
      display: flex;
      flex-direction: column;
    }

    .emp-name {
      color: var(--on-surface);
      font-size: 13px;
    }

    .emp-id {
      font-size: 11px;
      color: var(--outline);
    }

    .company-name {
      color: var(--on-surface-variant);
      font-size: 12px;
    }

    .contract-badge {
      font-size: 11px;
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-sm);
      background-color: var(--surface-container);
      color: var(--on-surface-variant);
      font-weight: 500;
    }

    .reason-pill {
      font-size: 11px;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      font-weight: 600;
    }

    .reason-pill.danger {
      background-color: var(--error-container);
      color: var(--on-error-container);
    }

    .reason-pill.neutral {
      background-color: var(--surface-container);
      color: var(--on-surface-variant);
    }

    .worked-days-tag {
      font-size: 12px;
      color: var(--on-surface);
    }

    .indemnity-amount {
      font-size: 12px;
      color: var(--outline);
    }

    .indemnity-amount.has-indemnity {
      color: var(--error);
      font-weight: 600;
    }

    .total-amount {
      font-size: 13px;
      color: var(--primary);
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .table-row-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
    }

    .btn-row-action {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background-color: var(--surface);
      color: var(--on-surface-variant);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-row-action:hover {
      background-color: var(--surface-container-high);
      color: var(--primary);
    }

    .btn-row-action .material-symbols-outlined {
      font-size: 16px;
    }

    .empty-dash-state {
      text-align: center;
      padding: 2.5rem 1rem;
    }

    .empty-icon-circle {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background-color: var(--surface-container-low);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .empty-dash-state h4 {
      font-size: 1.125rem;
      margin-bottom: 0.25rem;
    }

    .empty-dash-state p {
      color: var(--outline);
      font-size: 13px;
      max-width: 460px;
      margin: 0 auto 1.25rem;
    }

    .empty-btn-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-seed-now {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      background-color: var(--surface-container-low);
      color: var(--primary);
      border: 1px solid var(--surface-container-high);
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-calc-now {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      background-color: var(--primary-container);
      color: var(--on-primary);
      border: none;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }
  `]
})
export class ExecutiveDashboardComponent {
  @Output() onNewLiquidation = new EventEmitter<void>();
  @Output() onOpenCalculator = new EventEmitter<string>();
  @Output() onViewAllRecords = new EventEmitter<void>();
  @Output() onLoadRecord = new EventEmitter<LiquidationResult>();
  @Output() onPrintRecord = new EventEmitter<LiquidationResult>();

  constructor(public storageService: StorageService) {}

  records = computed(() => this.storageService.savedLiquidations());

  recentRecords = computed(() => {
    return this.records().slice(0, 5);
  });

  unjustCount = computed(() => {
    return this.records().filter(r => r.input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA').length;
  });

  resignationCount = computed(() => {
    return this.records().filter(r => r.input.terminationReason === 'RENUNCIA_VOLUNTARIA').length;
  });

  otherCount = computed(() => {
    return this.records().filter(r => r.input.terminationReason !== 'DESPIDO_SIN_JUSTA_CAUSA' && r.input.terminationReason !== 'RENUNCIA_VOLUNTARIA').length;
  });

  totalIndemnity = computed(() => {
    return this.records().reduce((acc, curr) => acc + (curr.indemnityAmount || 0), 0);
  });

  totalPrestaciones = computed(() => {
    return this.records().reduce((acc, curr) => acc + (curr.totalPrestaciones || 0), 0);
  });

  grandTotal = computed(() => {
    return this.records().reduce((acc, curr) => acc + (curr.totalLiquidacion || 0), 0);
  });

  averageLiquidation = computed(() => {
    const total = this.grandTotal();
    const count = this.records().length;
    return count > 0 ? Math.round(total / count) : 0;
  });

  indemnityPercentage = computed(() => {
    const total = this.grandTotal();
    const indemnity = this.totalIndemnity();
    return total > 0 ? (indemnity / total) * 100 : 0;
  });

  totalWorkedYears = computed(() => {
    const totalDays = this.records().reduce((acc, curr) => acc + (curr.workedDaysTotal || 0), 0);
    return (totalDays / 360).toFixed(1);
  });

  unjustTotal = computed(() => {
    return this.records()
      .filter(r => r.input.terminationReason === 'DESPIDO_SIN_JUSTA_CAUSA')
      .reduce((acc, curr) => acc + (curr.totalLiquidacion || 0), 0);
  });

  resignationTotal = computed(() => {
    return this.records()
      .filter(r => r.input.terminationReason === 'RENUNCIA_VOLUNTARIA')
      .reduce((acc, curr) => acc + (curr.totalLiquidacion || 0), 0);
  });

  otherTotal = computed(() => {
    return this.records()
      .filter(r => r.input.terminationReason !== 'DESPIDO_SIN_JUSTA_CAUSA' && r.input.terminationReason !== 'RENUNCIA_VOLUNTARIA')
      .reduce((acc, curr) => acc + (curr.totalLiquidacion || 0), 0);
  });

  getInitials(name?: string): string {
    if (!name) return 'HR';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}

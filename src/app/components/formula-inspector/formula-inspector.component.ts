import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidationResult, FormulaStep } from '../../models/liquidation.model';

@Component({
  selector: 'app-formula-inspector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inspector-card">
      <div class="inspector-header">
        <div class="header-title">
          <span class="badge-legal">CST & Marco Legal Vigente</span>
          <h3>Fórmulas y Fundamento Jurídico</h3>
          <p class="subtitle">Desglose transparente paso a paso según el Código Sustantivo del Trabajo colombiano</p>
        </div>
        <div class="tab-controls">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'formulas'"
            (click)="activeTab.set('formulas')">
            Fórmulas Aplicadas ({{ liquidation?.formulaSteps?.length || 0 }})
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'normativa'"
            (click)="activeTab.set('normativa')">
            Artículos CST y Leyes
          </button>
        </div>
      </div>

      <!-- Tab 1: Fórmulas sustituidas con valores reales -->
      @if (activeTab() === 'formulas') {
        <div class="steps-list">
          @if (!liquidation || liquidation.workedDaysTotal === 0 || (!liquidation.input.baseSalary || liquidation.input.baseSalary <= 0)) {
            <div class="empty-state">
              <p>Completa las fechas y el salario en el formulario para inspeccionar la sustitución matemática de las fórmulas en tiempo real.</p>
              <p class="empty-sub">También puedes consultar en cualquier momento la pestaña <strong>"Artículos CST y Leyes"</strong> superior.</p>
            </div>
          } @else {
            <!-- Contexto rápido de base salarial -->
            <div class="basis-banner">
              <div class="basis-item">
                <span class="label">Salario Base Ordinario:</span>
                <span class="val">{{ liquidation.input.baseSalary | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              <div class="basis-item">
                <span class="label">Auxilio de Transporte:</span>
                <span class="val" [class.accent]="liquidation.appliesTransportAllowance">
                  @if (liquidation.appliesTransportAllowance) {
                    {{ liquidation.transportAllowance | currency:'COP':'symbol-narrow':'1.0-0' }} (Aplica ≤ 2 SMMLV)
                  } @else if (!liquidation.qualifiesForTransportBySalary) {
                    <span style="color: #dc2626;">Inhabilitado (> 2 SMMLV - Ley 15/59)</span>
                  } @else {
                    <span style="color: #d97706;">Excluido por modalidad de contrato</span>
                  }
                </span>
              </div>
              <div class="basis-item">
                <span class="label">Días Totales de Contrato:</span>
                <span class="val">{{ liquidation.workedDaysTotal }} días ({{ liquidation.timeWorkedString }})</span>
              </div>
            </div>

            @for (step of liquidation.formulaSteps; track step.concept) {
              <div class="step-card" [class.indemnity-step]="step.concept.includes('Indemnización')">
                <div class="step-top">
                  <div class="step-title-group">
                    <span class="step-tag">{{ step.concept }}</span>
                    <span class="step-law-ref">{{ step.legalReference }}</span>
                  </div>
                  <div class="step-result">
                    {{ step.subtotal | currency:'COP':'symbol-narrow':'1.0-0' }}
                  </div>
                </div>

                <div class="step-formula-box">
                  <div class="formula-desc">
                    <span class="box-label">Fórmula Teórica:</span>
                    <code>{{ step.formulaDescription }}</code>
                  </div>
                  <div class="formula-calc">
                    <span class="box-label">Sustitución con valores reales:</span>
                    <code class="math-expr">{{ step.mathExpression }}</code>
                  </div>
                </div>

                <div class="step-explanation">
                  <p>{{ step.explanation }}</p>
                  @if (step.includesTransport) {
                    <div class="transport-note">
                      <span class="dot green"></span>
                      <span>Incluye Auxilio de Transporte por mandato de la Ley 1 de 1963 Art. 7 y Art. 306 CST.</span>
                    </div>
                  } @else if (step.concept.includes('Vacaciones')) {
                    <div class="transport-note warning">
                      <span class="dot amber"></span>
                      <span><strong>Exclusión legal:</strong> El Art. 192 del CST expresamente excluye el auxilio de transporte para liquidar vacaciones.</span>
                    </div>
                  } @else if (step.concept.includes('Indemnización') && step.subtotal > 0) {
                    <div class="transport-note info">
                      <span class="dot blue"></span>
                      <span>La indemnización del Art. 64 CST se liquida sobre el salario básico ordinario devengado.</span>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- Tab 2: Artículos y Leyes aplicables -->
      @if (activeTab() === 'normativa') {
        <div class="normative-list">
          <div class="law-card">
            <div class="law-header">
              <span class="law-code">Art. 64 CST (Modificado por Ley 789 de 2002 Art. 28)</span>
              <h4>Indemnización por Despido sin Justa Causa</h4>
            </div>
            <div class="law-body">
              <p>En todo contrato de trabajo va envuelta la condición resolutoria por incumplimiento de lo pactado. En caso de terminación unilateral del contrato sin justa causa comprobada por parte del empleador:</p>
              <ul>
                <li><strong>Contrato a Término Indefinido (&lt; 10 SMMLV):</strong> 30 días de salario por el primer año de servicio continuo, y 20 días de salario por cada uno de los años subsiguientes al primero y proporcionalmente por fracción.</li>
                <li><strong>Contrato a Término Indefinido (≥ 10 SMMLV):</strong> 20 días de salario por el primer año de servicio continuo, y 15 días de salario por cada uno de los años subsiguientes y proporcionalmente por fracción.</li>
                <li><strong>Contrato a Término Fijo:</strong> El valor de los salarios correspondientes al tiempo que faltare para cumplir el plazo estipulado del contrato.</li>
                <li><strong>Contrato por Obra o Labor:</strong> El valor de los salarios del tiempo que falte para concluir la obra o labor contratada, nunca inferior a quince (15) días de salario.</li>
              </ul>
            </div>
          </div>

          <div class="law-card">
            <div class="law-header">
              <span class="law-code">Art. 62 CST</span>
              <h4>Terminación del Contrato por Justa Causa</h4>
            </div>
            <div class="law-body">
              <p>Si el despido se produce mediando alguna de las 15 causales taxativas de justa causa comprobadas por el empleador (o renuncia voluntaria del trabajador Art. 61), <strong>no habrá lugar a indemnización de perjuicios</strong>. No obstante, las prestaciones sociales causadas (cesantías, intereses, primas y vacaciones) son derechos ciertos e indiscutibles y deben pagarse en su totalidad.</p>
            </div>
          </div>

          <div class="law-card">
            <div class="law-header">
              <span class="law-code">Art. 249 CST & Ley 1 de 1963</span>
              <h4>Cesantías</h4>
            </div>
            <div class="law-body">
              <p>Todo empleador está obligado a pagar a sus trabajadores, al terminar el contrato de trabajo, como auxilio de cesantía, un mes de salario por cada año de servicios y proporcionalmente por fracción de año. Por expresa disposición del Art. 7 de la Ley 1 de 1963, el auxilio de transporte se suma a la base salarial para liquidar cesantías.</p>
            </div>
          </div>

          <div class="law-card">
            <div class="law-header">
              <span class="law-code">Ley 52 de 1975 & Dec. 116 de 1976</span>
              <h4>Intereses sobre Cesantías</h4>
            </div>
            <div class="law-body">
              <p>Todo empleador debe cancelar al trabajador intereses sobre las cesantías a una tasa del 12% anual o proporcional al tiempo de servicio en el año. Se calculan sobre el saldo acumulado de las cesantías del periodo.</p>
            </div>
          </div>

          <div class="law-card">
            <div class="law-header">
              <span class="law-code">Art. 306 CST (Ley 1788 de 2016)</span>
              <h4>Prima de Servicios</h4>
            </div>
            <div class="law-body">
              <p>El empleador está obligado a pagar a su empleado la prestación social denominada prima de servicios, que corresponderá a 30 días de salario por año (divididos en 15 días en junio y 15 días en diciembre) o proporcional al tiempo laborado en el semestre. También incorpora el auxilio de transporte.</p>
            </div>
          </div>

          <div class="law-card">
            <div class="law-header">
              <span class="law-code">Art. 186 & Art. 192 CST</span>
              <h4>Compensación en Dinero de Vacaciones</h4>
            </div>
            <div class="law-body">
              <p>Los trabajadores que hubieren prestado sus servicios durante un año tienen derecho a 15 días hábiles consecutivos de vacaciones remuneradas. Al terminar el contrato, se compensa el tiempo no disfrutado en dinero. <strong>Importante:</strong> El Art. 192 del CST excluye expresamente el auxilio de transporte de la base de cálculo de las vacaciones.</p>
            </div>
          </div>

          <div class="law-card">
            <div class="law-header">
              <span class="law-code">Ley 15 de 1959 & Decreto 1258 de 1959</span>
              <h4>Régimen Legal del Auxilio de Transporte (Tope 2 SMMLV y Excepciones)</h4>
            </div>
            <div class="law-body">
              <p><strong>1. Límite Legal Máximo (Tope de 2 SMMLV):</strong> Solo tienen derecho al subsidio de transporte los trabajadores que devenguen hasta dos (2) Salarios Mínimos Legales Mensuales Vigentes. Por disposición de orden público, ningún trabajador con salario superior a 2 SMMLV puede percibirlo legalmente.</p>
              <p><strong>2. Naturaleza Jurídica y Opcionalidad Contractual:</strong> El auxilio no retribuye servicios (no es salario), sino que constituye un reintegro de los gastos diarios de traslado efectivo. Por ende, la ley laboral colombiana y la jurisprudencia de la Corte Suprema exoneran al empleador de su pago en las siguientes modalidades contractuales:</p>
              <ul>
                <li><strong>Teletrabajo y Trabajo en Casa (Ley 2088 de 2020):</strong> Al no existir movilización física, se sustituye por el auxilio de conectividad digital o se excluye si no hay desplazamiento.</li>
                <li><strong>Suministro de Transporte (Ley 15 de 1959 Art. 2):</strong> Cuando la empresa suministra el transporte directo (rutas corporativas puerta a puerta).</li>
                <li><strong>Residencia en el lugar de trabajo:</strong> Cuando el trabajador vive en el mismo predio o campamento donde ejecuta su labor.</li>
              </ul>
              <p><strong>3. Incidencia Prestacional:</strong> Por mandato del Art. 7 de la Ley 1 de 1963 y Art. 306 del CST, el auxilio de transporte se suma obligatoriamente a la base de cálculo de <em>Cesantías</em> y <em>Prima de Servicios</em>, pero se excluye expresamente de las <em>Vacaciones</em> (Art. 192 CST) y de la <em>Indemnización por Despido</em> (Art. 64 CST).</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .inspector-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      height: 100%;
    }

    .inspector-header {
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 1rem;
    }

    .badge-legal {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0284c7;
      background: #e0f2fe;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      margin-bottom: 0.5rem;
    }

    .header-title h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
    }

    .subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 1rem 0;
    }

    .tab-controls {
      display: flex;
      gap: 0.5rem;
      background: #f1f5f9;
      padding: 0.25rem;
      border-radius: 10px;
    }

    .tab-btn {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
    }

    .basis-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.8rem;
    }

    .basis-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .basis-item .label {
      color: #64748b;
    }

    .basis-item .val {
      font-weight: 700;
      color: #0f172a;
    }

    .basis-item .val.accent {
      color: #059669;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 680px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .step-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      background: #ffffff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .step-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }

    .step-card.indemnity-step {
      border-left: 4px solid #ef4444;
      background: linear-gradient(to right, #fff5f5, #ffffff 40%);
    }

    .step-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 0.5rem;
    }

    .step-title-group {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .step-tag {
      font-size: 0.92rem;
      font-weight: 700;
      color: #0f172a;
    }

    .step-law-ref {
      font-size: 0.74rem;
      font-weight: 600;
      color: #0284c7;
    }

    .step-result {
      font-size: 1.05rem;
      font-weight: 800;
      color: #059669;
      white-space: nowrap;
    }

    .step-card.indemnity-step .step-result {
      color: #dc2626;
    }

    .step-formula-box {
      background: #f8fafc;
      border-radius: 8px;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      margin-bottom: 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .box-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: #64748b;
      display: block;
      margin-bottom: 0.1rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    code {
      font-family: 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.78rem;
      color: #1e293b;
      word-break: break-word;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .math-expr {
      color: #0369a1;
      font-weight: 600;
    }

    .step-explanation {
      font-size: 0.78rem;
      color: #475569;
      line-height: 1.4;
    }

    .step-explanation p {
      margin: 0 0 0.4rem 0;
    }

    .transport-note {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      color: #047857;
      background: #ecfdf5;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
    }

    .transport-note.warning {
      color: #b45309;
      background: #fffbeb;
    }

    .transport-note.info {
      color: #1d4ed8;
      background: #eff6ff;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .dot.green { background: #10b981; }
    .dot.amber { background: #f59e0b; }
    .dot.blue { background: #3b82f6; }

    .normative-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 680px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .law-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1rem;
    }

    .law-code {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      color: #0369a1;
      background: #f0f9ff;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.3rem;
    }

    .law-header h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.95rem;
      color: #0f172a;
    }

    .law-body {
      font-size: 0.8rem;
      color: #334155;
      line-height: 1.5;
    }

    .law-body ul {
      margin: 0.5rem 0 0 1rem;
      padding: 0;
    }

    .law-body li {
      margin-bottom: 0.4rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .inspector-card {
        padding: 1rem 0.75rem;
        border-radius: 12px;
      }

      .basis-banner {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.6rem;
        padding: 0.65rem 0.75rem;
      }

      .step-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.35rem;
      }

      .step-result {
        font-size: 0.95rem;
      }

      .steps-list, .normative-list {
        max-height: none;
        overflow-y: visible;
        padding-right: 0;
      }
    }
  `]
})
export class FormulaInspectorComponent {
  @Input() liquidation: LiquidationResult | null = null;
  @Input() set defaultToNormativa(val: boolean) {
    if (val) {
      this.activeTab.set('normativa');
    }
  }
  readonly activeTab = signal<'formulas' | 'normativa'>('formulas');
}

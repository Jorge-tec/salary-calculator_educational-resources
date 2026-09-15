import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface QuadrantData {
  key: string;
  name: string;
  badge: string;
  count: number;
  pct: number;
  desc: string;
  levelBadge: string;
  potential: 'Alto' | 'Medio' | 'Bajo';
  performance: 'Bajo' | 'Medio' | 'Alto';
  avgScore: number;
  okrScore: number;
  summary: string;
  sampleTalents: {
    name: string;
    role: string;
    avatar: string;
    score: string;
    okr: string;
  }[];
}

export interface CalibrationRow {
  id: string;
  employeeName: string;
  role: string;
  avatar: string;
  managerName: string;
  evalStatus: string;
  evalStatusType: 'ok' | 'calibrating' | 'pending' | 'review';
  evalSub: string;
  ratingScore: number;
  potential: 'Alto' | 'Medio' | 'Bajo';
  quadrantName: string;
  quadrantClass: string;
  okrPct: number;
  okrKrs: string;
  okrColor: string;
  recommendedAction: string;
  actionClass: string;
}

@Component({
  selector: 'app-performance-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-evaluations.component.html',
  styleUrl: './performance-evaluations.component.css'
})
export class PerformanceEvaluationsComponent {
  @Output() onOpenCalculator = new EventEmitter<void>();

  readonly activeViewMode = signal<'grid' | 'okrs' | 'committee'>('grid');
  readonly selectedQuadrantKey = signal<string>('top_talent');
  readonly toastMessage = signal<string | null>(null);

  // Filters
  searchQuery: string = '';
  selectedCycle: string = 'Q3/Q4 2024 - Cierre Anual';
  selectedDept: string = 'all';
  selectedLocation: string = 'all';

  // 9 Quadrants definition
  readonly quadrants: Record<string, QuadrantData> = {
    enigma: {
      key: 'enigma',
      name: 'Talento Desalineado',
      badge: 'Enigma',
      count: 30,
      pct: 2.1,
      desc: 'Alto potencial, barrera operativa',
      levelBadge: 'Alto Pot. + Bajo Rend.',
      potential: 'Alto',
      performance: 'Bajo',
      avgScore: 2.85,
      okrScore: 54.2,
      summary: 'Colaboradores con alta capacidad intelectual o estratégica enfrentando barreras operativas, desmotivación o problemas de adaptación en su rol actual.',
      sampleTalents: [
        {
          name: 'Marcos Rivas',
          role: 'Junior Data Scientist • AI Core',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          score: '2.8 / 5.0',
          okr: '55% OKRs'
        }
      ]
    },
    growth_star: {
      key: 'growth_star',
      name: 'Estrella en Crecimiento',
      badge: 'Futuro Pilar',
      count: 142,
      pct: 9.9,
      desc: 'Aceleración y coaching directivo',
      levelBadge: 'Alto Pot. + Medio Rend.',
      potential: 'Alto',
      performance: 'Medio',
      avgScore: 3.75,
      okrScore: 82.5,
      summary: 'Profesionales con un potencial de liderazgo notable y desempeño sólido con gran margen de crecimiento. Candidatos a programas de mentoría ejecutiva.',
      sampleTalents: [
        {
          name: 'Laura Vázquez',
          role: 'Product Owner • Fintech Solutions',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          score: '3.9 / 5.0',
          okr: '85% OKRs'
        }
      ]
    },
    top_talent: {
      key: 'top_talent',
      name: 'Top Talent / Futuros Líderes',
      badge: 'Top Talent ★',
      count: 88,
      pct: 6.2,
      desc: 'Sucesión inmediata & retención clave',
      levelBadge: 'Alto Pot. + Alto Rend.',
      potential: 'Alto',
      performance: 'Alto',
      avgScore: 4.74,
      okrScore: 96.8,
      summary: 'Colaboradores de impacto exponencial. Perfiles elegibles para sucesión a corto plazo (6-12 meses), bonos de retención LTI y asignaciones internacionales.',
      sampleTalents: [
        {
          name: 'Carmen Salgado',
          role: 'Staff Software Engineer • Cloud Arch',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPYSPixwnDXKY7SHLSAwbJV8WtcToaPR1gq8yZtuxYDFP3sbuLXK6rF4YEKTJCu30gqotsRGChHYNosEp-J4oI_vB3xEu3ujR-63IcdUVAFtwFKmUX8HXI5ezrWUVsZfqrApkFxAlAZN1ThReATPQfzXOxQNDIch6CQVFBBLeTVxVjJ56JGLHABe04-YGHz3lHmQ2uGgdiqgERRD-9CMH7__RX-bA09m-Y6BifE5sMIgfUUa-GKYvO',
          score: '4.9 / 5.0',
          okr: '100% OKRs'
        },
        {
          name: 'Javier Aranda',
          role: 'Lead Product Manager • Core Ledger',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgYmuNNsa6dkijcZpE0QkQ1H2U_otigVlJD9jpRyNSihe6SoEL9MhNDB_g2KNpcvHb9N3DFoqcVmZxpI4_mwVs_K5FWE4RVFaeKulytFDKHWiWPY1Qey8kC-wtAU9py1JiFPV4G2edZI618XpI0rHxHGmg--p8kzsn7jzsTng8gBB_nOXQ8qjEaH5-q5oJ6j5RXKQfw-ERsjYNFRT0_2o5yFfqeZr0NIsNhCV_oA-q65IozDWyXhu0',
          score: '4.8 / 5.0',
          okr: '98% OKRs'
        },
        {
          name: 'Berta Ndiaye',
          role: 'Strategic People Partner • EMEA',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6XPhPfmNn1yUv24tuMi9irYxsBhNJiWIX0KGjZDzgHUa0UskePQ3z6FmhF7BXaihEUa0sOnLI2Ny0EHlVW7PejwMdJZr72xwKowMflwUDxgc2rtmVqXntLWdNj5Kc0nrH5AhMDeHC8z1DQq9TUMMTNth2DZbEWdgtVKL7pxbmlfUPjeYPOS_P2RgcYj8sJwiQybOaxaiGWW5A_9cOyT7he3TeqtK9yue8lsaxMTpzUW_GzLILG1gG',
          score: '4.7 / 5.0',
          okr: '95% OKRs'
        }
      ]
    },
    dilemma: {
      key: 'dilemma',
      name: 'Necesita Apoyo / Reenfoque',
      badge: 'Dilema',
      count: 85,
      pct: 5.9,
      desc: 'Revisar fit de puesto y metas',
      levelBadge: 'Medio Pot. + Bajo Rend.',
      potential: 'Medio',
      performance: 'Bajo',
      avgScore: 2.65,
      okrScore: 61.0,
      summary: 'Perfiles con potencial intermedio cuyo rendimiento en el último ciclo ha decaído. Requieren un análisis de barreras o cambio de responsabilidades.',
      sampleTalents: [
        {
          name: 'Raúl Ortega',
          role: 'Content Strategist • Marketing',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          score: '2.7 / 5.0',
          okr: '62% OKRs'
        }
      ]
    },
    solid_pro: {
      key: 'solid_pro',
      name: 'Profesional Sólido',
      badge: 'Núcleo',
      count: 480,
      pct: 33.6,
      desc: 'Espina dorsal de la organización',
      levelBadge: 'Medio Pot. + Medio Rend.',
      potential: 'Medio',
      performance: 'Medio',
      avgScore: 3.65,
      okrScore: 78.4,
      summary: 'El grupo más amplio de la compañía. Ejecutores consistentes y confiables que garantizan la estabilidad operativa diaria en todas las divisiones.',
      sampleTalents: [
        {
          name: 'Diego Restrepo',
          role: 'DevOps Specialist • Infraestructura',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZLbliYRBei8nbu0X-1GYnZG7hOMUKgO_b4uwbdbAQfRaVCxyd1Wkfz32f_T_b-nM2D4EXYlfekrhtSJGpmHsW1IAlWm2QxSQdMmGfh-pcym194hZ2Qyc8IuROS1N-HTOsVIaaJ0Wwc_MPKlP2GnOLXWRPoxMQADt3RhXO9cV3CGvQ9N-T4SAbjDt2RA50YkuDFCPdHuFui_-w31wNJFaBNVIcTRppEG6rdPDs0xOBKA9qMq7drfI4',
          score: '3.7 / 5.0',
          okr: '76% OKRs'
        }
      ]
    },
    high_performer: {
      key: 'high_performer',
      name: 'Especialista Clave',
      badge: 'High Performer',
      count: 215,
      pct: 15.0,
      desc: 'Alta productividad, expandir impacto',
      levelBadge: 'Medio Pot. + Alto Rend.',
      potential: 'Medio',
      performance: 'Alto',
      avgScore: 4.35,
      okrScore: 89.2,
      summary: 'Superan de forma constante sus metas operativas individuales. Claves para la excelencia técnica y candidatos a reconocimiento salarial por mérito.',
      sampleTalents: [
        {
          name: 'Álvaro Mendoza',
          role: 'Senior Product Designer • UX Global',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGhmju8f3i0LcVBQzdF-R4eedW8d9Y1QGx4SK6jCDn2oaA7vrv6W4IX4J6gPtF5yK6YvKKbCCZZQtK4Vn13mmXOshew_yRSWJnI3PDI3Ti89ofa036fT_gK8Pvq3M-x5WEYGq1bCFIQWelLpfDHpFc4A6E7L4pLxy17-_5VuPqwPDj1gWvfSAwExHt9GXe7l8kvf2hSpOdNdnkrFniSKZ5j22Wha-TekSCVZqss2_higf8g3bXbcUL',
          score: '4.3 / 5.0',
          okr: '88% OKRs'
        }
      ]
    },
    pip_alert: {
      key: 'pip_alert',
      name: 'Bajo Rendimiento Crítico',
      badge: 'Riesgo PIP',
      count: 38,
      pct: 2.6,
      desc: 'Plan de mejora a 60 días urgente',
      levelBadge: 'Bajo Pot. + Bajo Rend.',
      potential: 'Bajo',
      performance: 'Bajo',
      avgScore: 2.10,
      okrScore: 42.0,
      summary: 'Rendimiento inaceptable prolongado sin potencial de adaptación visible. Requieren ingreso formal a plan de desempeño (PIP) o inicio de rescisión.',
      sampleTalents: [
        {
          name: 'Daniel Riveiro',
          role: 'Support Engineer II • Customer Success',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB60PV_H8xafqPgH35x1YRXbMr5J3luFgXTBshdNhYXXxWbqbTmlLHVmZtyGUvUyUXb9w5n0pdCy4m_mU6GTSVYaCgESUnP1_2wVEKKFQ7rsrkMJkmrYhn2PLY6nBGW-ugscXZfxEbtH_aoTo1mXLCfZoe27_F9grCs-JhaOM2VuEkLJM4E6CK0_f37dbHkkMED7NwHnBLxGsYGFe3urKUm9OVLYWpbtYK7_TKFR2zM6T-OStyASeIY',
          score: '2.1 / 5.0',
          okr: '42% OKRs'
        }
      ]
    },
    effective: {
      key: 'effective',
      name: 'Efectivo / Cumplidor',
      badge: 'Cumplidor',
      count: 140,
      pct: 9.8,
      desc: 'Estable en funciones actuales',
      levelBadge: 'Bajo Pot. + Medio Rend.',
      potential: 'Bajo',
      performance: 'Medio',
      avgScore: 3.15,
      okrScore: 71.3,
      summary: 'Cumplen con lo esperado para su puesto sin aspiraciones de asumir mayores responsabilidades de gestión ni complejidad técnica añadida.',
      sampleTalents: [
        {
          name: 'Ignacio Vega',
          role: 'Operations Clerk • Logística',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
          score: '3.2 / 5.0',
          okr: '72% OKRs'
        }
      ]
    },
    tech_expert: {
      key: 'tech_expert',
      name: 'Experto Confiable',
      badge: 'Especialista',
      count: 190,
      pct: 13.3,
      desc: 'Maestría técnica sin ambición directiva',
      levelBadge: 'Bajo Pot. + Alto Rend.',
      potential: 'Bajo',
      performance: 'Alto',
      avgScore: 4.25,
      okrScore: 91.5,
      summary: 'Grandes artesanos y expertos técnicos con excelente rendimiento en su nicho especializado, preferibles en rol individual contributor.',
      sampleTalents: [
        {
          name: 'Sonia Garrido',
          role: 'Principal QA Automation • Testing Hub',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          score: '4.3 / 5.0',
          okr: '92% OKRs'
        }
      ]
    }
  };

  // Calibration Table Rows (5 master rows from referencia-front/6.code.html)
  readonly calibrationRows: CalibrationRow[] = [
    {
      id: 'cal-1',
      employeeName: 'Carmen Salgado',
      role: 'Staff Software Engineer • Ingeniería',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKTZx8VKoizFtmbqxQaG5i4g2cWRy5GQGOXPm5lKUQHxQdZVWDrlFDeGb2eY1K-pGPgGxcBQI24DeEPBt3OAYLhIQOri324QhzHHQUEZuUxn_mTnGcS3V0uB6hL-NNrF0VIhpypxmLIBFcUg3sWQRVQB_faKV0OCdBNl5ZBBD7g1te0Gvhc2zKRqIzE3M66cjALRyTP5ahUnLn0jlFiNfOG4P_IVjialmjJjaDgGXgscndLVY0rHyQ',
      managerName: 'Marcus Vance',
      evalStatus: 'Calibrada OK',
      evalStatusType: 'ok',
      evalSub: 'Auto (100%) • Mgr (100%)',
      ratingScore: 4.9,
      potential: 'Alto',
      quadrantName: 'Top Talent',
      quadrantClass: 'bg-tertiary-container text-on-tertiary',
      okrPct: 100,
      okrKrs: '4/4 KRs',
      okrColor: 'bg-tertiary',
      recommendedAction: 'Elegible Promoción (L7)',
      actionClass: 'bg-primary-fixed text-primary font-bold'
    },
    {
      id: 'cal-2',
      employeeName: 'Álvaro Mendoza',
      role: 'Senior Product Designer • UX Global',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGhmju8f3i0LcVBQzdF-R4eedW8d9Y1QGx4SK6jCDn2oaA7vrv6W4IX4J6gPtF5yK6YvKKbCCZZQtK4Vn13mmXOshew_yRSWJnI3PDI3Ti89ofa036fT_gK8Pvq3M-x5WEYGq1bCFIQWelLpfDHpFc4A6E7L4pLxy17-_5VuPqwPDj1gWvfSAwExHt9GXe7l8kvf2hSpOdNdnkrFniSKZ5j22Wha-TekSCVZqss2_higf8g3bXbcUL',
      managerName: 'Sofia Arispe',
      evalStatus: 'En Calibración',
      evalStatusType: 'calibrating',
      evalSub: 'Auto (100%) • Mgr (100%)',
      ratingScore: 4.3,
      potential: 'Medio',
      quadrantName: 'Especialista Clave',
      quadrantClass: 'bg-surface-container-high text-primary',
      okrPct: 88,
      okrKrs: '3/4 KRs',
      okrColor: 'bg-primary',
      recommendedAction: 'Revisión Salarial +8%',
      actionClass: 'bg-surface-container text-on-surface'
    },
    {
      id: 'cal-3',
      employeeName: 'Patricia Galván',
      role: 'Account Executive Enterprise • Ventas',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkD6YBXKTAR6hw7oPcbIK47fZIi1C_Pebn05nSZgeNa8hUXKefZG5BTkBclyS3YM4FNFwh7x-lv83tABIclX-XDilK56dhhFYHEKTCDkIQ8h0aU0Z4sI4jOTL6sVr_CwpmeJOAHI2Mgg97PPvsGceHEwulCV5t4UGZ7xs68fWQ_L0r4oOQ4rjDs-iFN218GQq2EioI1xGM0dhwxEkl1NWehLCqfsvzDO2L3xnyAo1lAh6W6WEYiaU7',
      managerName: 'Lucia Méndez',
      evalStatus: 'Calibrada OK',
      evalStatusType: 'ok',
      evalSub: 'Auto (100%) • Mgr (100%)',
      ratingScore: 4.6,
      potential: 'Alto',
      quadrantName: 'Top Talent',
      quadrantClass: 'bg-tertiary-container text-on-tertiary',
      okrPct: 112,
      okrKrs: 'Arr. Q4',
      okrColor: 'bg-tertiary',
      recommendedAction: 'Plan de Retención (LTI)',
      actionClass: 'bg-tertiary-fixed-dim/40 text-tertiary font-bold'
    },
    {
      id: 'cal-4',
      employeeName: 'Diego Restrepo',
      role: 'DevOps Specialist • Infraestructura',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZLbliYRBei8nbu0X-1GYnZG7hOMUKgO_b4uwbdbAQfRaVCxyd1Wkfz32f_T_b-nM2D4EXYlfekrhtSJGpmHsW1IAlWm2QxSQdMmGfh-pcym194hZ2Qyc8IuROS1N-HTOsVIaaJ0Wwc_MPKlP2GnOLXWRPoxMQADt3RhXO9cV3CGvQ9N-T4SAbjDt2RA50YkuDFCPdHuFui_-w31wNJFaBNVIcTRppEG6rdPDs0xOBKA9qMq7drfI4',
      managerName: 'Marcus Vance',
      evalStatus: 'Manager Pendiente',
      evalStatusType: 'pending',
      evalSub: 'Auto (100%) • Mgr (65%)',
      ratingScore: 3.7,
      potential: 'Medio',
      quadrantName: 'Profesional Sólido',
      quadrantClass: 'bg-surface-container-high text-on-surface',
      okrPct: 76,
      okrKrs: '2/3 KRs',
      okrColor: 'bg-primary-container',
      recommendedAction: 'Reforzar Certificación AWS',
      actionClass: 'bg-surface-container text-on-surface'
    },
    {
      id: 'cal-5',
      employeeName: 'Daniel Riveiro',
      role: 'Support Engineer II • Customer Success',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB60PV_H8xafqPgH35x1YRXbMr5J3luFgXTBshdNhYXXxWbqbTmlLHVmZtyGUvUyUXb9w5n0pdCy4m_mU6GTSVYaCgESUnP1_2wVEKKFQ7rsrkMJkmrYhn2PLY6nBGW-ugscXZfxEbtH_aoTo1mXLCfZoe27_F9grCs-JhaOM2VuEkLJM4E6CK0_f37dbHkkMED7NwHnBLxGsYGFe3urKUm9OVLYWpbtYK7_TKFR2zM6T-OStyASeIY',
      managerName: 'Elena Morales',
      evalStatus: 'Bajo Revisión RRHH',
      evalStatusType: 'review',
      evalSub: 'Auto (100%) • Mgr (100%)',
      ratingScore: 2.1,
      potential: 'Bajo',
      quadrantName: 'Plan PIP',
      quadrantClass: 'bg-error text-on-error font-bold',
      okrPct: 42,
      okrKrs: '1/4 KRs',
      okrColor: 'bg-error',
      recommendedAction: 'Acceso a Plan PIP (60d)',
      actionClass: 'bg-error text-on-error font-bold'
    }
  ];

  readonly activeQuadrant = computed(() => {
    const k = this.selectedQuadrantKey();
    return this.quadrants[k] || this.quadrants['top_talent'];
  });

  selectQuadrant(key: string): void {
    this.selectedQuadrantKey.set(key);
  }

  exportMatrix(): void {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Colaborador,Manager,Rating 360,Potencial,Cuadrante 9-Box,Cumplimiento OKR,Accion Recomendada\n" +
      this.calibrationRows.map(r => `"${r.employeeName}","${r.managerName}",${r.ratingScore},"${r.potential}","${r.quadrantName}","${r.okrPct}%","${r.recommendedAction}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "matriz_9box_calibracion_2024.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Descargada Matriz de Calibración 9-Box (XLSX/CSV compatible)');
  }

  startCalibrationRound(): void {
    this.showToast('Iniciando sesión de calibración para 1,428 colaboradores ponderados...');
  }

  addToSuccessionPool(): void {
    this.showToast(`Los ${this.activeQuadrant().count} colaboradores de "${this.activeQuadrant().name}" fueron vinculados al Pool de Sucesión Directiva.`);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}

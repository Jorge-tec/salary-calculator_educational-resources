import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PendingRequest {
  id: string;
  name: string;
  role: string;
  avatar: string;
  requestType: string;
  requestIcon: string;
  requestIconColor: string;
  datesOrAmount: string;
  subtitle: string;
  category: 'vacations' | 'raises' | 'expenses';
  status: 'Urgente' | 'En aprobación' | 'Pendiente validación';
  statusClass: 'urgent' | 'in-review' | 'pending';
}

export interface ExpirationItem {
  id: string;
  title: string;
  daysRemaining: string;
  remainingDaysCount: number;
  person: string;
  date: string;
  progressPercent: number;
  colorType: 'error' | 'tertiary' | 'primary' | 'secondary';
}

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './executive-dashboard.component.html',
  styleUrl: './executive-dashboard.component.css'
})
export class ExecutiveDashboardComponent {
  @Output() onNewLiquidation = new EventEmitter<void>();
  @Output() onOpenCalculator = new EventEmitter<string>();
  @Output() onViewAllRecords = new EventEmitter<void>();

  // Filtro de solicitudes
  readonly selectedCategory = signal<'all' | 'vacations' | 'raises' | 'expenses'>('all');
  
  // Solicitudes pendientes
  readonly requests = signal<PendingRequest[]>([
    {
      id: 'req-1',
      name: 'Sara Villanueva',
      role: 'Lead Cloud Architect · Tech',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArmXY3_miwRTBbGLvSaVs2gPsHk5KF7NDxZfbLfrldhcaYOb-cjMfYa6OoTWDaVH6Spo_yfPKsTSYXBYS5AlBXkK8FUwML-uwPSKQmwX2jCzOFSqlcwC1elP22JSWmH6dvVUFrfv7PZndmjtoiiRKnx6FKFuBtrxqCiwBuE8I7ZAqVpYnhSDBPSOUr5PtWgwMuiVQ0uyLWNMRkesvNePBYSquBXm9Ar9v3vggBuEShLFCYrffb8ppm',
      requestType: 'Vacaciones Anuales',
      requestIcon: 'flight_takeoff',
      requestIconColor: '#004ac6',
      datesOrAmount: '04 Nov - 15 Nov (10d)',
      subtitle: 'Balance: 14d restantes',
      category: 'vacations',
      status: 'Urgente',
      statusClass: 'urgent'
    },
    {
      id: 'req-2',
      name: 'Carlos Benítez',
      role: 'Sr. Growth Manager · Marketing',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx2ihxk7p-DwFF3QPbPzaL6vnJyd4FDEJZQ95o_fs4PQVLe79Gkz0KrHMwyKIsULELcJfoNv6RxcKYD4N2FKx6iM6LeXMBQbVS7VJxr1e3NffcGB9YqRA4tW-G0tnStZC1eIhZizC0ftrHeYsbV0yVt6ByiGvmk7w6aMDGIZVJQ46eSlTaQgVKuKR3cEd5ryAqGy8JFuFdcFWoc2h_Iq3l04ex9fT5Rzq3rozW6YhjCe2qHM32_ksc',
      requestType: 'Reembolso de Gastos',
      requestIcon: 'receipt_long',
      requestIconColor: '#007d55',
      datesOrAmount: '€1,450.00',
      subtitle: 'SaaS Summit London 2024',
      category: 'expenses',
      status: 'En aprobación',
      statusClass: 'in-review'
    },
    {
      id: 'req-3',
      name: 'Martina Soria',
      role: 'Principal Data Eng · BI',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_E4su2x2iZG81V73FAQkzscaFAFFRSgSmtGh-czfZ_m8WhYhA-fk-fGR01qq_hxwE2fOGOp7no9JdZj0IVeYZQpgOE6OL7ipGIljm_gmXo22H-mLFU6kHtBc1ByAl5XyzCurziDJEmf7ajlv5tszrieTRpjQK_sM_QtJ6LVAoK2EyB5wIoNTsWlNOCSvpliWpTZlE9F5dy_xNb5H_hSzckQCmOrIpNig6J-VA9KI5iuUj1TM2ezC3',
      requestType: 'Revisión Salarial (Promoción)',
      requestIcon: 'trending_up',
      requestIconColor: '#004ac6',
      datesOrAmount: '+8.5% (€72K -> €78.1K)',
      subtitle: 'Aprobado por Manager',
      category: 'raises',
      status: 'Pendiente validación',
      statusClass: 'pending'
    },
    {
      id: 'req-4',
      name: 'Javier Aranda',
      role: 'Logistics Supervisor · Ops',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhJIx9GCC-4yOft8s8F_IC0K-ggnvL-CrrDox6_OJJEqq9LYst8NbvvK43PhndkhxPUrOiFH1jNX6uYQ8z8N2HfnROnpk2mXn_Nv-0r8u4wsGEE7cIYMsZ8uzCGeglSh889C5czM493neN6Ncv6fBjLpTy1HyfVCso9Rs3mfzFXKa-shCS98nR8-8ljqWYqsYQpCWU71LzJn89s3O8VNNmCaaHu_c1xd0sT4IMZ1neuEFLmpv2YPnZ',
      requestType: 'Horas Extraordinarias',
      requestIcon: 'schedule',
      requestIconColor: '#737686',
      datesOrAmount: '18.5 Horas (€540)',
      subtitle: 'Cierre Inventario Q3',
      category: 'expenses',
      status: 'En aprobación',
      statusClass: 'in-review'
    },
    {
      id: 'req-5',
      name: 'Lucía Méndez',
      role: 'CS Specialist · Support',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJAGvYXf-ViCkdqAVzpUCXMUxQ54cxUaZ1aRKz1otQjGH2daav7KOQ8ZSQHQ__kZnEfzmmFiKv2pVneJGHwgnTxcLULyUeE-MFvu5krGnSVlNtrOSVk-WX_A-nKHoz1_MviOSIItpAVY2LqZCW82YNA_Gp_qBa7GEQ903NzcxV492Dh0ijkTqP4rDIiHKWGOR0QWrzkq8nsqy74h1GpH_o7gLGtPXJUZDgMCzhrLiSTLixl0KiXj3S',
      requestType: 'Permiso Paternidad / Cuidados',
      requestIcon: 'child_friendly',
      requestIconColor: '#004ac6',
      datesOrAmount: '12 Nov - 28 Nov',
      subtitle: 'Documentación aportada',
      category: 'vacations',
      status: 'Urgente',
      statusClass: 'urgent'
    }
  ]);

  // Vencimientos
  readonly expirations: ExpirationItem[] = [
    {
      id: 'exp-1',
      title: 'Contrato Obra y Servicio',
      daysRemaining: '6 días restantes',
      remainingDaysCount: 6,
      person: 'Alejandro Ruiz · Frontend Dev',
      date: '31 Oct 2024',
      progressPercent: 92,
      colorType: 'error'
    },
    {
      id: 'exp-2',
      title: 'Visado de Trabajo (UE Blue Card)',
      daysRemaining: '14 días restantes',
      remainingDaysCount: 14,
      person: 'Kavita Patel · AI Engineer',
      date: '08 Nov 2024',
      progressPercent: 78,
      colorType: 'tertiary'
    },
    {
      id: 'exp-3',
      title: 'Reconocimiento Médico Anual',
      daysRemaining: '22 días restantes',
      remainingDaysCount: 22,
      person: 'Planta Operativa (84 empleados)',
      date: '16 Nov 2024',
      progressPercent: 58,
      colorType: 'primary'
    },
    {
      id: 'exp-4',
      title: 'Período de Prueba (6 Meses)',
      daysRemaining: '28 días restantes',
      remainingDaysCount: 28,
      person: 'Daniela Gómez · Payroll Analyst',
      date: '22 Nov 2024',
      progressPercent: 45,
      colorType: 'secondary'
    }
  ];

  readonly dashboardToast = signal<string | null>(null);

  filteredRequests() {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.requests();
    return this.requests().filter(r => r.category === cat);
  }

  setCategory(cat: 'all' | 'vacations' | 'raises' | 'expenses'): void {
    this.selectedCategory.set(cat);
  }

  approveRequest(id: string): void {
    const req = this.requests().find(r => r.id === id);
    this.requests.update(list => list.filter(item => item.id !== id));
    this.showToast(`Solicitud aprobada: ${req?.name || ''} - ${req?.requestType || ''}`);
  }

  rejectRequest(id: string): void {
    const req = this.requests().find(r => r.id === id);
    this.requests.update(list => list.filter(item => item.id !== id));
    this.showToast(`Solicitud rechazada: ${req?.name || ''}`);
  }

  resolveExpiration(exp: ExpirationItem): void {
    this.showToast(`Expediente gestionado para ${exp.person} (${exp.title}). Recordatorio actualizado.`);
  }

  downloadExecutiveReport(): void {
    const reportData = {
      empresa: "NexusHR Enterprise Cloud",
      periodo: "Octubre 2024",
      totalEmpleados: 1428,
      costoNominaMensual: 3842500,
      solicitudesPendientes: this.requests().length,
      solicitudes: this.requests(),
      vencimientos: this.expirations,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_ejecutivo_nexushr_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.showToast('Descarga completada: reporte ejecutivo descargado correctamente.');
  }

  showToast(msg: string): void {
    this.dashboardToast.set(msg);
    setTimeout(() => this.dashboardToast.set(null), 3500);
  }
}

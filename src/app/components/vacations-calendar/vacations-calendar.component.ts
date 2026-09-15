import { Component, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CalendarVacationRequest {
  id: string;
  name: string;
  role: string;
  avatar: string;
  type: string;
  typeClass: 'vacations' | 'personal';
  dates: string;
  daysText: string;
}

@Component({
  selector: 'app-vacations-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vacations-calendar.component.html',
  styleUrl: './vacations-calendar.component.css'
})
export class VacationsCalendarComponent {
  @Output() onRequestVacation = new EventEmitter<void>();

  readonly activeViewMode = signal<'month' | 'week' | 'gantt'>('month');
  readonly selectedDepartment = signal<string>('Todos');
  readonly selectedSede = signal<string>('Madrid');
  readonly toastMessage = signal<string | null>(null);
  readonly showRequestModal = signal<boolean>(false);

  // Navegación de meses
  readonly monthsList = ['Septiembre 2024', 'Octubre 2024', 'Noviembre 2024', 'Diciembre 2024', 'Enero 2025'];
  readonly currentMonthIndex = signal<number>(1); // Octubre 2024
  readonly currentMonthText = computed(() => this.monthsList[this.currentMonthIndex()]);

  // Formulario Solicitud
  reqEmpName: string = '';
  reqRole: string = '';
  reqType: string = 'Vacaciones';
  reqDates: string = '';
  reqDays: number = 5;

  readonly recentRequests = signal<CalendarVacationRequest[]>([
    {
      id: 'req-v1',
      name: 'Sofía Garrido',
      role: 'Frontend Lead · Tech',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfiPOLjtMrM0sT8H1cHbv4BKzPUDePtth21yEiCPekPf-YIg1DR0aNIEQQqzvl1V-31FsBlFsFy5qu35MFygY9miHxOAokIlbWbrEM__-ywq2nl72oNojwAuqCQpoU_WUNciTgMC1cf_TAUXeLPUGhbjWGjeMBhTMQDwHE1odbvykXG-0epl18XEcR3mDLUwLzDPVyxSfF3aCwYsiY0E9vs9L0UeYNqdfVU4YTnR4of65B8q4IH4w8',
      type: 'Vacaciones',
      typeClass: 'vacations',
      dates: '04 Nov - 08 Nov',
      daysText: '5 días laborables'
    },
    {
      id: 'req-v2',
      name: 'Marc Costa',
      role: 'Ops Specialist · Logística',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTRipPSSePR_c-87taJrmRtGQJ5xxknVHjZjPfBURzE9uUCydObD8By1JB5VkJHzw94GHjNFzxpSLLyEhZQ7QoeIpfazar72AHaH71Jqo_QMjtIc3uySmvLWWA3j1g_lg1mZfOt1ZMcisi46yaPwkyKdM9Kjkz_eK2_tVUeHZVGRzsHi_vPOk2cVD8Oq1D2iNLkwjvKfJ9wKypF0_NLT4pzc52fvacreIBaoYyAO1B1KjBiA1VCaTb',
      type: 'Asuntos Propios',
      typeClass: 'personal',
      dates: '31 Oct',
      daysText: '1 día laborable'
    },
    {
      id: 'req-v3',
      name: 'Lucía Méndez',
      role: 'Key Account · Ventas',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvXG65FFx51DSOYXXcp6H5Gt8Fl0CNz6THn5c1x7Vi3sMfIHaGgXZtrRfAcR-Yywc4jBF9kb__OE0QfndJUFRmkPHNgFwVfEXe8kpitWHoQfI8fuVwlMmwbN_qmKTCodY-wAz4y_xnubQpcWri5ruobIcZiomkY23qTif5PmWFle381Xyts93kPB07WzhKge04t1rGx9z9ogJx8Eji1tzJr41D-k5_-DwqNuXzQwYzCBKSJ6WGJPSk',
      type: 'Vacaciones',
      typeClass: 'vacations',
      dates: '14 Nov - 15 Nov',
      daysText: '2 días laborables'
    }
  ]);

  prevMonth(): void {
    if (this.currentMonthIndex() > 0) {
      this.currentMonthIndex.update(i => i - 1);
      this.showToast(`Visualizando calendario: ${this.currentMonthText()}`);
    }
  }

  nextMonth(): void {
    if (this.currentMonthIndex() < this.monthsList.length - 1) {
      this.currentMonthIndex.update(i => i + 1);
      this.showToast(`Visualizando calendario: ${this.currentMonthText()}`);
    }
  }

  goToday(): void {
    this.currentMonthIndex.set(1); // Octubre 2024
    this.showToast('Calendario centrado en el mes actual.');
  }

  openRequestModal(): void {
    this.showRequestModal.set(true);
  }

  closeRequestModal(): void {
    this.showRequestModal.set(false);
  }

  submitVacationRequest(): void {
    if (!this.reqEmpName.trim()) {
      this.showToast('Por favor escribe el nombre del colaborador.');
      return;
    }

    const newReq: CalendarVacationRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      name: this.reqEmpName.trim(),
      role: this.reqRole.trim() || 'Especialista',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      type: this.reqType,
      typeClass: this.reqType === 'Vacaciones' ? 'vacations' : 'personal',
      dates: this.reqDates.trim() || '20 Nov - 25 Nov',
      daysText: `${this.reqDays || 5} días laborables`
    };

    this.recentRequests.update(list => [newReq, ...list]);
    this.closeRequestModal();
    this.showToast(`Solicitud de ${newReq.name} enviada al responsable de área para su aprobación.`);

    // Reset
    this.reqEmpName = '';
    this.reqRole = '';
    this.reqDates = '';
  }

  approve(id: string): void {
    const req = this.recentRequests().find(r => r.id === id);
    this.recentRequests.update(list => list.filter(item => item.id !== id));
    this.showToast(`Solicitud de ${req?.name || ''} aprobada. Saldo de vacaciones actualizado.`);
  }

  reject(id: string): void {
    const req = this.recentRequests().find(r => r.id === id);
    this.recentRequests.update(list => list.filter(item => item.id !== id));
    this.showToast(`Solicitud de ${req?.name || ''} denegada.`);
  }

  exportCalendar(): void {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Colaborador,Rol,Tipo Ausencia,Fechas,Dias\n" +
      this.recentRequests().map(r => `"${r.name}","${r.role}","${r.type}","${r.dates}","${r.daysText}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `calendario_ausencias_${this.currentMonthText().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Descarga completada: calendario de ausencias exportado.');
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}

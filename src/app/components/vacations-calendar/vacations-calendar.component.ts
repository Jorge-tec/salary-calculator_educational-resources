import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './vacations-calendar.component.html',
  styleUrl: './vacations-calendar.component.css'
})
export class VacationsCalendarComponent {
  @Output() onRequestVacation = new EventEmitter<void>();

  readonly activeViewMode = signal<'month' | 'week' | 'gantt'>('month');
  readonly selectedDepartment = signal<string>('Todos');
  readonly selectedSede = signal<string>('Madrid');

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

  approve(id: string): void {
    this.recentRequests.update(list => list.filter(item => item.id !== id));
  }

  reject(id: string): void {
    this.recentRequests.update(list => list.filter(item => item.id !== id));
  }
}

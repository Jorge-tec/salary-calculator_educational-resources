import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AttendanceRecord {
  id: string;
  name: string;
  empCode: string;
  role: string;
  avatar: string;
  location: string;
  isRemote?: boolean;
  checkIn: string;
  checkInSub?: string;
  lunchBreak: string;
  lunchAlert?: boolean;
  checkOut: string;
  effectiveHours: string;
  isHoursPrimary?: boolean;
  isHoursError?: boolean;
  balance: string;
  balanceType: 'pos' | 'neg' | 'neutral';
  overtimeHours: string;
  statusText: string;
  statusType: 'ok' | 'overtime' | 'exceeded' | 'compensable' | 'missing';
  selected?: boolean;
}

export interface OvertimeRequest {
  id: string;
  name: string;
  initials: string;
  department: string;
  icon: string;
  reason: string;
  extraHoursText: string;
  amount: number;
  amountText: string;
  tariffLabel: string;
  status: 'pending' | 'approved' | 'compensated';
}

@Component({
  selector: 'app-time-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-attendance.component.html',
  styleUrl: './time-attendance.component.css'
})
export class TimeAttendanceComponent {
  @Output() onOpenCalculator = new EventEmitter<void>();
  @Output() onOpenPayroll = new EventEmitter<void>();

  readonly toastMessage = signal<string | null>(null);
  readonly selectedDateText = signal<string>('Jueves, 24 de Octubre 2024');
  readonly isManualRegularizationModalOpen = signal<boolean>(false);

  // Filtros
  searchQuery: string = '';
  selectedDept: string = 'all';
  selectedShift: string = 'all';
  selectedStatus: string = 'all';
  selectAllRows: boolean = false;

  // Modal regularización rápida (inicia limpio)
  manualEmpName: string = '';
  manualDate: string = '2024-10-24';
  manualCheckIn: string = '';
  manualCheckOut: string = '';
  manualReason: string = '';

  // Fichaje en vivo Elena Morales
  readonly isCheckedIn = signal<boolean>(true);
  readonly currentPunchTime = signal<string>('08:58');
  readonly punchStatusText = signal<string>('Jornada Iniciada');

  toggleUserPunch(): void {
    if (this.isCheckedIn()) {
      const now = new Date();
      const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      this.isCheckedIn.set(false);
      this.punchStatusText.set('Jornada Finalizada (' + timeStr + ')');
      this.showToast(`Fichaje de salida registrado a las ${timeStr}. Jornada computada correctamente.`);
    } else {
      const now = new Date();
      const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      this.isCheckedIn.set(true);
      this.currentPunchTime.set(timeStr);
      this.punchStatusText.set('Jornada Iniciada (' + timeStr + ')');
      this.showToast(`Fichaje de entrada registrado a las ${timeStr}. Sesión activa.`);
    }
  }

  // Datos principales de la tabla de fichajes
  readonly records = signal<AttendanceRecord[]>([
    {
      id: 'REC-001',
      name: 'David Ortiz Morales',
      empCode: 'EMP-0492',
      role: 'Tech / DevOps',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      location: 'Sede Madrid - Planta 3',
      checkIn: '08:58',
      lunchBreak: '45m',
      checkOut: '18:02',
      effectiveHours: '8h 19m',
      balance: '+19m',
      balanceType: 'pos',
      overtimeHours: '0.3h',
      statusText: 'Correcto',
      statusType: 'ok',
      selected: false
    },
    {
      id: 'REC-002',
      name: 'Javier Aranda Soler',
      empCode: 'EMP-0188',
      role: 'Logística Hub Getafe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      location: 'Centro Logístico Getafe',
      checkIn: '07:30',
      lunchBreak: '30m',
      checkOut: '17:00',
      effectiveHours: '9h 00m',
      isHoursPrimary: true,
      balance: '+1h 00m',
      balanceType: 'pos',
      overtimeHours: '+1.0h',
      statusText: 'Horas Extra (+1.0h)',
      statusType: 'overtime',
      selected: false
    },
    {
      id: 'REC-003',
      name: 'Laura Peña Valdés',
      empCode: 'EMP-0821',
      role: 'Atención al Cliente',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      location: 'Sede Madrid - Planta 1',
      checkIn: '09:05',
      checkInSub: '(+5m)',
      lunchBreak: '1h 15m',
      lunchAlert: true,
      checkOut: '--:--',
      effectiveHours: '5h 27m',
      balance: '-22m',
      balanceType: 'neg',
      overtimeHours: '0.0h',
      statusText: 'Pausa Excedida (+22m)',
      statusType: 'exceeded',
      selected: false
    },
    {
      id: 'REC-004',
      name: 'Marc Costa Ribas',
      empCode: 'EMP-0312',
      role: 'Operaciones Global',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      location: 'Sede Barcelona (22@)',
      checkIn: '08:00',
      lunchBreak: '1h 00m',
      checkOut: '16:30',
      effectiveHours: '7h 30m',
      balance: '-30m',
      balanceType: 'neutral',
      overtimeHours: '0.0h',
      statusText: 'Compensable (-30m)',
      statusType: 'compensable',
      selected: false
    },
    {
      id: 'REC-005',
      name: 'Alejandro Ruiz Gil',
      empCode: 'EMP-0674',
      role: 'Tech / Frontend',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      location: 'Remoto IP Auditada',
      isRemote: true,
      checkIn: '09:12',
      lunchBreak: '50m',
      checkOut: '18:15',
      effectiveHours: '8h 13m',
      balance: '+13m',
      balanceType: 'pos',
      overtimeHours: '0.2h',
      statusText: 'Correcto (GPS OK)',
      statusType: 'ok',
      selected: false
    },
    {
      id: 'REC-006',
      name: 'Marta Solís Bermejo',
      empCode: 'EMP-0205',
      role: 'Administración Legal',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      location: 'Sede Madrid - Planta 4',
      checkIn: '--:--',
      lunchBreak: '--:--',
      checkOut: '--:--',
      effectiveHours: '0h 00m',
      isHoursError: true,
      balance: '-8h 00m',
      balanceType: 'neg',
      overtimeHours: '0.0h',
      statusText: 'Sin Registro (Aviso Enviado)',
      statusType: 'missing',
      selected: false
    }
  ]);

  // Solicitudes de Horas Extraordinarias Pendientes
  readonly overtimeRequests = signal<OvertimeRequest[]>([
    {
      id: 'OT-01',
      name: 'Javier Aranda Soler',
      initials: 'JA',
      department: 'Logística',
      icon: 'inventory_2',
      reason: 'Inventario general de almacén trimestral (+1.0h efectivas)',
      extraHoursText: '+1.0h',
      amount: 28.50,
      amountText: '28,50 €',
      tariffLabel: 'DEVENGO BRUTO',
      status: 'pending'
    },
    {
      id: 'OT-02',
      name: 'Sergio Ramos Cordero',
      initials: 'SR',
      department: 'Infraestructura IT',
      icon: 'dns',
      reason: 'Cierre trimestral y migración cloud de servidores (+3.5h nocturnas)',
      extraHoursText: '+3.5h',
      amount: 118.75,
      amountText: '118,75 €',
      tariffLabel: 'PLUS NOCTURNIDAD INC.',
      status: 'pending'
    },
    {
      id: 'OT-03',
      name: 'Carmen Lozano Gil',
      initials: 'CL',
      department: 'Customer Success',
      icon: 'headset_mic',
      reason: 'Guardia técnica fin de semana incidentes LATAM (+4.0h festivo)',
      extraHoursText: '+4.0h',
      amount: 142.00,
      amountText: '142,00 €',
      tariffLabel: 'TARIFA FESTIVO X1.75',
      status: 'pending'
    },
    {
      id: 'OT-04',
      name: 'Pablo Rivas Moreno',
      initials: 'PR',
      department: 'Logística & Expediciones',
      icon: 'local_shipping',
      reason: 'Carga urgente transportista internacional (+1.5h)',
      extraHoursText: '+1.5h',
      amount: 42.75,
      amountText: '42,75 €',
      tariffLabel: 'DEVENGO BRUTO',
      status: 'pending'
    }
  ]);

  // Registros filtrados
  readonly filteredRecords = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const dept = this.selectedDept;
    const status = this.selectedStatus;

    return this.records().filter(r => {
      // Búsqueda
      const matchesSearch = !q || 
        r.name.toLowerCase().includes(q) || 
        r.empCode.toLowerCase().includes(q) || 
        r.role.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Estado
      if (status !== 'all') {
        if (status === 'ok' && r.statusType !== 'ok') return false;
        if (status === 'overtime' && r.statusType !== 'overtime') return false;
        if (status === 'anomaly' && (r.statusType !== 'exceeded' && r.statusType !== 'missing')) return false;
        if (status === 'missing' && r.statusType !== 'missing') return false;
      }

      // Depto
      if (dept !== 'all') {
        if (dept === 'tech' && !r.role.includes('Tech')) return false;
        if (dept === 'logistics' && !r.role.includes('Logística')) return false;
        if (dept === 'support' && !r.role.includes('Atención')) return false;
        if (dept === 'ops' && !r.role.includes('Operaciones') && !r.role.includes('Legal')) return false;
      }

      return true;
    });
  });

  // Contador de pendientes de horas extra
  readonly pendingOvertimeCount = computed(() => {
    return this.overtimeRequests().filter(r => r.status === 'pending').length;
  });

  // Métodos de interacción
  toggleSelectAll(): void {
    this.selectAllRows = !this.selectAllRows;
    this.records.update(list => list.map(item => ({ ...item, selected: this.selectAllRows })));
  }

  approveOvertime(req: OvertimeRequest): void {
    this.overtimeRequests.update(list => 
      list.map(r => r.id === req.id ? { ...r, status: 'approved' } : r)
    );
    this.showToast(`Horas extraordinarias de ${req.name} (${req.amountText}) aprobadas para devengo en nómina.`);
  }

  compensateRest(req: OvertimeRequest): void {
    this.overtimeRequests.update(list => 
      list.map(r => r.id === req.id ? { ...r, status: 'compensated' } : r)
    );
    this.showToast(`Se ha registrado descanso compensatorio equivalente para ${req.name}.`);
  }

  exportOfficialPdf(): void {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Registro Oficial de Jornada - RD-Ley 8/2019 - ITSS\n" +
      "ID,Empleado,Codigo,Entrada,Pausa,Salida,Efectivas,Balance,Horas Extras,Estado\n" +
      this.records().map(r => `"${r.id}","${r.name}","${r.empCode}","${r.checkIn}","${r.lunchBreak}","${r.checkOut}","${r.effectiveHours}","${r.balance}","${r.overtimeHours}","${r.statusText}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "registro_oficial_jornada_itss_20241024.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Descarga completada: Registro_Laboral_Octubre_2024_SHA256 (Compatible ITSS/Excel)');
  }

  openManualRegularization(): void {
    this.isManualRegularizationModalOpen.set(true);
  }

  closeManualRegularization(): void {
    this.isManualRegularizationModalOpen.set(false);
  }

  saveManualRegularization(): void {
    const targetEmp = this.manualEmpName.trim() || 'Marta Solís Bermejo';
    const existingIndex = this.records().findIndex(r => r.name.toLowerCase().includes(targetEmp.toLowerCase()) || r.empCode === 'EMP-0205');

    if (existingIndex >= 0) {
      this.records.update(list => list.map((item, idx) => {
        if (idx === existingIndex) {
          return {
            ...item,
            checkIn: this.manualCheckIn || '09:00',
            lunchBreak: '1h 00m',
            checkOut: this.manualCheckOut || '18:00',
            effectiveHours: '8h 00m',
            isHoursError: false,
            balance: '0m',
            balanceType: 'neutral',
            statusText: 'Regularizado Manualmente',
            statusType: 'ok'
          };
        }
        return item;
      }));
    } else {
      const newRec: AttendanceRecord = {
        id: `REC-${Date.now().toString().slice(-4)}`,
        name: targetEmp,
        empCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'Colaborador General',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        location: 'Sede Madrid',
        checkIn: this.manualCheckIn || '09:00',
        lunchBreak: '1h 00m',
        checkOut: this.manualCheckOut || '18:00',
        effectiveHours: '8h 00m',
        balance: '0m',
        balanceType: 'neutral',
        overtimeHours: '0.0h',
        statusText: 'Fichaje Manual Registrado',
        statusType: 'ok',
        selected: false
      };
      this.records.update(list => [newRec, ...list]);
    }

    this.closeManualRegularization();
    this.showToast(`Fichaje manual registrado para ${targetEmp} con firma de conformidad.`);

    // Limpiar inputs
    this.manualEmpName = '';
    this.manualCheckIn = '';
    this.manualCheckOut = '';
    this.manualReason = '';
  }

  validateRow(record: AttendanceRecord): void {
    this.records.update(list => list.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          statusText: 'Horas Extra Validadas',
          statusType: 'ok'
        };
      }
      return r;
    }));
    this.showToast(`Horas extraordinarias de ${record.name} validadas.`);
  }

  correctRow(record: AttendanceRecord): void {
    this.records.update(list => list.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          lunchAlert: false,
          lunchBreak: '1h 00m',
          balance: '-7m',
          statusText: 'Pausa Ajustada',
          statusType: 'ok'
        };
      }
      return r;
    }));
    this.showToast(`Incidencia corregida para ${record.name}.`);
  }

  imputeRow(record: AttendanceRecord): void {
    this.manualEmpName = record.name;
    this.openManualRegularization();
  }

  syncWithPayroll(): void {
    this.showToast('Sincronizando 342.5h extraordinarias aprobadas con el ciclo de nómina de Octubre 2024...');
    setTimeout(() => {
      this.showToast('342.5 horas exportadas exitosamente a la pre-nómina global.');
    }, 1500);
  }

  simulateOvertimeLiquidation(): void {
    this.onOpenCalculator.emit();
  }

  downloadItssCertificate(): void {
    this.showToast('Descargando Certificado Oficial de Custodia Digital ITSS (4 años inalterabilidad)...');
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }
}

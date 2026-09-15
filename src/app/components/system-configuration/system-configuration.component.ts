import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CorporateLocation {
  id: string;
  code: string;
  name: string;
  tag: string;
  tagClass: string;
  status: string;
  statusClass: string;
  cif: string;
  ccc: string;
  activeStaff: string;
  workCalendar: string;
  fiscalAddress: string;
  extraInfo?: string;
}

export interface TenantAdmin {
  id: string;
  name: string;
  email: string;
  isCurrentUser?: boolean;
  avatar?: string;
  initials?: string;
  initialsClass?: string;
  role: string;
}

@Component({
  selector: 'app-system-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-configuration.component.html',
  styleUrl: './system-configuration.component.css'
})
export class SystemConfigurationComponent {
  @Output() onOpenCalculator = new EventEmitter<void>();

  readonly activeTab = signal<string>('sedes');
  readonly isSaving = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);
  readonly isAuditLogModalOpen = signal<boolean>(false);
  readonly isNewLocationModalOpen = signal<boolean>(false);
  readonly isInviteAdminModalOpen = signal<boolean>(false);

  // Settings state
  courtesyMargin: string = '15 minutos de flexibilidad';
  mealRounding: string = 'Bloque mínimo 30 min (Convenio)';
  geofenceEnabled: boolean = true;
  biometricsEnabled: boolean = true;
  autoOvertimeEnabled: boolean = true;
  mfaEnforced: boolean = true;

  // New location form state
  newLocCode: string = 'VAL';
  newLocName: string = 'Sede Valencia (Hub Levante)';
  newLocCcc: string = '46 1928374619';
  newLocStaff: string = '85 colaboradores';
  newLocCalendar: string = 'Comunidad Valenciana 2025';
  newLocAddress: string = 'Calle Colón 45, Valencia';

  // Invite admin form state
  inviteEmail: string = '';
  inviteRole: string = 'Payroll Admin';

  // Locations list
  readonly locations = signal<CorporateLocation[]>([
    {
      id: 'LOC-01',
      code: 'MAD',
      name: 'Sede Madrid (Principal)',
      tag: 'Headquarters',
      tagClass: 'bg-primary-light text-primary',
      status: 'Operativo',
      statusClass: 'bg-green-light text-tertiary',
      cif: 'B-88401923',
      ccc: '28 1092837482',
      activeStaff: '840 colaboradores',
      workCalendar: 'Comunidad de Madrid 2025',
      fiscalAddress: 'Castellana 110, Madrid'
    },
    {
      id: 'LOC-02',
      code: 'BCN',
      name: 'Sede Barcelona (Tech Hub)',
      tag: 'I+D+i',
      tagClass: 'bg-slate-200 text-slate-800',
      status: 'Operativo',
      statusClass: 'bg-green-light text-tertiary',
      cif: 'B-88401923',
      ccc: '08 4492019381',
      activeStaff: '410 colaboradores',
      workCalendar: 'Catalunya / BCN 2025',
      fiscalAddress: 'Av. Diagonal 640, BCN'
    },
    {
      id: 'LOC-03',
      code: 'REM',
      name: 'Hub Remoto España & Teletrabajo',
      tag: 'Ley 10/2021',
      tagClass: 'bg-blue-100 text-slate-800',
      status: 'Multi-Sede',
      statusClass: 'bg-green-light text-tertiary',
      cif: 'B-88401923',
      ccc: '28 8839201948',
      activeStaff: '178 colaboradores',
      workCalendar: 'Según Municipio Domicilio',
      fiscalAddress: '45,00 € / mes nómina',
      extraInfo: 'Compensación Gastos'
    }
  ]);

  // Tenant admins list
  readonly admins = signal<TenantAdmin[]>([
    {
      id: 'ADM-01',
      name: 'Elena Morales',
      email: 'elena.morales@nexushr.es',
      isCurrentUser: true,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnFEWz0sp1ws92wAlDNV0tDFzZZ23pCeSvGHNXzHJOF0kqrTMKrzB2Vm9abxLXG8ucYi2HAbVMqKudG9yx1NmSYlYdAQPNF6xct0r6FiTWo134dmHD9NTYmK6Q04of1yHLlrhYfR0Ep2fVsbqyF8EL_QMevSv9dg9qHnw2q90_aOAoVXythbsTH-uKqNPIzkyXcmAb-0B__2pCLDP_pnXP3rQULM5j6LxTZOp5dcYHrxwufKpuhO2y',
      role: 'Super Admin'
    },
    {
      id: 'ADM-02',
      name: 'Marcos Vance',
      email: 'marcos.vance@nexushr.es',
      initials: 'MV',
      initialsClass: 'bg-slate-200 text-slate-800',
      role: 'Payroll Admin'
    },
    {
      id: 'ADM-03',
      name: 'Sofía Arispe',
      email: 'sofia.arispe@nexushr.es',
      initials: 'SA',
      initialsClass: 'bg-blue-100 text-blue-900',
      role: 'Legal & Compliance'
    }
  ]);

  // Methods
  saveGlobalParameters(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.showToast('Parámetros corporativos sincronizados. Los cambios han sido propagados a todos los centros de trabajo.');
    }, 900);
  }

  runGeneralTest(): void {
    this.showToast('Ejecutando test general de conectividad con SILTRA, AEAT SII, SEPA ISO 20022 y Okta SSO...');
    setTimeout(() => {
      this.showToast('✔ Todos los conectores gubernamentales y bancarios responden con latencia < 45ms.');
    }, 1400);
  }

  openAuditLog(): void {
    this.isAuditLogModalOpen.set(true);
  }

  closeAuditLog(): void {
    this.isAuditLogModalOpen.set(false);
  }

  openNewLocation(): void {
    this.isNewLocationModalOpen.set(true);
  }

  closeNewLocation(): void {
    this.isNewLocationModalOpen.set(false);
  }

  saveNewLocation(): void {
    const newLoc: CorporateLocation = {
      id: 'LOC-' + (this.locations().length + 1).toString().padStart(2, '0'),
      code: this.newLocCode,
      name: this.newLocName,
      tag: 'Regional',
      tagClass: 'bg-primary-light text-primary',
      status: 'Operativo',
      statusClass: 'bg-green-light text-tertiary',
      cif: 'B-88401923',
      ccc: this.newLocCcc,
      activeStaff: this.newLocStaff,
      workCalendar: this.newLocCalendar,
      fiscalAddress: this.newLocAddress
    };
    this.locations.update(list => [...list, newLoc]);
    this.closeNewLocation();
    this.showToast(`Nueva sede "${newLoc.name}" añadida con CCC ${newLoc.ccc}.`);
  }

  openInviteAdmin(): void {
    this.isInviteAdminModalOpen.set(true);
  }

  closeInviteAdmin(): void {
    this.isInviteAdminModalOpen.set(false);
  }

  sendAdminInvite(): void {
    if (!this.inviteEmail.trim()) {
      this.showToast('Por favor introduce un correo corporativo válido.');
      return;
    }
    const namePart = this.inviteEmail.split('@')[0].replace('.', ' ');
    const initials = namePart.substring(0, 2).toUpperCase();
    
    this.admins.update(list => [
      ...list,
      {
        id: 'ADM-' + (list.length + 1).toString().padStart(2, '0'),
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        email: this.inviteEmail,
        initials: initials,
        initialsClass: 'bg-slate-200 text-slate-800',
        role: this.inviteRole
      }
    ]);
    const sentTo = this.inviteEmail;
    this.inviteEmail = '';
    this.closeInviteAdmin();
    this.showToast(`Invitación enviada a ${sentTo} con rol ${this.inviteRole}.`);
  }

  removeAdmin(admin: TenantAdmin): void {
    if (admin.isCurrentUser) return;
    this.admins.update(list => list.filter(a => a.id !== admin.id));
    this.showToast(`Privilegios revocados para ${admin.name}.`);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4500);
  }
}

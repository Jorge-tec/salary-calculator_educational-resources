import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DirectoryEmployee {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  deptKey: string;
  location: string;
  locationKey: string;
  contractType: string;
  contractKey: string;
  annualSalary: number;
  baseSalary: number;
  complementSalary: number;
  seniority: string;
  seniorityText: string;
  startDate: string;
  status: 'Activo' | 'Onboarding' | 'Baja Temp.' | 'Excedencia';
  statusKey: string;
  avatarUrl: string;
  initials?: string;
  email: string;
  phone: string;
  managerName: string;
  managerRole: string;
  managerAvatar: string;
  teamCount: number;
  costCenter: string;
  collectiveAgreement: string;
  salaryBand: string;
  nextReview: string;
}

@Component({
  selector: 'app-employee-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-directory.component.html',
  styleUrl: './employee-directory.component.css'
})
export class EmployeeDirectoryComponent {
  @Output() onSimulateLiquidation = new EventEmitter<DirectoryEmployee>();

  // Filter signals
  readonly activeTab = signal<'todos' | 'activos' | 'onboarding' | 'bajas'>('todos');
  readonly selectedEmployeeId = signal<string>('EMP-8942');
  readonly currentDrawerTab = signal<'general' | 'compensation' | 'contracts' | 'performance' | 'history'>('general');
  readonly toastMessage = signal<string | null>(null);
  readonly showModalNewEmployee = signal<boolean>(false);

  // Search & Select Filters (Start clean without hardcoded sample filters)
  searchQuery: string = '';
  selectedDept: string = '';
  selectedLocation: string = '';
  selectedContract: string = '';
  selectedStatus: string = '';

  // Formulario Nuevo Empleado
  newEmpName: string = '';
  newEmpRole: string = '';
  newEmpEmail: string = '';
  newEmpDept: string = 'Tecnología';
  newEmpLocation: string = 'Sede Madrid';
  newEmpSalary: number = 42000;
  newEmpContract: string = 'Indefinido 40h';

  // Master Employee List as reactive signal
  readonly employees = signal<DirectoryEmployee[]>([
    {
      id: 'EMP-8942',
      code: '#EMP-8942',
      name: 'Sofía Garrido',
      role: 'Frontend Lead & Arch',
      department: 'Tecnología',
      deptKey: 'tech',
      location: 'Sede Madrid',
      locationKey: 'madrid',
      contractType: 'Indefinido 40h',
      contractKey: 'indef',
      annualSalary: 68000,
      baseSalary: 62000,
      complementSalary: 6000,
      seniority: '3a 4m',
      seniorityText: '3 años, 4 meses',
      startDate: '15 Jun 2021',
      status: 'Activo',
      statusKey: 'act',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByFACmd6PTtuIp1XGA355TD4zvsQkKhjMlUU8YkS-ROtJcesIIYulyVPCYySn7dg_y4NR9vYeIwacdg4GYFN2bgNDq3SEXfttkDvWrQfHP8cm9Av6SS7i_RjPphWDkVCFjVVTsIJrJJdK-QanpQvnmyEmKltSSnfRw11vS5u4oMsq8MmC0PXikv3Gtaj2lHhkRiFfWthD3CkTHvyMVvk9jXwoAK5eHeNMY462RQUpfB4pLoLW8cxp0',
      email: 'sofia.garrido@nexushr.corp',
      phone: '+34 912 884 219',
      managerName: 'David Ortiz',
      managerRole: 'VP of Engineering (Reporte Directo)',
      managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI5DMVF8aUgDsl9Lt2LE2xKVKmSCysBse2rl7z0oY_LMXZS0h253kpOeA836g_iSS0jQ_F7eSZJGWM4GK4AnjLbOyiMvQXVxqCpTIm8xKO5FoDGJ7k8WKedMND7LwU8h4zVcPfN7E4OjolayqTlzU2hnD6lSpg8705WUvkSXAwHAIt-y2kEx9eonwyL1gCN7DN7dLc3g8WaS4mLwiSe14f9oSz_MH2W3CA8R0CGGpfEJ5eROd51ymj',
      teamCount: 6,
      costCenter: 'CC-041',
      collectiveAgreement: 'Metal & Servicios Tecnológicos (Grupo Prof. 1)',
      salaryBand: '94% P75',
      nextReview: 'Noviembre 2024'
    },
    {
      id: 'EMP-7621',
      code: '#EMP-7621',
      name: 'Carlos Benítez',
      role: 'Sr. Growth Manager',
      department: 'Ventas & Mkt',
      deptKey: 'sales',
      location: 'Barcelona Tech',
      locationKey: 'bcn',
      contractType: 'Indefinido 40h',
      contractKey: 'indef',
      annualSalary: 54500,
      baseSalary: 48500,
      complementSalary: 6000,
      seniority: '2a 1m',
      seniorityText: '2 años, 1 mes',
      startDate: '10 Sep 2022',
      status: 'Activo',
      statusKey: 'act',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZg0GLTMeN4IQXqhvUMH_4Fd_lyv1-Qi3HYO_a2s3Ou0CUlgZq3WFZvese-TQ2lh0TnN-lyOzuxX-tjyJ6oWiY_6aL0-4l0mYbVgwsFTCFBIPtVgcO2jbKZAlD2XH7uMz1gP3RF-zToC_wCAyJ6Ea4vhPsNKT3-M7B6dgFeobZf83Mm4wCv3N05MAX_Aw60ys0yk2mqG48T-Brf19Y8DiHnUWsjZEspjh5dPgU-pbuYnYXZPgO08SQ',
      email: 'carlos.benitez@nexushr.corp',
      phone: '+34 934 112 901',
      managerName: 'Laura Menéndez',
      managerRole: 'Chief Commercial Officer',
      managerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      teamCount: 4,
      costCenter: 'CC-019',
      collectiveAgreement: 'Comercio & Marketing Digital',
      salaryBand: '88% P50',
      nextReview: 'Enero 2025'
    },
    {
      id: 'EMP-6109',
      code: '#EMP-6109',
      name: 'Martina Soria',
      role: 'Principal Data Engineer',
      department: 'Tecnología',
      deptKey: 'tech',
      location: 'Remoto (Valencia)',
      locationKey: 'remoto',
      contractType: 'Indefinido 40h',
      contractKey: 'indef',
      annualSalary: 74000,
      baseSalary: 68000,
      complementSalary: 6000,
      seniority: '4a 8m',
      seniorityText: '4 años, 8 meses',
      startDate: '02 Feb 2020',
      status: 'Activo',
      statusKey: 'act',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzYR6eR9EsxulUbf1WFonFd17c7Q7blGb0gsq5WjMqQLN0oPiFhZYZgA8fmhqStGSwLaUI22GWD9TiuGVD2mkTpWQoVx-DrOAK8XaYZrZ4kxvJBvaO_qSdnEGQ-m6bwZPPXP_07-WQgW9Jx6JqjLziqli7-mPJeUm8m40w-4CY7wqiOzsLu7pQK0rvf2AjbVvM4DplyR1_YULT2fP03KVmK59pvBfF4LeMB5DsSjzyPUkWTkqmf3z4',
      email: 'martina.soria@nexushr.corp',
      phone: '+34 963 881 240',
      managerName: 'David Ortiz',
      managerRole: 'VP of Engineering',
      managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI5DMVF8aUgDsl9Lt2LE2xKVKmSCysBse2rl7z0oY_LMXZS0h253kpOeA836g_iSS0jQ_F7eSZJGWM4GK4AnjLbOyiMvQXVxqCpTIm8xKO5FoDGJ7k8WKedMND7LwU8h4zVcPfN7E4OjolayqTlzU2hnD6lSpg8705WUvkSXAwHAIt-y2kEx9eonwyL1gCN7DN7dLc3g8WaS4mLwiSe14f9oSz_MH2W3CA8R0CGGpfEJ5eROd51ymj',
      teamCount: 3,
      costCenter: 'CC-041',
      collectiveAgreement: 'Metal & Servicios Tecnológicos',
      salaryBand: '97% P90',
      nextReview: 'Diciembre 2024'
    },
    {
      id: 'EMP-9022',
      code: '#EMP-9022',
      name: 'Javier Aranda',
      role: 'Logistics Supervisor',
      department: 'Operaciones',
      deptKey: 'ops',
      location: 'Sede Madrid',
      locationKey: 'madrid',
      contractType: 'Indefinido 40h',
      contractKey: 'indef',
      annualSalary: 36200,
      baseSalary: 33000,
      complementSalary: 3200,
      seniority: '1a 3m',
      seniorityText: '1 año, 3 meses',
      startDate: '12 Jul 2023',
      status: 'Activo',
      statusKey: 'act',
      avatarUrl: '',
      initials: 'JA',
      email: 'javier.aranda@nexushr.corp',
      phone: '+34 912 770 194',
      managerName: 'Rodrigo Sanz',
      managerRole: 'Director de Operaciones',
      managerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      teamCount: 8,
      costCenter: 'CC-022',
      collectiveAgreement: 'Logística & Transporte',
      salaryBand: '82% P50',
      nextReview: 'Marzo 2025'
    },
    {
      id: 'EMP-9184',
      code: '#EMP-9184',
      name: 'Lucía Méndez',
      role: 'CS & Support Specialist',
      department: 'Operaciones',
      deptKey: 'ops',
      location: 'Valencia Ops',
      locationKey: 'val',
      contractType: 'Temporal (Sust.)',
      contractKey: 'temp',
      annualSalary: 28000,
      baseSalary: 26000,
      complementSalary: 2000,
      seniority: '0a 6m',
      seniorityText: '0 años, 6 meses',
      startDate: '15 Mar 2024',
      status: 'Baja Temp.',
      statusKey: 'baja',
      avatarUrl: '',
      initials: 'LM',
      email: 'lucia.mendez@nexushr.corp',
      phone: '+34 963 119 502',
      managerName: 'Rodrigo Sanz',
      managerRole: 'Director de Operaciones',
      managerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      teamCount: 0,
      costCenter: 'CC-022',
      collectiveAgreement: 'Contact Center & Servicios',
      salaryBand: '75% P25',
      nextReview: 'Septiembre 2024'
    },
    {
      id: 'EMP-9540',
      code: '#EMP-9540',
      name: 'Alejandro Ruiz',
      role: 'Frontend Developer II',
      department: 'Tecnología',
      deptKey: 'tech',
      location: 'Sede Madrid',
      locationKey: 'madrid',
      contractType: 'Indefinido 40h',
      contractKey: 'indef',
      annualSalary: 42000,
      baseSalary: 38000,
      complementSalary: 4000,
      seniority: '1a 8m',
      seniorityText: '1 año, 8 meses',
      startDate: '20 Ene 2023',
      status: 'Activo',
      statusKey: 'act',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZdw7TAMSfr3x1fcRWm1DboXneiKCWSWjXDDwXKZI3_i71IdM1z5w3ezMlyCydJzY27PAQCZhFvB8b8az4U_iXboZPsoQbPFUrwhdHMYmI0khMZSxVbrtCyO8QbmQyWnAkuwWySMlcGQFbLMWzYFP-FOQwQV5iFfa9WnGgYn7weaz8asYAUOHRWzy0p5e3QG37e79I4l-5nsPQ_7xpUJaxwqjqsjROnqFRtns0ZRO4MheA_wEDGuTK',
      email: 'alejandro.ruiz@nexushr.corp',
      phone: '+34 912 405 889',
      managerName: 'Sofía Garrido',
      managerRole: 'Frontend Lead & Arch',
      managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByFACmd6PTtuIp1XGA355TD4zvsQkKhjMlUU8YkS-ROtJcesIIYulyVPCYySn7dg_y4NR9vYeIwacdg4GYFN2bgNDq3SEXfttkDvWrQfHP8cm9Av6SS7i_RjPphWDkVCFjVVTsIJrJJdK-QanpQvnmyEmKltSSnfRw11vS5u4oMsq8MmC0PXikv3Gtaj2lHhkRiFfWthD3CkTHvyMVvk9jXwoAK5eHeNMY462RQUpfB4pLoLW8cxp0',
      teamCount: 0,
      costCenter: 'CC-041',
      collectiveAgreement: 'Metal & Servicios Tecnológicos',
      salaryBand: '85% P50',
      nextReview: 'Febrero 2025'
    },
    {
      id: 'EMP-9981',
      code: '#EMP-9981',
      name: 'Kavita Patel',
      role: 'AI & ML Engineer',
      department: 'Tecnología',
      deptKey: 'tech',
      location: 'Barcelona Tech',
      locationKey: 'bcn',
      contractType: 'Indefinido 40h',
      contractKey: 'indef',
      annualSalary: 58000,
      baseSalary: 52000,
      complementSalary: 6000,
      seniority: '0a 1m',
      seniorityText: '0 años, 1 mes',
      startDate: '01 Oct 2024',
      status: 'Onboarding',
      statusKey: 'onb',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Xc8nKXaRUuavn7gXV3iCnOgqS7UXms9s58cCv0RJwe5TMY2Q1Cbq19BlVLlDNGqNwpRsB2IU4c9mOpjyTUrChWQJ-AT795d96CHeC7BjSKXhJUsh5xShHkPl90hd6Tl2YzW8ZkdN7A6jkfSAZUef_X76HlH7Xcz9idk9gdasUPTtTkr1CttuZwJSv0nYTrdTvmRWz8Op0ByKB2_1JLEOZK0pSX4plrwSlHKOTTgNUP0XHuXF3BVg',
      email: 'kavita.patel@nexushr.corp',
      phone: '+34 934 882 100',
      managerName: 'David Ortiz',
      managerRole: 'VP of Engineering',
      managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI5DMVF8aUgDsl9Lt2LE2xKVKmSCysBse2rl7z0oY_LMXZS0h253kpOeA836g_iSS0jQ_F7eSZJGWM4GK4AnjLbOyiMvQXVxqCpTIm8xKO5FoDGJ7k8WKedMND7LwU8h4zVcPfN7E4OjolayqTlzU2hnD6lSpg8705WUvkSXAwHAIt-y2kEx9eonwyL1gCN7DN7dLc3g8WaS4mLwiSe14f9oSz_MH2W3CA8R0CGGpfEJ5eROd51ymj',
      teamCount: 0,
      costCenter: 'CC-041',
      collectiveAgreement: 'Metal & Servicios Tecnológicos',
      salaryBand: '90% P75',
      nextReview: 'Octubre 2025'
    }
  ]);

  // Active selected employee computed
  readonly selectedEmployee = computed(() => {
    const id = this.selectedEmployeeId();
    return this.employees().find(e => e.id === id) || this.employees()[0];
  });

  // Filtered employees
  get filteredEmployees(): DirectoryEmployee[] {
    return this.employees().filter(emp => {
      // Tab filter
      const tab = this.activeTab();
      if (tab === 'activos' && emp.status !== 'Activo') return false;
      if (tab === 'onboarding' && emp.status !== 'Onboarding') return false;
      if (tab === 'bajas' && emp.status !== 'Baja Temp.' && emp.status !== 'Excedencia') return false;

      // Text search
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const match = emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          emp.code.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Department dropdown
      if (this.selectedDept && emp.deptKey !== this.selectedDept) {
        return false;
      }

      // Location dropdown
      if (this.selectedLocation && emp.locationKey !== this.selectedLocation) {
        return false;
      }

      // Contract dropdown
      if (this.selectedContract && emp.contractKey !== this.selectedContract) {
        return false;
      }

      // Status dropdown
      if (this.selectedStatus && emp.statusKey !== this.selectedStatus) {
        return false;
      }

      return true;
    });
  }

  selectEmployee(emp: DirectoryEmployee): void {
    this.selectedEmployeeId.set(emp.id);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDept = '';
    this.selectedLocation = '';
    this.selectedContract = '';
    this.selectedStatus = '';
    this.activeTab.set('todos');
  }

  addNewEmployee(): void {
    if (!this.newEmpName.trim()) {
      this.showToast('Por favor introduce el nombre completo del colaborador.');
      return;
    }
    const newIdNum = Math.floor(1000 + Math.random() * 9000);
    const newEmp: DirectoryEmployee = {
      id: `EMP-${newIdNum}`,
      code: `#EMP-${newIdNum}`,
      name: this.newEmpName.trim(),
      role: this.newEmpRole.trim() || 'Especialista',
      department: this.newEmpDept,
      deptKey: this.newEmpDept.toLowerCase().slice(0, 4),
      location: this.newEmpLocation,
      locationKey: this.newEmpLocation.toLowerCase().includes('barcelona') ? 'bcn' : (this.newEmpLocation.toLowerCase().includes('remoto') ? 'rem' : 'madrid'),
      contractType: this.newEmpContract,
      contractKey: 'indef',
      annualSalary: Number(this.newEmpSalary) || 42000,
      baseSalary: Math.round((Number(this.newEmpSalary) || 42000) * 0.9),
      complementSalary: Math.round((Number(this.newEmpSalary) || 42000) * 0.1),
      seniority: '0a 1m',
      seniorityText: 'Reciente incorporación',
      startDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Onboarding',
      statusKey: 'onb',
      avatarUrl: '',
      initials: this.newEmpName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(),
      email: this.newEmpEmail.trim() || `empleado${newIdNum}@nexushr.corp`,
      phone: '+34 912 ' + Math.floor(100000 + Math.random() * 900000),
      managerName: 'Elena Morales',
      managerRole: 'HR Operations Director',
      managerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnFEWz0sp1ws92wAlDNV0tDFzZZ23pCeSvGHNXzHJOF0kqrTMKrzB2Vm9abxLXG8ucYi2HAbVMqKudG9yx1NmSYlYdAQPNF6xct0r6FiTWo134dmHD9NTYmK6Q04of1yHLlrhYfR0Ep2fVsbqyF8EL_QMevSv9dg9qHnw2q90_aOAoVXythbsTH-uKqNPIzkyXcmAb-0B__2pCLDP_pnXP3rQULM5j6LxTZOp5dcYHrxwufKpuhO2y',
      teamCount: 0,
      costCenter: 'CC-041',
      collectiveAgreement: 'Convenio General NexusHR',
      salaryBand: '85% P50',
      nextReview: 'Diciembre 2025'
    };

    this.employees.update(list => [newEmp, ...list]);
    this.selectedEmployeeId.set(newEmp.id);
    this.showModalNewEmployee.set(false);
    this.showToast(`Colaborador ${newEmp.name} registrado exitosamente.`);

    // Limpiar inputs
    this.newEmpName = '';
    this.newEmpRole = '';
    this.newEmpEmail = '';
  }

  toggleEmployeeStatus(emp: DirectoryEmployee): void {
    const newStatus = emp.status === 'Activo' ? 'Baja Temp.' : 'Activo';
    this.employees.update(list => list.map(e => e.id === emp.id ? { ...e, status: newStatus, statusKey: newStatus === 'Activo' ? 'act' : 'baja' } : e));
    this.showToast(`Estado de ${emp.name} actualizado a: ${newStatus}`);
  }

  exportDirectory(): void {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Nombre,Cargo,Departamento,Sede,Contrato,Salario Anual,Estado\n" +
      this.employees().map(e => `"${e.code}","${e.name}","${e.role}","${e.department}","${e.location}","${e.contractType}",${e.annualSalary},"${e.status}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "directorio_personal_nexushr.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Descarga iniciada: directorio_personal_nexushr.csv (XLSX/CSV compatible)');
  }

  simulateLiquidationForEmployee(emp: DirectoryEmployee): void {
    this.onSimulateLiquidation.emit(emp);
  }

  downloadDocument(docName: string): void {
    this.showToast(`Descargando documento firmado: ${docName}`);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  }
}

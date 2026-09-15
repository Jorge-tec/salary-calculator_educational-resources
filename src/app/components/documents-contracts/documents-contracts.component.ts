import { Component, EventEmitter, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DocumentItem {
  id: string;
  expediente: string;
  filename: string;
  uploadDate: string;
  category: 'contratos' | 'nominas' | 'fiscales' | 'certificados' | 'cst';
  categoryLabel: string;
  employeeName: string;
  employeeDni: string;
  employeeCode: string;
  employeeAvatar: string;
  status: 'Completado (eIDAS)' | 'Pendiente Firma Empleado' | 'Esperando Rep. Legal' | 'Próximo a Vencer' | 'Borrador Preparado';
  statusType: 'completed' | 'pending_employee' | 'pending_legal' | 'expiring' | 'draft';
  fileTypeIcon: string;
  selected?: boolean;
}

@Component({
  selector: 'app-documents-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents-contracts.component.html',
  styleUrl: './documents-contracts.component.css'
})
export class DocumentsContractsComponent {
  @Output() onOpenCalculator = new EventEmitter<void>();
  @Output() onOpenSavedRecords = new EventEmitter<void>();

  // Filter signals
  readonly activeCategory = signal<'all' | 'contratos' | 'nominas' | 'fiscales' | 'certificados' | 'cst'>('all');
  readonly toastMessage = signal<string | null>(null);
  readonly showUploadModal = signal<boolean>(false);
  readonly showSignModal = signal<boolean>(false);
  readonly previewDoc = signal<DocumentItem | null>(null);

  // Search and Selectors
  searchQuery: string = '';
  selectedStatusFilter: string = '';
  selectedDeptFilter: string = '';
  selectedLocationFilter: string = '';
  selectAllChecked: boolean = false;

  // Formulario Subir/Generar Documento
  newDocFilename: string = '';
  newDocCategory: 'contratos' | 'nominas' | 'fiscales' | 'certificados' | 'cst' = 'contratos';
  newDocEmpName: string = '';
  newDocEmpDni: string = '';

  // Master Document List as reactive signal
  readonly documents = signal<DocumentItem[]>([
    {
      id: 'doc-1',
      expediente: 'EXP-2024-8891',
      filename: 'CTR_Indefinido_2024_0891.pdf',
      uploadDate: 'Subido 12 Oct 2024',
      category: 'contratos',
      categoryLabel: 'Contrato Indefinido',
      employeeName: 'Alejandro Ramos',
      employeeDni: '47291840J',
      employeeCode: 'EMP-0412',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBb76BKopU9jCK7seoymKao5OsWj_xYzPlCwbqG2egiKAG6KF9id86-JWx5pMT7i3jWit_017zYi0d4YpbOlDJZPLjA_t9f3z1ymRZb5fVexxue2CFOhfXb3SvIn1decvEbFe8TuEs3Rd2HFhbSdXw9ry400hhAdUB6lZWjK5m2OiI1gyWIED56XbicywT-gqohkCRKJEJZBrM-zW1pZIZSIUIfVNcxypwY2farSR_uO8uBpgOx4PB2',
      status: 'Completado (eIDAS)',
      statusType: 'completed',
      fileTypeIcon: 'picture_as_pdf',
      selected: false
    },
    {
      id: 'doc-2',
      expediente: 'EXP-2024-9104',
      filename: 'ANX_Teletrabajo_Hibrido_V2.pdf',
      uploadDate: 'Enviado hace 2 días',
      category: 'contratos',
      categoryLabel: 'Anexo Teletrabajo',
      employeeName: 'Sofía Méndez',
      employeeDni: '53819204A',
      employeeCode: 'EMP-0599',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVHFSMhlHgjQCjV4kfNiX31WJKpLRpRgEiHurifcjhtkTw9lpDqixd6veyfP8j9LqFR5IY3S7FTTLAEyFA-ZnpSNASqKM-0l2LxM2N3UmRT0UyvPKRxlVdnI3-iv6ADPRiyjti4pdeq6vahjS31MFLJiIRpC8vM8vaW63H3qPns9ON7juti2unaDE5H7PWb0_wUBhzOJbIxJ-JwB2-BXad1TQJvrk-tlOq4bYWOGCRGsAceoeqXj3j',
      status: 'Pendiente Firma Empleado',
      statusType: 'pending_employee',
      fileTypeIcon: 'edit_document',
      selected: false
    },
    {
      id: 'doc-3',
      expediente: 'EXP-2024-9022',
      filename: 'REV_Salarial_Q4_Direccion.pdf',
      uploadDate: 'Empleado ya firmó OTP',
      category: 'contratos',
      categoryLabel: 'Revisión Salarial Q4',
      employeeName: 'Mateo Gutiérrez',
      employeeDni: '30918237K',
      employeeCode: 'EMP-0105',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB053DKpd0zkwSVc9cfzrVYGQL1xA3eD4HFIt6U39Syyr0mA_FwOYva5-4BCHhktgXWgHTcJMWvAwSgqO5oHBnca5wIQXB1Q2Fr11d-HiXNuNGtCihAtXetY__Quwnc0TtW9hFoFGGfupYoVsEcBNbX66GCfU6rBKmRmBnz6L_m3PlHkwpZR-O5emCJ-u1R8CyYqDtdCvOo3CNKkTnWdOivfDYpEIXWm2XsDx7UDGSQSwIG4mlnxm1w',
      status: 'Esperando Rep. Legal',
      statusType: 'pending_legal',
      fileTypeIcon: 'verified',
      selected: false
    },
    {
      id: 'doc-4',
      expediente: 'EXP-VIS-2022',
      filename: 'VIS_PermisoTrabajo_Extranjeria_KP.pdf',
      uploadDate: 'Caduca en 14 días',
      category: 'certificados',
      categoryLabel: 'Visado Extranjería UE',
      employeeName: 'Kavita Patel',
      employeeDni: 'X8491029Z',
      employeeCode: 'EMP-0740',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVO766A6HIWlg4lH5OIe0msWC8kornSdFKGO5qMzr2xekIsxB7ERzRm4Cl-fjqFIv89IQQVQbya4scLroGZNQWDXU9nIiHr8G7n5wIXsS_l59SvnzVcrgbFUsqo7eVj9BG0uShpCjECV6368Isi11PL9XxIMIGBCNHyryOprGv4EvyRQ9IJbpSXwnOIy7PZW1vzjMbvRXdGk9TapK-rQhSPcDnmWSySTpf4kI1iDpTEaK1YHFGAd0n',
      status: 'Próximo a Vencer',
      statusType: 'expiring',
      fileTypeIcon: 'badge',
      selected: false
    },
    {
      id: 'doc-5',
      expediente: 'EXP-2024-8741',
      filename: 'NDA_Confidencialidad_IP_Corp.pdf',
      uploadDate: 'Audit Trail Cerrado',
      category: 'contratos',
      categoryLabel: 'Acuerdo NDA / PI',
      employeeName: 'Lucía Morales',
      employeeDni: '71829304P',
      employeeCode: 'EMP-0618',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK0kQcfw97rn0NALU0jUX5oW02fBBiDMkxr0gFp0Ye_51uDEaDF_bTETKzV0cJ0LR-2FaHGQf5oIDf3ikwN4_AcmWthLj4Qi61YiX7G6KwxJm9MmeJd_aLN4iNKtJLCktwEKVIeLt1GiI5sE6XBmi6JnQ3Ih5eKiQ05wREqMlAt0UteODe4xrQALajSJyQ-lw0lAR5no7Gup-g-HRQ0pxOfJp3a3KU0BcliKOdb6EXA7EZsmMMXqkn',
      status: 'Completado (eIDAS)',
      statusType: 'completed',
      fileTypeIcon: 'lock',
      selected: false
    },
    {
      id: 'doc-6',
      expediente: 'EXP-FISC-4410',
      filename: 'MOD145_RetencionesIRPF_2024.pdf',
      uploadDate: 'AEAT Validador OK',
      category: 'fiscales',
      categoryLabel: 'Modelo Fiscal 145',
      employeeName: 'Carlos Benítez',
      employeeDni: '09823411L',
      employeeCode: 'EMP-0032',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbom3TtX_KWYpzPwLt_eG3w_rHU9hkl0cCnh-mWUtQhJD0NO3MLDc55UM8sSIkGzPJZsKTNkgWaSE7W-Z5JnE20Hn-N-ipGPzlZOw2meL90Tp_OQ_pRj3QKqwBtbrin0HhLotVDVUSsGwI1LYO0Kabo3f4Shzp_HL3AQ5Zg2xoE3k_wo6Nvmrl3gLoyM2de8QfJe41BnK77Xe020yPgoAXq9Nn9WWb30B9y_U-rmGOA1zZXcnALjYo',
      status: 'Completado (eIDAS)',
      statusType: 'completed',
      fileTypeIcon: 'account_balance',
      selected: false
    },
    {
      id: 'doc-7',
      expediente: 'EXP-2024-9540',
      filename: 'ANX_Prueba_Superada_Consolidacion.pdf',
      uploadDate: 'Borrador generado',
      category: 'contratos',
      categoryLabel: 'Período de Prueba',
      employeeName: 'Daniela Gómez',
      employeeDni: '48102938B',
      employeeCode: 'EMP-0819',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATdFq4n7xvOw0RDpp71DhqRQOaqak3sfXBy7yYZhOcDu96R5-c8d5DS1ZLrFTcB3iBCDmMPOb-s_Ry0NoieuOzocufOADf1ahMxzMycvNaF1HTLiAUm8VNQ_kDnftOO5NYiKNIr3mu0CHb73A6uV9bEKPKAkOzw0KqrdVhvcgGSyZeKE6AnNFUrAVbkK0AlCyZj9fQCSyx5eCWoExVw-dPG-VJu3FSVF7QTGOBc3ouF2PR2YI_FxKx',
      status: 'Borrador Preparado',
      statusType: 'draft',
      fileTypeIcon: 'history_edu',
      selected: false
    },
    {
      id: 'doc-8',
      expediente: 'EXP-2024-9188',
      filename: 'ANX_Movilidad_Internacional_UE.pdf',
      uploadDate: 'Vence en 21 días',
      category: 'contratos',
      categoryLabel: 'Movilidad Internacional',
      employeeName: 'Julián Álvarez',
      employeeDni: '19284091M',
      employeeCode: 'EMP-0382',
      employeeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0JF3_XKeLL_BG2K0tStrQ6IoC_Xr-difC4nT9TK-B5o9G90OKOw1t36QQFxiAdcVrm5foTxuStwfBUyV5TAOW5SOt6Pg-eLJaQ4MHd8JDcoBhxXZ_QxIcvreOdtJ6qN-6c491DwPXr8MvbDz1p2S62fnWUBrhAonHmDYm2zMKg9BmNvrOp1gO4ayjVADL6dLC54dD2_3PjTYjY-baJIyn3nSP-q55uLHOn9JQV4OtUVxfsZWmHGZZ',
      status: 'Completado (eIDAS)',
      statusType: 'completed',
      fileTypeIcon: 'public',
      selected: false
    }
  ]);

  get filteredDocuments(): DocumentItem[] {
    return this.documents().filter(doc => {
      // Category tab filter
      const cat = this.activeCategory();
      if (cat !== 'all' && doc.category !== cat) {
        return false;
      }

      // Search query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const match = doc.filename.toLowerCase().includes(q) ||
          doc.employeeName.toLowerCase().includes(q) ||
          doc.employeeDni.toLowerCase().includes(q) ||
          doc.employeeCode.toLowerCase().includes(q) ||
          doc.expediente.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Status dropdown
      if (this.selectedStatusFilter && doc.statusType !== this.selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }

  toggleSelectAll(): void {
    this.selectAllChecked = !this.selectAllChecked;
    this.documents.update(list => list.map(d => ({ ...d, selected: this.selectAllChecked })));
  }

  addNewDocument(): void {
    if (!this.newDocFilename.trim()) {
      this.showToast('Por favor introduce el nombre del archivo.');
      return;
    }
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const newDoc: DocumentItem = {
      id: `doc-${idNum}`,
      expediente: `EXP-2024-${idNum}`,
      filename: this.newDocFilename.trim().endsWith('.pdf') ? this.newDocFilename.trim() : `${this.newDocFilename.trim()}.pdf`,
      uploadDate: 'Subido recién',
      category: this.newDocCategory,
      categoryLabel: this.newDocCategory === 'contratos' ? 'Contrato Laboral' : (this.newDocCategory === 'nominas' ? 'Recibo de Nómina' : 'Documento Corporativo'),
      employeeName: this.newDocEmpName.trim() || 'Elena Morales',
      employeeDni: this.newDocEmpDni.trim() || '48291049T',
      employeeCode: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Pendiente Firma Empleado',
      statusType: 'pending_employee',
      fileTypeIcon: 'edit_document',
      selected: false
    };

    this.documents.update(list => [newDoc, ...list]);
    this.showUploadModal.set(false);
    this.showToast(`Documento ${newDoc.filename} incorporado al expediente digital.`);

    // Reset
    this.newDocFilename = '';
    this.newDocEmpName = '';
    this.newDocEmpDni = '';
  }

  signDocument(doc: DocumentItem): void {
    this.documents.update(list => list.map(d => {
      if (d.id === doc.id) {
        return {
          ...d,
          status: 'Completado (eIDAS)',
          statusType: 'completed',
          fileTypeIcon: 'verified'
        };
      }
      return d;
    }));
    this.showToast(`Documento ${doc.filename} firmado digitalmente mediante certificado eIDAS.`);
  }

  downloadDoc(doc: DocumentItem): void {
    const content = `RH Enterprise Cloud - Documento Certificado\nExpediente: ${doc.expediente}\nArchivo: ${doc.filename}\nEmpleado: ${doc.employeeName} (${doc.employeeDni})\nEstado: ${doc.status}\nFirma: SHA256-${Date.now().toString(16)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.filename;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast(`Descargado archivo: ${doc.filename}`);
  }

  downloadAuditTrail(doc: DocumentItem): void {
    this.showToast(`Descargando Certificado de Trazabilidad eIDAS para ${doc.filename}`);
  }

  downloadZip(): void {
    const list = this.documents().map(d => `${d.filename} - ${d.employeeName} (${d.status})`).join('\n');
    const blob = new Blob([`Índice de Documentos Firmados RH\n====================================\n${list}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lote_documentos_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Lote de documentos exportado correctamente.');
  }

  sendOtpReminder(): void {
    this.showToast('Recordatorio de firma OTP reenviado con éxito al correo y SMS corporativo.');
  }

  openPreview(doc: DocumentItem): void {
    this.previewDoc.set(doc);
  }

  closePreview(): void {
    this.previewDoc.set(null);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}

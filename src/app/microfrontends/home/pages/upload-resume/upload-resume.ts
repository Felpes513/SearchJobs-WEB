import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ResumeService } from '../../services/home.service';
import { ParsedResumeData } from '../../models/home.models';
import { ExtractPreviewModal } from '../../components/extract-preview-modal/extract-preview-modal';

@Component({
  selector: 'app-upload-resume',
  imports: [CommonModule, ExtractPreviewModal, MatButtonModule],
  templateUrl: './upload-resume.html',
  styleUrl: './upload-resume.css',
})
export class UploadResume {
  private resumeService = inject(ResumeService);
  private cdr = inject(ChangeDetectorRef);

  selectedFile: File | null = null;
  fileName = '';
  carregando = false;
  extraindo = false;
  mensagemErro = '';
  mensagemSucesso = '';
  estaArrastandoArquivo = false;

  modalAberto = false;
  dadosExtraidos: ParsedResumeData | null = null;
  mensagemExtracao = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.processarArquivoSelecionado(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.estaArrastandoArquivo = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.estaArrastandoArquivo = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.estaArrastandoArquivo = false;

    const file = event.dataTransfer?.files?.[0] ?? null;
    this.processarArquivoSelecionado(file);
  }

  enviarCurriculo(): void {
    if (!this.selectedFile) {
      this.mensagemErro = 'Selecione um arquivo antes de enviar.';
      return;
    }

    this.carregando = true;
    this.extraindo = false;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.modalAberto = false;
    this.dadosExtraidos = null;
    this.mensagemExtracao = '';

    this.resumeService.uploadResume(this.selectedFile).subscribe({
      next: (response) => {
        this.carregando = false;
        this.mensagemSucesso = `Currículo "${response.fileName}" enviado com sucesso.`;
        this.fileName = '';
        this.selectedFile = null;

        this.extrairCurriculo(response.id);
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.mensagem || error?.error?.message || 'Não foi possível enviar o currículo.';
        this.cdr.detectChanges();
      },
    });
  }

  extrairCurriculo(resumeId: number): void {
    this.extraindo = true;
    this.mensagemErro = '';

    this.resumeService.extractResume(resumeId).subscribe({
      next: (response) => {
        this.extraindo = false;
        this.mensagemExtracao = response.mensagem;

        try {
          let parsed: unknown;

          if (typeof response.parsedJson === 'string') {
            const cleaned = response.parsedJson
              .replace(/\n/g, '')
              .replace(/\\"/g, '"');

            parsed = JSON.parse(cleaned);
          } else {
            parsed = response.parsedJson;
          }

          this.dadosExtraidos = parsed as ParsedResumeData;
          this.modalAberto = false;
          this.cdr.detectChanges();

          this.modalAberto = true;
          this.cdr.detectChanges();
        } catch {
          this.mensagemErro = 'Erro ao interpretar os dados extraídos do currículo.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.extraindo = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível extrair os dados do currículo.';
        this.cdr.detectChanges();
      },
    });
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.cdr.detectChanges();
  }

  private processarArquivoSelecionado(file: File | null): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!file) {
      this.selectedFile = null;
      this.fileName = '';
      return;
    }

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      this.selectedFile = null;
      this.fileName = '';
      this.mensagemErro = 'Apenas arquivos PDF são aceitos.';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
  }
}

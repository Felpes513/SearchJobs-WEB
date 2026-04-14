import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ExtractPreviewModal } from '../../components/extract-preview-modal/extract-preview-modal';
import { ParsedResumeData, ResumeItem } from '../../models/home.models';
import { ResumeService } from '../../services/home.service';

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
        this.mensagemSucesso = `Curriculo "${response.fileName}" enviado com sucesso.`;
        this.fileName = '';
        this.selectedFile = null;

        this.extrairCurriculo(response.id);
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Nao foi possivel enviar o curriculo.';
        this.cdr.detectChanges();
      },
    });
  }

  extrairCurriculo(resumeId: number): void {
    this.extraindo = true;
    this.mensagemErro = '';

    this.resumeService.extractResume(resumeId).subscribe({
      next: (response) => {
        this.mensagemExtracao = response.mensagem;

        this.resumeService.listarCurriculos().subscribe({
          next: (curriculos) => {
            this.extraindo = false;

            const curriculo = curriculos.content.find((item) => item.id === resumeId) ?? null;

            if (!curriculo) {
              this.mensagemErro = 'Nao foi possivel carregar os dados extraidos do curriculo.';
              this.cdr.detectChanges();
              return;
            }

            this.dadosExtraidos = this.mapearCurriculoParaPreview(curriculo);
            this.modalAberto = false;
            this.cdr.detectChanges();

            this.modalAberto = true;
            this.cdr.detectChanges();
          },
          error: () => {
            this.extraindo = false;
            this.mensagemErro = 'Nao foi possivel carregar os dados extraidos do curriculo.';
            this.cdr.detectChanges();
          },
        });
      },
      error: (error) => {
        this.extraindo = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Nao foi possivel extrair os dados do curriculo.';
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

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      this.selectedFile = null;
      this.fileName = '';
      this.mensagemErro = 'Apenas arquivos PDF sao aceitos.';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
  }

  private mapearCurriculoParaPreview(curriculo: ResumeItem): ParsedResumeData {
    return {
      nome: curriculo.nome ?? undefined,
      email: curriculo.email ?? undefined,
      telefone: curriculo.telefone ?? undefined,
      skills: curriculo.skills ?? undefined,
      experiencias: curriculo.experiencias?.map((experiencia) => ({
        cargo: experiencia.cargo ?? undefined,
        empresa: experiencia.empresa ?? undefined,
        periodo: this.formatarPeriodoExtracao(experiencia.dataInicio, experiencia.dataFim),
      })),
      certificacoes: curriculo.certificacoes
        ?.map((certificacao) => certificacao.nome ?? '')
        .filter(Boolean),
      projetos: curriculo.projetos?.map((projeto) => ({
        nome: projeto.nome ?? undefined,
        descricao: projeto.descricao ?? undefined,
      })),
    };
  }

  private formatarPeriodoExtracao(
    dataInicio: string | null,
    dataFim: string | null,
  ): string | undefined {
    const inicio = dataInicio ?? '';
    const fim = dataFim ?? '';

    if (!inicio && !fim) {
      return undefined;
    }

    return [inicio || 'Inicio nao informado', fim || 'Atual'].join(' - ');
  }
}

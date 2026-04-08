import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ResumeService } from '../../services/home.service';
import { ResumeItem } from '../../models/home.models';

@Component({
  selector: 'app-my-resumes',
  imports: [CommonModule],
  templateUrl: './my-resumes.html',
  styleUrl: './my-resumes.css',
})
export class MyResumes implements OnInit {
  private resumeService = inject(ResumeService);

  curriculos: ResumeItem[] = [];
  carregando = true;
  mensagemErro = '';

  ngOnInit(): void {
    this.carregarCurriculos();
  }

  carregarCurriculos(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.resumeService.listarCurriculos().subscribe({
      next: (response) => {
        this.curriculos = response;
        this.carregando = false;
      },
      error: (error) => {
        this.carregando = false;
        this.mensagemErro =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível carregar os currículos.';
      },
    });
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-BR');
  }
}
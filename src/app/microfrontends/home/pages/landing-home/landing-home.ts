import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-home',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landing-home.html',
  styleUrl: './landing-home.css',
})
export class LandingHome {
  readonly quickActions = [
    {
      icon: 'upload_file',
      title: 'Enviar currículo',
      description: 'Faça upload do PDF e prepare seu perfil para análises e recomendações.',
      route: '/landing/upload',
      cta: 'Ir para upload',
    },
    {
      icon: 'description',
      title: 'Revisar currículo',
      description: 'Confira os dados extraídos, links, skills e experiências consolidadas.',
      route: '/landing/resumes',
      cta: 'Ver meu currículo',
    },
    {
      icon: 'auto_awesome',
      title: 'Explorar vagas',
      description: 'Busque vagas recomendadas e gere matches com IA para priorizar oportunidades.',
      route: '/landing/jobs',
      cta: 'Abrir vagas',
    },
    {
      icon: 'timeline',
      title: 'Acompanhar processo',
      description: 'Gerencie suas candidaturas por status e acompanhe o funil seletivo no kanban.',
      route: '/landing/history',
      cta: 'Abrir histórico',
    },
  ];

  readonly steps = [
    {
      number: '01',
      title: 'Organize seu perfil',
      text: 'Comece enviando ou revisando seu currículo para garantir que o sistema trabalhe com dados atualizados.',
    },
    {
      number: '02',
      title: 'Busque vagas com contexto',
      text: 'A plataforma usa seu cargo desejado e suas skills para trazer oportunidades mais alinhadas.',
    },
    {
      number: '03',
      title: 'Priorize com IA',
      text: 'Use os matches para entender pontos fortes, gaps e decidir onde vale investir energia.',
    },
    {
      number: '04',
      title: 'Acompanhe sua evolução',
      text: 'Depois da candidatura, mova cada vaga entre as etapas do processo seletivo e mantenha tudo sob controle.',
    },
  ];
}

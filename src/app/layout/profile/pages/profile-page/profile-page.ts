import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DOCUMENT, Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ProfileService } from '../../services/profile.service';
import {
  Certification,
  Experience,
  Profile,
  Project,
  SkillResponse,
} from '../../models/profile.model';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationModal } from '../../../../shared/components/confirmation-modal/confirmation-modal';
import { AppSettingsValue, AppThemePreference, SettingsModal } from '../../../../shared/components/settings-modal/settings-modal';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIcon, MatButtonModule, ConfirmationModal, SettingsModal],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly settingsStorageKey = 'appSettings';

  loading = false;
  saving = false;
  syncingGithubProjects = false;
  errorMessage = '';
  successMessage = '';
  githubSyncModalOpen = false;
  settingsModalOpen = false;
  appLanguage = 'pt-BR';
  appTheme: AppThemePreference = 'system';
  termsAccepted = false;

  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadStoredSettings();
    this.loadData();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      resumoProfissional: [''],
      cidade: [''],
      estado: [''],
      linkedinUrl: [''],
      githubUrl: [''],
      skills: this.fb.array([]),
      experiences: this.fb.array([]),
      certifications: this.fb.array([]),
      projects: this.fb.array([]),
    });
  }

  get skills(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  get experiences(): FormArray {
    return this.profileForm.get('experiences') as FormArray;
  }

  get certifications(): FormArray {
    return this.profileForm.get('certifications') as FormArray;
  }

  get projects(): FormArray {
    return this.profileForm.get('projects') as FormArray;
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    forkJoin({
      profile: this.profileService.getProfile(),
      skills: this.profileService.getSkills(),
      experiences: this.profileService.getExperiences(),
      certifications: this.profileService.getCertifications(),
      projects: this.profileService.getProjects(),
    }).subscribe({
      next: (response) => {
        this.patchProfile(response.profile ?? {});
        this.setSkills(Array.isArray(response.skills) ? response.skills : []);
        this.setExperiences(Array.isArray(response.experiences) ? response.experiences : []);
        this.setCertifications(
          Array.isArray(response.certifications) ? response.certifications : [],
        );
        this.setProjects(Array.isArray(response.projects) ? response.projects : []);
      },
      error: (error) => {
        console.error('Erro ao carregar perfil:', error);
        this.errorMessage = 'Não foi possível carregar os dados do perfil.';
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  patchProfile(profile: Partial<Profile> = {}): void {
    this.profileForm.patchValue({
      resumoProfissional: profile.resumoProfissional || '',
      cidade: profile.cidade || '',
      estado: profile.estado || '',
      linkedinUrl: profile.linkedinUrl || '',
      githubUrl: profile.githubUrl || '',
    });
  }

  setSkills(skills: SkillResponse[] = []): void {
    this.skills.clear();
    skills.forEach((skill) => {
      this.skills.push(this.fb.control(skill?.nomeSkill || ''));
    });
  }

  setExperiences(experiences: Experience[] = []): void {
    this.experiences.clear();
    experiences.forEach((exp) => {
      this.experiences.push(this.createExperienceGroup(exp));
    });
  }

  setCertifications(certifications: Certification[] = []): void {
    this.certifications.clear();
    certifications.forEach((cert) => {
      this.certifications.push(this.createCertificationGroup(cert));
    });
  }

  setProjects(projects: Project[] = []): void {
    this.projects.clear();
    projects.forEach((project) => {
      this.projects.push(this.createProjectGroup(project));
    });
  }

  createExperienceGroup(exp?: Experience): FormGroup {
    return this.fb.group({
      cargo: [exp?.cargo || ''],
      empresa: [exp?.empresa || ''],
      descricao: [exp?.descricao || ''],
      dataInicio: [this.normalizeMonthValue(exp?.dataInicio)],
      dataFim: [this.normalizeMonthValue(exp?.dataFim)],
    });
  }

  createCertificationGroup(cert?: Certification): FormGroup {
    return this.fb.group({
      nomeCertificacao: [cert?.nomeCertificacao || ''],
      instituicao: [cert?.instituicao || ''],
      dataObtencao: [this.normalizeMonthValue(cert?.dataObtencao)],
    });
  }

  createProjectGroup(project?: Project): FormGroup {
    return this.fb.group({
      nome: [project?.nome || ''],
      descricao: [project?.descricao || ''],
      stack: [project?.stack || ''],
      link: [project?.link || ''],
    });
  }

  addSkill(): void {
    this.skills.push(this.fb.control(''));
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  addExperience(): void {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index);
  }

  addCertification(): void {
    this.certifications.push(this.createCertificationGroup());
  }

  removeCertification(index: number): void {
    this.certifications.removeAt(index);
  }

  addProject(): void {
    this.projects.push(this.createProjectGroup());
  }

  removeProject(index: number): void {
    this.projects.removeAt(index);
  }

  openGithubSyncModal(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.githubSyncModalOpen = true;
    this.cdr.detectChanges();
  }

  closeGithubSyncModal(): void {
    if (this.syncingGithubProjects) {
      return;
    }

    this.githubSyncModalOpen = false;
    this.cdr.detectChanges();
  }

  syncGithubProjects(): void {
    if (this.syncingGithubProjects) {
      return;
    }

    this.syncingGithubProjects = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileService.syncGithubProjects().subscribe({
      next: (projects) => {
        this.setProjects(Array.isArray(projects) ? projects : []);
        this.syncingGithubProjects = false;
        this.githubSyncModalOpen = false;
        this.successMessage = 'Projetos sincronizados com o GitHub com sucesso.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.syncingGithubProjects = false;
        this.errorMessage =
          error?.error?.message ||
          error?.error?.mensagem ||
          'Não foi possível sincronizar os projetos do GitHub.';
        this.cdr.detectChanges();
      },
    });
  }

  openSettingsModal(): void {
    this.settingsModalOpen = true;
    this.cdr.detectChanges();
  }

  closeSettingsModal(): void {
    this.settingsModalOpen = false;
    this.cdr.detectChanges();
  }

  saveSettings(settings: AppSettingsValue): void {
    this.appLanguage = settings.language;
    this.appTheme = settings.theme;
    this.termsAccepted = settings.termsAccepted;

    localStorage.setItem(this.settingsStorageKey, JSON.stringify(settings));
    this.applyTheme(settings.theme);
    this.settingsModalOpen = false;
    this.successMessage = 'Configurações do sistema salvas com sucesso.';
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.location.back();
  }

  saveAll(): void {
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.profileForm.value;

    const profilePayload: Profile = {
      resumoProfissional: formValue.resumoProfissional,
      cidade: formValue.cidade,
      estado: formValue.estado,
      linkedinUrl: formValue.linkedinUrl,
      githubUrl: formValue.githubUrl,
    };

    const skillsPayload = {
      skills: (formValue.skills || [])
        .map((skill: string) => skill?.trim())
        .filter((skill: string) => !!skill),
    };

    const experiencesPayload = {
      experiencias: (formValue.experiences || []).filter(
        (exp: Experience) =>
          !!(exp.cargo || exp.empresa || exp.descricao || exp.dataInicio || exp.dataFim),
      ),
    };

    const certificationsPayload = {
      certificacoes: (formValue.certifications || []).filter(
        (cert: Certification) => !!(cert.nomeCertificacao || cert.instituicao || cert.dataObtencao),
      ),
    };

    const projectsPayload = {
      projetos: (formValue.projects || []).filter(
        (project: Project) =>
          !!(project.nome || project.descricao || project.stack || project.link),
      ),
    };

    this.profileService.updateProfile(profilePayload).subscribe({
      next: () => {
        this.profileService.updateSkills(skillsPayload).subscribe({
          next: () => {
            this.profileService.updateExperiences(experiencesPayload).subscribe({
              next: () => {
                this.profileService.updateCertifications(certificationsPayload).subscribe({
                  next: () => {
                    this.profileService.updateProjects(projectsPayload).subscribe({
                      next: () => {
                        this.successMessage = 'Perfil atualizado com sucesso.';
                        this.saving = false;
                        this.cdr.detectChanges();
                      },
                      error: (error) => this.handleSaveError(error),
                    });
                  },
                  error: (error) => this.handleSaveError(error),
                });
              },
              error: (error) => this.handleSaveError(error),
            });
          },
          error: (error) => this.handleSaveError(error),
        });
      },
      error: (error) => this.handleSaveError(error),
    });
  }

  private handleSaveError(error?: unknown): void {
    console.error('Erro ao salvar perfil:', error);
    this.errorMessage = 'Não foi possível salvar o perfil.';
    this.saving = false;
    this.cdr.detectChanges();
  }

  private normalizeMonthValue(value?: string | null): string {
    if (!value) return '';
    const monthPattern = /^\d{4}-\d{2}$/;
    if (monthPattern.test(value)) return value;
    return '';
  }

  private loadStoredSettings(): void {
    const raw = localStorage.getItem(this.settingsStorageKey);

    if (!raw) {
      this.applyTheme(this.appTheme);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AppSettingsValue;
      this.appLanguage = parsed.language || 'pt-BR';
      this.appTheme = parsed.theme || 'system';
      this.termsAccepted = !!parsed.termsAccepted;
    } catch {
      this.appLanguage = 'pt-BR';
      this.appTheme = 'system';
      this.termsAccepted = false;
    }

    this.applyTheme(this.appTheme);
  }

  private applyTheme(theme: AppThemePreference): void {
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-app-theme', prefersDark ? 'dark' : 'light');
      return;
    }

    root.setAttribute('data-app-theme', theme);
  }
}

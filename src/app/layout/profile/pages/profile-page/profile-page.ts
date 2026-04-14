import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../microfrontends/auth/services/auth.service';

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
import {
  AppSettingsResponse,
  AppSettingsValue,
  AppThemePreference,
  SettingsModal,
} from '../../../../shared/components/settings-modal/settings-modal';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIcon, MatButtonModule, ConfirmationModal, SettingsModal],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePageComponent implements OnInit {
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
  openAiApiKey = '';
  jsearchApiKey = '';
  openAiApiKeyMasked = '';
  jsearchApiKeyMasked = '';
  hasOpenAiApiKey = false;
  hasJsearchApiKey = false;
  accountEmail = '';
  passwordResetSending = false;
  passwordResetSuccessMessage = '';
  passwordResetErrorMessage = '';

  profileForm!: FormGroup;

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.accountEmail = this.authService.getAuthenticatedEmail();
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
      settings: this.profileService.getSettings(),
    }).subscribe({
      next: (response) => {
        this.patchProfile(response.profile ?? {});
        this.setSkills(Array.isArray(response.skills) ? response.skills : []);
        this.setExperiences(Array.isArray(response.experiences) ? response.experiences : []);
        this.setCertifications(
          Array.isArray(response.certifications) ? response.certifications : [],
        );
        this.setProjects(Array.isArray(response.projects) ? response.projects : []);
        this.applySettingsResponse(response.settings);
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
    this.passwordResetErrorMessage = '';
    this.passwordResetSuccessMessage = '';
    this.accountEmail = this.authService.getAuthenticatedEmail();
    this.settingsModalOpen = true;
    this.cdr.detectChanges();
  }

  closeSettingsModal(): void {
    this.settingsModalOpen = false;
    this.passwordResetSending = false;
    this.passwordResetErrorMessage = '';
    this.passwordResetSuccessMessage = '';
    this.cdr.detectChanges();
  }

  saveSettings(settings: AppSettingsValue): void {
    const payload: Partial<AppSettingsValue> = {
      language: settings.language,
      theme: settings.theme,
      termsAccepted: settings.termsAccepted,
    };

    if (settings.openAiApiKey.trim()) {
      payload.openAiApiKey = settings.openAiApiKey.trim();
    }

    if (settings.jsearchApiKey.trim()) {
      payload.jsearchApiKey = settings.jsearchApiKey.trim();
    }

    this.profileService.patchSettings(payload).subscribe({
      next: (response) => {
        this.applySettingsResponse(response);
        this.settingsModalOpen = false;
        this.successMessage = 'Configurações do sistema salvas com sucesso.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.mensagem ||
          error?.error?.message ||
          'Não foi possível salvar as configurações do sistema.';
        this.cdr.detectChanges();
      },
    });
  }

  requestPasswordReset(email: string): void {
    if (!email.trim() || this.passwordResetSending) {
      return;
    }

    this.passwordResetSending = true;
    this.passwordResetErrorMessage = '';
    this.passwordResetSuccessMessage = '';

    this.authService.forgotPassword({ email: email.trim() }).subscribe({
      next: () => {
        this.passwordResetSending = false;
        this.passwordResetSuccessMessage =
          'Se existir uma conta com esse e-mail, enviaremos um link de redefinicao em instantes.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.passwordResetSending = false;
        this.passwordResetErrorMessage =
          error?.error?.campos?.email ||
          error?.error?.mensagem ||
          error?.error?.message ||
          'Nao foi possivel solicitar a redefinicao de senha agora.';
        this.cdr.detectChanges();
      },
    });
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

  private applySettingsResponse(settings?: AppSettingsResponse | null): void {
    this.appLanguage = settings?.language || 'pt-BR';
    this.appTheme = settings?.theme || 'system';
    this.termsAccepted = !!settings?.termsAccepted;
    this.openAiApiKeyMasked = settings?.openAiApiKeyMasked || '';
    this.jsearchApiKeyMasked = settings?.jsearchApiKeyMasked || '';
    this.hasOpenAiApiKey = !!settings?.hasOpenAiApiKey;
    this.hasJsearchApiKey = !!settings?.hasJsearchApiKey;

    this.openAiApiKey = '';
    this.jsearchApiKey = '';

    this.themeService.apply(this.appTheme);
  }
}

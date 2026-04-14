import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Certification,
  Experience,
  Profile,
  Project,
  SkillResponse,
  UpdateCertificationsPayload,
  UpdateExperiencesPayload,
  UpdateProjectsPayload,
  UpdateSkillsPayload,
} from '../models/profile.model';
import { AppSettingsResponse, AppSettingsValue } from '../../../shared/components/settings-modal/settings-modal';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = 'http://localhost:8080/api/profile';
  private readonly settingsApiUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<ApiResponse<Profile>>(this.apiUrl).pipe(
      map((response) => response.data),
    );
  }

  updateProfile(payload: Profile): Observable<Profile> {
    return this.http.put<ApiResponse<Profile>>(this.apiUrl, payload).pipe(
      map((response) => response.data),
    );
  }

  getSkills(): Observable<SkillResponse[]> {
    return this.http.get<ApiResponse<SkillResponse[]>>(`${this.apiUrl}/skills`).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  updateSkills(payload: UpdateSkillsPayload): Observable<SkillResponse[]> {
    return this.http.put<ApiResponse<SkillResponse[]>>(`${this.apiUrl}/skills`, payload).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  getExperiences(): Observable<Experience[]> {
    return this.http.get<ApiResponse<Experience[]>>(`${this.apiUrl}/experiences`).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  updateExperiences(payload: UpdateExperiencesPayload): Observable<Experience[]> {
    return this.http.put<ApiResponse<Experience[]>>(`${this.apiUrl}/experiences`, payload).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  getCertifications(): Observable<Certification[]> {
    return this.http.get<ApiResponse<Certification[]>>(`${this.apiUrl}/certifications`).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  updateCertifications(payload: UpdateCertificationsPayload): Observable<Certification[]> {
    return this.http.put<ApiResponse<Certification[]>>(`${this.apiUrl}/certifications`, payload).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/projects`).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  updateProjects(payload: UpdateProjectsPayload): Observable<Project[]> {
    return this.http.put<ApiResponse<Project[]>>(`${this.apiUrl}/projects`, payload).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  syncGithubProjects(): Observable<Project[]> {
    return this.http.post<ApiResponse<Project[]>>(`${this.apiUrl}/github/sync`, {}).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
    );
  }

  getSettings(): Observable<AppSettingsResponse> {
    return this.http.get<ApiResponse<AppSettingsResponse>>(this.settingsApiUrl).pipe(
      map((response) => response.data),
    );
  }

  patchSettings(payload: Partial<AppSettingsValue>): Observable<AppSettingsResponse> {
    return this.http.patch<ApiResponse<AppSettingsResponse>>(this.settingsApiUrl, payload).pipe(
      map((response) => response.data),
    );
  }

  loadAllProfileData() {
    return forkJoin({
      profile: this.getProfile(),
      skills: this.getSkills(),
      experiences: this.getExperiences(),
      certifications: this.getCertifications(),
      projects: this.getProjects(),
      settings: this.getSettings(),
    });
  }
}

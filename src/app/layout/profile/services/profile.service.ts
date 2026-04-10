import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.apiUrl);
  }

  updateProfile(payload: Profile): Observable<Profile> {
    return this.http.put<Profile>(this.apiUrl, payload);
  }

  getSkills(): Observable<SkillResponse[]> {
    return this.http.get<SkillResponse[]>(`${this.apiUrl}/skills`);
  }

  updateSkills(payload: UpdateSkillsPayload): Observable<SkillResponse[]> {
    return this.http.put<SkillResponse[]>(`${this.apiUrl}/skills`, payload);
  }

  getExperiences(): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiUrl}/experiences`);
  }

  updateExperiences(payload: UpdateExperiencesPayload): Observable<Experience[]> {
    return this.http.put<Experience[]>(`${this.apiUrl}/experiences`, payload);
  }

  getCertifications(): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.apiUrl}/certifications`);
  }

  updateCertifications(payload: UpdateCertificationsPayload): Observable<Certification[]> {
    return this.http.put<Certification[]>(`${this.apiUrl}/certifications`, payload);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  updateProjects(payload: UpdateProjectsPayload): Observable<Project[]> {
    return this.http.put<Project[]>(`${this.apiUrl}/projects`, payload);
  }

  syncGithubProjects(): Observable<Project[]> {
    return this.http.post<Project[]>(`${this.apiUrl}/github/sync`, {});
  }

  loadAllProfileData() {
    return forkJoin({
      profile: this.getProfile(),
      skills: this.getSkills(),
      experiences: this.getExperiences(),
      certifications: this.getCertifications(),
      projects: this.getProjects(),
    });
  }
}

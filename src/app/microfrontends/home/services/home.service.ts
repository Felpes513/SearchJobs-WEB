import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiMessageResponse, ApiResponse } from '../../../core/models/api-response.model';
import {
  ApplicationKanbanResponse,
  ApplicationStatus,
  JobMatchCacheEntry,
  JobMatchItem,
  JobSearchCacheEntry,
  JobSearchResult,
  JobItem,
  ResumeExtractResponse,
  ResumeListResponse,
  UploadResumeResponse,
} from '../models/home.models';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/resumes';
  private readonly jobsCachePrefix = 'jobsSearchCache';
  private readonly jobMatchesCachePrefix = 'jobsMatchAllCache';
  private readonly jobsCacheTtlMs = 10 * 60 * 1000;

  uploadResume(file: File): Observable<UploadResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<UploadResumeResponse>>(`${this.apiUrl}/upload`, formData).pipe(
      map((response) => response.data),
    );
  }

  extractResume(resumeId: number): Observable<ResumeExtractResponse> {
    return this.http.post<ApiResponse<ResumeExtractResponse>>(
      `${this.apiUrl}/${resumeId}/extract`,
      {}
    ).pipe(
      map((response) => response.data),
      tap(() => {
        this.invalidarCacheVagas();
        this.invalidarCacheMatches();
      })
    );
  }

  listarCurriculos(): Observable<ResumeListResponse> {
    return this.http.get<ApiResponse<ResumeListResponse>>(this.apiUrl).pipe(
      map((response) => response.data),
    );
  }

  deletarCurriculo(resumeId: number): Observable<void> {
    return this.http.delete<ApiMessageResponse>(`${this.apiUrl}/${resumeId}`).pipe(
      map(() => void 0),
    );
  }

  buscarVagas(): Observable<JobSearchResult> {
    const cache = this.obterCacheVagas();

    if (cache) {
      return of({
        vagas: cache.vagas,
        fromCache: true,
        cachedAt: cache.cachedAt,
      });
    }

    return this.http.get<ApiResponse<JobItem[]>>('http://localhost:8080/api/jobs/search').pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
      map((vagas) => vagas.map((vaga) => this.normalizarVaga(vaga))),
      tap((vagas) => this.salvarCacheVagas(vagas)),
      map((vagas) => ({
        vagas,
        fromCache: false,
        cachedAt: new Date().toISOString(),
      }))
    );
  }

  obterVagasEmCache(): JobSearchResult | null {
    const cache = this.obterCacheVagas();

    if (!cache) {
      return null;
    }

    return {
      vagas: cache.vagas,
      fromCache: true,
      cachedAt: cache.cachedAt,
    };
  }

  analisarCompatibilidadeVagas(): Observable<JobMatchItem[]> {
    const cache = this.obterCacheMatches();

    if (cache) {
      return of(cache.matches);
    }

    return this.http.post<ApiResponse<JobMatchItem[]>>('http://localhost:8080/api/jobs/match-all', {}).pipe(
      map((response) => Array.isArray(response.data) ? response.data : []),
      tap((matches) => this.salvarCacheMatches(matches))
    );
  }

  listarMatchesSalvos(): Observable<JobMatchItem[]> {
    return this.http.get<ApiResponse<JobMatchItem[]>>('http://localhost:8080/api/jobs/matches').pipe(
      map((response) => Array.isArray(response.data) ? response.data : [])
    );
  }

  obterMatchesEmCache(): JobMatchItem[] {
    return this.obterCacheMatches()?.matches ?? [];
  }

  criarCandidatura(jobId: number, observacao = ''): Observable<void> {
    return this.http.post<ApiMessageResponse>('http://localhost:8080/api/applications', {
      jobId,
      observacao,
    }).pipe(
      map(() => void 0),
    );
  }

  listarKanbanCandidaturas(): Observable<ApplicationKanbanResponse> {
    return this.http.get<ApiResponse<ApplicationKanbanResponse>>('http://localhost:8080/api/applications').pipe(
      map((response) => response.data),
    );
  }

  atualizarStatusCandidatura(id: number, status: ApplicationStatus): Observable<void> {
    return this.http.put<ApiMessageResponse>(`http://localhost:8080/api/applications/${id}/status`, {
      status,
    }).pipe(
      map(() => void 0),
    );
  }

  deletarCandidatura(id: number): Observable<void> {
    return this.http.delete<ApiMessageResponse>(`http://localhost:8080/api/applications/${id}`).pipe(
      map(() => void 0),
    );
  }

  private salvarCacheVagas(vagas: JobItem[]): void {
    const chave = this.obterChaveCacheVagas();

    if (!chave) {
      return;
    }

    const cache: JobSearchCacheEntry = {
      vagas,
      cachedAt: new Date().toISOString(),
    };

    localStorage.setItem(chave, JSON.stringify(cache));
  }

  private obterCacheVagas(): JobSearchCacheEntry | null {
    const chave = this.obterChaveCacheVagas();

    if (!chave) {
      return null;
    }

    const cacheBruto = localStorage.getItem(chave);

    if (!cacheBruto) {
      return null;
    }

    try {
      const cache = JSON.parse(cacheBruto) as JobSearchCacheEntry;
      const cachedAtMs = new Date(cache.cachedAt).getTime();

      if (
        !Array.isArray(cache.vagas) ||
        !cache.cachedAt ||
        Number.isNaN(cachedAtMs) ||
        Date.now() - cachedAtMs > this.jobsCacheTtlMs
      ) {
        localStorage.removeItem(chave);
        return null;
      }

      return cache;
    } catch {
      localStorage.removeItem(chave);
      return null;
    }
  }

  private obterChaveCacheVagas(): string | null {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return null;
    }

    return `${this.jobsCachePrefix}:${token}`;
  }

  private salvarCacheMatches(matches: JobMatchItem[]): void {
    const chave = this.obterChaveCacheMatches();

    if (!chave) {
      return;
    }

    const cache: JobMatchCacheEntry = {
      matches,
      cachedAt: new Date().toISOString(),
    };

    localStorage.setItem(chave, JSON.stringify(cache));
  }

  private obterCacheMatches(): JobMatchCacheEntry | null {
    const chave = this.obterChaveCacheMatches();

    if (!chave) {
      return null;
    }

    const cacheBruto = localStorage.getItem(chave);

    if (!cacheBruto) {
      return null;
    }

    try {
      const cache = JSON.parse(cacheBruto) as JobMatchCacheEntry;
      const cachedAtMs = new Date(cache.cachedAt).getTime();

      if (
        !Array.isArray(cache.matches) ||
        !cache.cachedAt ||
        Number.isNaN(cachedAtMs) ||
        Date.now() - cachedAtMs > this.jobsCacheTtlMs
      ) {
        localStorage.removeItem(chave);
        return null;
      }

      return cache;
    } catch {
      localStorage.removeItem(chave);
      return null;
    }
  }

  private obterChaveCacheMatches(): string | null {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return null;
    }

    return `${this.jobMatchesCachePrefix}:${token}`;
  }

  private invalidarCacheVagas(): void {
    const chave = this.obterChaveCacheVagas();

    if (!chave) {
      return;
    }

    localStorage.removeItem(chave);
  }

  private invalidarCacheMatches(): void {
    const chave = this.obterChaveCacheMatches();

    if (!chave) {
      return;
    }

    localStorage.removeItem(chave);
  }

  private normalizarVaga(vaga: Partial<JobItem> & { jobId?: number | null }): JobItem {
    const rawId = vaga.id ?? vaga.jobId ?? null;

    return {
      id: typeof rawId === 'number' && Number.isFinite(rawId) ? rawId : null,
      externalId: vaga.externalId ?? '',
      titulo: vaga.titulo ?? '',
      empresa: vaga.empresa ?? '',
      localizacao: vaga.localizacao ?? '',
      modeloTrabalho: vaga.modeloTrabalho ?? '',
      senioridade: vaga.senioridade ?? '',
      descricao: vaga.descricao ?? '',
      salario: vaga.salario ?? null,
      jobUrl: vaga.jobUrl ?? '',
      dataPublicacao: vaga.dataPublicacao ?? '',
    };
  }
}

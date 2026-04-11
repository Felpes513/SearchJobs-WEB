import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

    return this.http.post<UploadResumeResponse>(`${this.apiUrl}/upload`, formData);
  }

  extractResume(resumeId: number): Observable<ResumeExtractResponse> {
    return this.http.post<ResumeExtractResponse>(
      `${this.apiUrl}/${resumeId}/extract`,
      {}
    ).pipe(
      tap(() => {
        this.invalidarCacheVagas();
        this.invalidarCacheMatches();
      })
    );
  }

  listarCurriculos(): Observable<ResumeListResponse> {
    return this.http.get<ResumeListResponse>(this.apiUrl);
  }

  deletarCurriculo(resumeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${resumeId}`);
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

    return this.http.get<JobItem[]>('http://localhost:8080/api/jobs/search').pipe(
      map((vagas) => Array.isArray(vagas) ? vagas.map((vaga) => this.normalizarVaga(vaga)) : []),
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

    return this.http.post<JobMatchItem[]>('http://localhost:8080/api/jobs/match-all', {}).pipe(
      map((matches) => Array.isArray(matches) ? matches : []),
      tap((matches) => this.salvarCacheMatches(matches))
    );
  }

  listarMatchesSalvos(): Observable<JobMatchItem[]> {
    return this.http.get<JobMatchItem[]>('http://localhost:8080/api/jobs/matches').pipe(
      map((matches) => Array.isArray(matches) ? matches : [])
    );
  }

  obterMatchesEmCache(): JobMatchItem[] {
    return this.obterCacheMatches()?.matches ?? [];
  }

  criarCandidatura(jobId: number, observacao = ''): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/applications', {
      jobId,
      observacao,
    });
  }

  listarKanbanCandidaturas(): Observable<ApplicationKanbanResponse> {
    return this.http.get<ApplicationKanbanResponse>('http://localhost:8080/api/applications');
  }

  atualizarStatusCandidatura(id: number, status: ApplicationStatus): Observable<void> {
    return this.http.put<void>(`http://localhost:8080/api/applications/${id}/status`, {
      status,
    });
  }

  deletarCandidatura(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/applications/${id}`);
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

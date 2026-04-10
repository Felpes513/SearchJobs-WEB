import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import {
  JobApplicationHistoryItem,
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
  private readonly applicationHistoryStorageKey = 'jobApplicationHistoryMock';
  private readonly jobsCachePrefix = 'jobsSearchCache';
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
      tap(() => this.invalidarCacheVagas())
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
      map((vagas) => Array.isArray(vagas) ? vagas : []),
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
    return this.http.post<JobMatchItem[]>('http://localhost:8080/api/jobs/match-all', {}).pipe(
      map((matches) => Array.isArray(matches) ? matches : [])
    );
  }

  listarMatchesSalvos(): Observable<JobMatchItem[]> {
    return this.http.get<JobMatchItem[]>('http://localhost:8080/api/jobs/matches').pipe(
      map((matches) => Array.isArray(matches) ? matches : [])
    );
  }

  registrarCandidaturaMock(vaga: JobItem): Observable<void> {
    const historicoAtual = this.listarHistoricoCandidaturasMock();

    const novoItem: JobApplicationHistoryItem = {
      jobId: vaga.id,
      externalId: vaga.externalId,
      titulo: vaga.titulo,
      empresa: vaga.empresa,
      localizacao: vaga.localizacao,
      modeloTrabalho: vaga.modeloTrabalho,
      senioridade: vaga.senioridade,
      salario: vaga.salario,
      jobUrl: vaga.jobUrl,
      dataPublicacao: vaga.dataPublicacao,
      appliedAt: new Date().toISOString(),
    };

    const historicoSemDuplicidade = historicoAtual.filter(
      (item) => item.jobId !== vaga.id
    );

    localStorage.setItem(
      this.applicationHistoryStorageKey,
      JSON.stringify([novoItem, ...historicoSemDuplicidade])
    );

    return of(void 0).pipe(delay(350));
  }

  listarHistoricoCandidaturasMock(): JobApplicationHistoryItem[] {
    const historicoBruto = localStorage.getItem(this.applicationHistoryStorageKey);

    if (!historicoBruto) {
      return [];
    }

    try {
      const historico = JSON.parse(historicoBruto);
      return Array.isArray(historico) ? historico : [];
    } catch {
      return [];
    }
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

  private invalidarCacheVagas(): void {
    const chave = this.obterChaveCacheVagas();

    if (!chave) {
      return;
    }

    localStorage.removeItem(chave);
  }
}

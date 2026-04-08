import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ResumeExtractResponse,
  ResumeItem,
  UploadResumeResponse,
} from '../models/home.models';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/resumes';

  uploadResume(file: File): Observable<UploadResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResumeResponse>(`${this.apiUrl}/upload`, formData);
  }

  extractResume(resumeId: number): Observable<ResumeExtractResponse> {
    return this.http.post<ResumeExtractResponse>(
      `${this.apiUrl}/${resumeId}/extract`,
      {}
    );
  }

  listarCurriculos(): Observable<ResumeItem[]> {
    return this.http.get<ResumeItem[]>(this.apiUrl);
  }
}
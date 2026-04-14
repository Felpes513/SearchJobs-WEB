import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ForgotPasswordResponse,
} from '../models/auth.models';
import { ApiMessageResponse, ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';
  private readonly rememberedEmailKey = 'rememberedEmail';
  private readonly rememberMeKey = 'rememberMe';

  login(payload: LoginRequest, rememberMe = false): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, payload).pipe(
      map((response) => response.data),
      tap((response) => {
        this.persistSession(response, payload.email, rememberMe);
      }),
    );
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/forgot-password`, payload).pipe(
      map((response) => ({
        success: response.success,
        message: response.message,
      })),
    );
  }

  resetPassword(payload: ResetPasswordRequest): Observable<void> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/reset-password`, payload).pipe(
      map(() => void 0),
    );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/register`, payload).pipe(
      map((response) => ({
        mensagem: response.message,
      })),
    );
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey) || sessionStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.refreshTokenKey) || sessionStorage.getItem(this.refreshTokenKey)
    );
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getRememberedEmail(): string {
    return localStorage.getItem(this.rememberedEmailKey) ?? '';
  }

  isRememberMeEnabled(): boolean {
    return localStorage.getItem(this.rememberMeKey) === 'true';
  }

  getAuthenticatedEmail(): string {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      return '';
    }

    return this.extractSubjectFromToken(accessToken);
  }

  private persistSession(response: AuthResponse, email: string, rememberMe: boolean): void {
    this.logout();

    const targetStorage = rememberMe ? localStorage : sessionStorage;

    targetStorage.setItem(this.accessTokenKey, response.accessToken);
    targetStorage.setItem(this.refreshTokenKey, response.refreshToken);

    if (rememberMe) {
      localStorage.setItem(this.rememberMeKey, 'true');
      localStorage.setItem(this.rememberedEmailKey, email);
      return;
    }

    localStorage.removeItem(this.rememberMeKey);
    localStorage.removeItem(this.rememberedEmailKey);
  }

  private extractSubjectFromToken(token: string): string {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return '';
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      );
      const decodedPayload = atob(paddedPayload);
      const parsedPayload = JSON.parse(decodedPayload) as { sub?: string };

      return parsedPayload.sub ?? '';
    } catch {
      return '';
    }
  }
}

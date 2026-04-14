import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiMessageResponse, ApiResponse } from '../models/api-response.model';
import { AppNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/notifications';

  listarNotificacoes(): Observable<AppNotification[]> {
    return this.http.get<ApiResponse<AppNotification[]>>(this.apiUrl).pipe(
      map((response) => Array.isArray(response.data) ? response.data : [])
    );
  }

  marcarComoLida(notificationId: number): Observable<void> {
    return this.http.patch<ApiMessageResponse>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      map(() => void 0),
    );
  }
}

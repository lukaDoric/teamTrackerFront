import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'tt_token';

interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly token = signal<string | null>(
    this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null,
  );
  readonly isTeacher = computed(() => !!this.token());

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { username, password }).pipe(
      tap((res) => {
        if (this.isBrowser) localStorage.setItem(TOKEN_KEY, res.token);
        this.token.set(res.token);
      }),
    );
  }

  logout(): void {
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }
}

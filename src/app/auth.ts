import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'tt_token';

function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(payload)).exp;
    return typeof exp !== 'number' || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly token = signal<string | null>(this.readStoredToken());
  readonly isTeacher = computed(() => !!this.token());

  dropIfExpired(): void {
    const token = this.token();
    if (token && isExpired(token)) this.logout();
  }

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

  private readStoredToken(): string | null {
    if (!this.isBrowser) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && isExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return token;
  }
}

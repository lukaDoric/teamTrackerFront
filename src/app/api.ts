import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Team } from './models';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  createCourse(code: string, name: string, description?: string): Observable<Course> {
    return this.http.post<Course>('/api/courses', {
      code,
      name,
      description: description ?? null,
    });
  }

  createTeam(name: string, courseId?: number): Observable<Team> {
    return this.http.post<Team>('/api/teams', { name, courseId: courseId ?? null });
  }

  importRepository(fullName: string, teamId: number): Observable<unknown> {
    return this.http.post('/api/repositories/import', { fullName, teamId });
  }
}

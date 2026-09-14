import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, RefreshStatus, RetrospectiveDetail, ReviewAssessment, Team } from './models';

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

  refresh(repoId: number): Observable<unknown> {
    return this.http.post(`/api/repositories/${repoId}/refresh`, {});
  }

  refreshStatus(repoId: number): Observable<RefreshStatus> {
    return this.http.get<RefreshStatus>(`/api/repositories/${repoId}/refresh-status`);
  }

  getCiReviewAssessment(repoId: number, number: number): Observable<ReviewAssessment | null> {
    return this.http.get<ReviewAssessment | null>(
      `/api/repositories/${repoId}/pullrequests/${number}/ci-review-assessment`,
    );
  }

  setAnnotation(repoId: number, number: number, comment: string, isPublic: boolean): Observable<unknown> {
    return this.http.put(
      `/api/repositories/${repoId}/pullrequests/${number}/annotation`,
      { comment, isPublic },
    );
  }

  deleteAnnotation(repoId: number, number: number): Observable<unknown> {
    return this.http.delete(`/api/repositories/${repoId}/pullrequests/${number}/annotation`);
  }

  analyzeRetrospective(teamId: number, file: File): Observable<RetrospectiveDetail> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<RetrospectiveDetail>(`/api/teams/${teamId}/retrospectives`, form);
  }
}

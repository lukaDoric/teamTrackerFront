import { Component, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Api } from '../../api';
import { Course, RepositoryListItem, Team } from '../../models';

@Component({
  selector: 'app-manage',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './manage.html',
  styleUrl: './manage.css',
})
export class Manage {
  private api = inject(Api);

  readonly courses = httpResource<Course[]>(() => (this.api.isBrowser ? '/api/courses' : undefined));
  readonly teams = httpResource<Team[]>(() => (this.api.isBrowser ? '/api/teams' : undefined));
  readonly repositories = httpResource<RepositoryListItem[]>(() =>
    this.api.isBrowser ? '/api/repositories' : undefined,
  );

  readonly courseCode = signal('');
  readonly courseName = signal('');
  readonly courseDesc = signal('');

  readonly teamName = signal('');
  readonly teamCourseId = signal<number | null>(null);

  readonly importFullName = signal('');
  readonly importTeamId = signal<number | null>(null);

  readonly busy = signal(false);

  courseLabel(courseId: number | null): string {
    if (courseId == null) return '—';
    const c = (this.courses.value() ?? []).find((x) => x.id === courseId);
    return c ? `${c.code} — ${c.name}` : String(courseId);
  }

  createCourse(): void {
    const code = this.courseCode().trim();
    const name = this.courseName().trim();
    if (!code || !name) return;
    this.busy.set(true);
    this.api.createCourse(code, name, this.courseDesc().trim() || undefined).subscribe({
      next: () => {
        this.courseCode.set('');
        this.courseName.set('');
        this.courseDesc.set('');
        this.courses.reload();
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  createTeam(): void {
    const name = this.teamName().trim();
    if (!name) return;
    this.busy.set(true);
    this.api.createTeam(name, this.teamCourseId() ?? undefined).subscribe({
      next: () => {
        this.teamName.set('');
        this.teamCourseId.set(null);
        this.teams.reload();
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  importRepo(): void {
    const fullName = this.importFullName().trim();
    const teamId = this.importTeamId();
    if (!fullName || teamId == null) return;
    this.busy.set(true);
    this.api.importRepository(fullName, teamId).subscribe({
      next: () => {
        this.importFullName.set('');

        setTimeout(() => {
          this.repositories.reload();
          this.busy.set(false);
        }, 1500);
      },
      error: () => this.busy.set(false),
    });
  }
}

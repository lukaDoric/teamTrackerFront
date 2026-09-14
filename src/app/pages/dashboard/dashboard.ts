import { Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Api } from '../../api';
import { Course, RepositoryListItem, Team } from '../../models';

interface TeamWithRepos extends Team {
  repos: RepositoryListItem[];
}

interface CourseGroup {
  id: number;
  code: string;
  name: string;
  description: string | null;
  teams: TeamWithRepos[];
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private api = inject(Api);

  readonly courses = httpResource<Course[]>(() => (this.api.isBrowser ? '/api/courses' : undefined));
  readonly teams = httpResource<Team[]>(() => (this.api.isBrowser ? '/api/teams' : undefined));
  readonly repositories = httpResource<RepositoryListItem[]>(() =>
    this.api.isBrowser ? '/api/repositories' : undefined,
  );

  readonly expanded = signal<number | null>(null);

  readonly loading = computed(
    () => this.courses.isLoading() || this.teams.isLoading() || this.repositories.isLoading(),
  );

  readonly groups = computed<CourseGroup[]>(() => {
    const courses = this.courses.value() ?? [];
    const teams = this.teams.value() ?? [];
    const repos = this.repositories.value() ?? [];

    const withRepos = (t: Team): TeamWithRepos => ({
      ...t,
      repos: repos.filter((r) => r.teamId === t.id),
    });

    const groups: CourseGroup[] = courses.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      teams: teams.filter((t) => t.courseId === c.id).map(withRepos),
    }));

    const orphans = teams.filter((t) => t.courseId == null).map(withRepos);
    if (orphans.length > 0) {
      groups.push({ id: -1, code: '—', name: 'Bez kursa', description: null, teams: orphans });
    }
    return groups;
  });

  toggle(id: number): void {
    this.expanded.update((cur) => (cur === id ? null : id));
  }
}

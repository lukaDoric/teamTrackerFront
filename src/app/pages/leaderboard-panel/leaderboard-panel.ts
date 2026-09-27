import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api';
import { Course, LeaderboardEntry, Paged, Team } from '../../models';
import { LeaderboardTable } from '../../components/leaderboard-table/leaderboard-table';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-leaderboard-panel',
  imports: [FormsModule, LeaderboardTable],
  templateUrl: './leaderboard-panel.html',
  styleUrl: './leaderboard-panel.css',
})
export class LeaderboardPanel {
  private api = inject(Api);

  readonly courses = httpResource<Course[]>(() => (this.api.isBrowser ? '/api/courses' : undefined));
  readonly teams = httpResource<Team[]>(() => (this.api.isBrowser ? '/api/teams' : undefined));

  readonly selectedCourseId = signal<number | null>(null);
  readonly selectedTeamId = signal<number | null>(null);

  readonly searchInput = signal('');
  readonly search = signal('');
  readonly page = signal(1);

  constructor() {
    effect((onCleanup) => {
      const v = this.searchInput();
      const t = setTimeout(() => {
        this.search.set(v.trim());
        this.page.set(1);
      }, 400);
      onCleanup(() => clearTimeout(t));
    });
  }

  readonly courseId = computed(
    () => this.selectedCourseId() ?? this.courses.value()?.[0]?.id ?? null,
  );

  readonly courseTeams = computed(() => {
    const cid = this.courseId();
    return (this.teams.value() ?? []).filter((t) => t.courseId === cid);
  });

  readonly result = httpResource<Paged<LeaderboardEntry>>(() => {
    if (!this.api.isBrowser) return undefined;
    const team = this.selectedTeamId();
    const course = this.courseId();
    const base =
      team != null
        ? `/api/teams/${team}/leaderboard`
        : course != null
          ? `/api/courses/${course}/leaderboard`
          : null;
    if (!base) return undefined;

    const q = new URLSearchParams({ page: String(this.page()), pageSize: String(PAGE_SIZE) });
    if (this.search()) q.set('search', this.search());
    return `${base}?${q.toString()}`;
  });

  readonly entries = computed<LeaderboardEntry[]>(() => this.result.value()?.items ?? []);
  readonly total = computed(() => this.result.value()?.total ?? 0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  onCourseChange(id: number | null): void {
    this.selectedCourseId.set(id);
    this.selectedTeamId.set(null);
    this.page.set(1);
  }

  onTeamChange(id: number | null): void {
    this.selectedTeamId.set(id);
    this.page.set(1);
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }
  nextPage(): void {
    this.page.update((p) => Math.min(this.totalPages(), p + 1));
  }
}

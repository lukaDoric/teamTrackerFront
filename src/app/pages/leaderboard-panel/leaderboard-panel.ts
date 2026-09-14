import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api';
import { Course, LeaderboardEntry, Paged, ReviewedPr, Team } from '../../models';
import { LeaderboardTable } from '../../components/leaderboard-table/leaderboard-table';

const PAGE_SIZE = 20;

const DEMO_REPO = 'lukaDoric/demo-app-psw';
const DEMO_TITLES = [
  'Add unit tests for OrderService',
  'Refactor PaymentProcessor',
  'Cover edge cases in validation',
  'Simplify RepositoryService',
  'Fix null handling in parser',
  'Extract helper from controller',
];

function mockPrs(count: number, cov: number, maint: number, note?: string): ReviewedPr[] {
  const out: ReviewedPr[] = [];
  for (let k = 0; k < count; k++) {
    out.push({
      number: 40 - k,
      title: DEMO_TITLES[k % DEMO_TITLES.length],
      repoId: 1,
      repoFullName: DEMO_REPO,
      coverageImproved: k < cov,
      maintainabilityImproved: k >= cov && k < cov + maint,
      instructorComment: k === 0 && note ? note : null,
      instructorCommentIsPublic: k === 0 && note ? true : null,
    });
  }
  return out;
}

function mockEntry(
  login: string,
  team: string,
  prsReviewed: number,
  comments: number,
  cov: number,
  maint: number,
  note?: string,
): LeaderboardEntry {
  return {
    login,
    prsReviewed,
    comments,
    coverageImprovements: cov,
    maintainabilityImprovements: maint,
    score: (cov + maint) * 3 + prsReviewed + comments,
    teams: [team],
    pullRequests: mockPrs(prsReviewed, cov, maint, note),
  };
}

const DEMO_EXTRA: LeaderboardEntry[] = [
  mockEntry('n.jovanovic', 'Tim Alfa', 12, 24, 3, 2, 'Odlična revizija — jasni komentari i traženi testovi.'),
  mockEntry('marko-petrovic', 'Tim Alfa', 9, 18, 2, 2),
  mockEntry('ana.ilic', 'Tim Beta', 11, 15, 2, 1, 'Uočila ozbiljan bag u parseru.'),
  mockEntry('stefan99', 'Tim Beta', 7, 12, 1, 1),
  mockEntry('jelena.kostic', 'Tim Gama', 6, 9, 1, 0),
];

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

  readonly entries = computed<LeaderboardEntry[]>(() => {
    const real = this.result.value()?.items ?? [];
    return [...real, ...DEMO_EXTRA].sort((a, b) => b.score - a.score);
  });
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

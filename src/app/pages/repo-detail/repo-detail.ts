import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../api';
import { Paged, PrOverviewRow, ProcessMetrics, RepositoryListItem, ReviewAssessment } from '../../models';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-repo-detail',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './repo-detail.html',
  styleUrl: './repo-detail.css',
})
export class RepoDetail {
  private api = inject(Api);

  readonly id = input.required<string>();
  readonly repoId = computed(() => Number(this.id()));

  readonly busy = signal(false);
  readonly phase = signal<string | null>(null);
  readonly expanded = signal<number | null>(null);

  readonly noteText = signal('');
  readonly notePublic = signal(true);
  readonly noteBusy = signal(false);

  readonly searchInput = signal('');
  readonly search = signal('');
  readonly page = signal(1);

  readonly assessment = signal<ReviewAssessment | null>(null);
  readonly assessBusy = signal(false);
  readonly assessError = signal<string | null>(null);

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

  readonly overview = httpResource<Paged<PrOverviewRow>>(() => {
    if (!this.api.isBrowser) return undefined;
    const q = new URLSearchParams({
      page: String(this.page()),
      pageSize: String(PAGE_SIZE),
    });
    if (this.search()) q.set('search', this.search());
    return `/api/repositories/${this.repoId()}/pr-overview?${q.toString()}`;
  });

  readonly metrics = httpResource<ProcessMetrics>(() =>
    this.api.isBrowser ? `/api/repositories/${this.repoId()}/process-metrics` : undefined,
  );

  private readonly repositories = httpResource<RepositoryListItem[]>(() =>
    this.api.isBrowser ? '/api/repositories' : undefined,
  );
  readonly repoFullName = computed(
    () => this.repositories.value()?.find((r) => r.id === this.repoId())?.fullName ?? null,
  );

  readonly rows = computed<PrOverviewRow[]>(() => this.overview.value()?.items ?? []);
  readonly total = computed(() => this.overview.value()?.total ?? 0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));

  toggle(r: PrOverviewRow): void {
    if (this.expanded() === r.number) {
      this.expanded.set(null);
      return;
    }
    this.expanded.set(r.number);
    this.noteText.set(r.annotation?.comment ?? '');
    this.notePublic.set(r.annotation?.isPublic ?? true);

    this.assessment.set(null);
    this.assessError.set(null);
    this.api.getCiReviewAssessment(this.repoId(), r.number).subscribe({
      next: (a) => this.assessment.set(a),
      error: () => {},
    });
  }

  pullFromCi(number: number): void {
    this.assessBusy.set(true);
    this.assessError.set(null);
    this.api.getCiReviewAssessment(this.repoId(), number).subscribe({
      next: (a) => {
        if (a) this.assessment.set(a);
        else this.assessError.set('Nema CI procene za ovaj PR (možda još nije pokrenuta ili je artefakt istekao).');
        this.assessBusy.set(false);
      },
      error: () => {
        this.assessError.set('Povlačenje iz CI-ja nije uspelo.');
        this.assessBusy.set(false);
      },
    });
  }

  saveNote(number: number): void {
    const text = this.noteText().trim();
    if (!text) return;
    this.noteBusy.set(true);
    this.api.setAnnotation(this.repoId(), number, text, this.notePublic()).subscribe({
      next: () => {
        this.overview.reload();
        this.noteBusy.set(false);
      },
      error: () => this.noteBusy.set(false),
    });
  }

  removeNote(number: number): void {
    this.noteBusy.set(true);
    this.api.deleteAnnotation(this.repoId(), number).subscribe({
      next: () => {
        this.noteText.set('');
        this.overview.reload();
        this.noteBusy.set(false);
      },
      error: () => this.noteBusy.set(false),
    });
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }
  nextPage(): void {
    this.page.update((p) => Math.min(this.totalPages(), p + 1));
  }

  prUrl(number: number): string | null {
    const fullName = this.repoFullName();
    return fullName ? `https://github.com/${fullName}/pull/${number}` : null;
  }

  refresh(): void {
    this.busy.set(true);
    this.phase.set('sync');
    this.api.refresh(this.repoId()).subscribe({
      next: () => this.poll(),
      error: () => this.finishRefresh(),
    });
  }

  private poll(): void {
    this.api.refreshStatus(this.repoId()).subscribe({
      next: (s) => {
        if (s.state === 'running') {
          this.phase.set(s.phase);
          setTimeout(() => this.poll(), 1500);
        } else {
          this.finishRefresh();
        }
      },
      error: () => this.finishRefresh(),
    });
  }

  private finishRefresh(): void {
    this.overview.reload();
    this.metrics.reload();
    this.busy.set(false);
    this.phase.set(null);
  }

  pct(x: number | null): string {
    return x == null ? '—' : (x * 100).toFixed(1) + '%';
  }
  deltaPct(x: number | null): string {
    if (x == null) return '—';
    return (x > 0 ? '+' : '') + (x * 100).toFixed(1) + '%';
  }
  num(x: number | null | undefined): string {
    return x == null ? '—' : (Math.round(x * 100) / 100).toString();
  }
  hours(x: number | null | undefined): string {
    if (x == null) return '—';
    if (x < 1) return Math.round(x * 60) + ' min';
    if (x < 48) return x.toFixed(1) + ' h';
    return (x / 24).toFixed(1) + ' d';
  }
}

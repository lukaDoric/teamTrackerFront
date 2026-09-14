import { Component, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Api } from '../../api';
import { RetrospectiveDetail, RetrospectiveListItem, Team } from '../../models';

type Criticality = 'low' | 'medium' | 'high';

@Component({
  selector: 'app-retrospectives',
  imports: [FormsModule, DatePipe],
  templateUrl: './retrospectives.html',
  styleUrl: './retrospectives.css',
})
export class Retrospectives {
  private api = inject(Api);

  readonly teams = httpResource<Team[]>(() => (this.api.isBrowser ? '/api/teams' : undefined));

  readonly teamId = signal<number | null>(null);
  readonly file = signal<File | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  readonly expanded = signal<string | null>(null);

  readonly analyses = httpResource<RetrospectiveListItem[]>(() =>
    this.api.isBrowser && this.teamId() != null
      ? `/api/teams/${this.teamId()}/retrospectives`
      : undefined,
  );

  readonly detail = httpResource<RetrospectiveDetail>(() =>
    this.api.isBrowser && this.selectedId() != null
      ? `/api/retrospectives/${this.selectedId()}`
      : undefined,
  );

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.[0] ?? null);
  }

  analyze(): void {
    const teamId = this.teamId();
    const file = this.file();
    if (teamId == null || !file) return;
    this.busy.set(true);
    this.error.set(null);
    this.api.analyzeRetrospective(teamId, file).subscribe({
      next: (res) => {
        this.selectedId.set(res.id);
        this.analyses.reload();
        this.busy.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Analiza nije uspela.');
        this.busy.set(false);
      },
    });
  }

  view(id: number): void {
    this.selectedId.set(id);
    this.expanded.set(null);
  }

  toggle(sprint: string, component: string): void {
    const key = `${sprint}::${component}`;
    this.expanded.update((cur) => (cur === key ? null : key));
  }

  isOpen(sprint: string, component: string): boolean {
    return this.expanded() === `${sprint}::${component}`;
  }

  critLabel(level: Criticality): string {
    return level === 'high' ? 'Kritično' : level === 'medium' ? 'Pažnja' : 'Nisko';
  }

  sectionLabel(section: string): string {
    return section === 'dobro' ? 'Dobro' : section === 'lose' ? 'Loše' : 'Bolje';
  }
}

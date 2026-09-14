import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    const u = this.username().trim();
    const p = this.password();
    if (!u || !p) return;
    this.busy.set(true);
    this.error.set(null);
    this.auth.login(u, p).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err?.error?.error ?? 'Prijava nije uspela.');
      },
    });
  }
}

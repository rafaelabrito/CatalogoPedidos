import { Injectable, computed, signal } from '@angular/core';

export type FeedbackSeverity = 'success' | 'error' | 'info';

interface FeedbackState {
  message: string;
  severity: FeedbackSeverity;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly state = signal<FeedbackState | null>(null);

  readonly current = computed(() => this.state());

  show(severity: FeedbackSeverity, message: string): void {
    this.state.set({ severity, message });
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  clear(): void {
    this.state.set(null);
  }
}
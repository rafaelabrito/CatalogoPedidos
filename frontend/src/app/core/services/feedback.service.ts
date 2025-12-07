import { Injectable, computed, signal } from '@angular/core';

export type FeedbackSeverity = 'success' | 'error' | 'info';

interface FeedbackState {
  message: string;
  severity: FeedbackSeverity;
  correlationId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly state = signal<FeedbackState | null>(null);

  readonly current = computed(() => this.state());

  show(severity: FeedbackSeverity, message: string, correlationId?: string | null): void {
    this.state.set({ severity, message, correlationId: correlationId ?? null });
  }

  success(message: string, correlationId?: string | null): void {
    this.show('success', message, correlationId);
  }

  error(message: string, correlationId?: string | null): void {
    this.show('error', message, correlationId);
  }

  info(message: string, correlationId?: string | null): void {
    this.show('info', message, correlationId);
  }

  clear(): void {
    this.state.set(null);
  }
}
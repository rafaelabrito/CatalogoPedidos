import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CorrelationIdService {
  static readonly headerName = 'X-Correlation-ID';

  private readonly currentId = signal<string | null>(null);

  readonly id = computed(() => this.currentId());

  /**
   * Returns the header key used for correlation IDs.
   */
  get headerName(): string {
    return CorrelationIdService.headerName;
  }

  /**
   * Returns the correlation id currently tracked by the client.
   */
  getCurrent(): string | null {
    return this.currentId();
  }

  /**
   * Ensures the outgoing request carries a correlation id, generating a new one when needed.
   */
  prepareRequest(existingCorrelationId?: string | null): string {
    if (existingCorrelationId && existingCorrelationId.trim().length > 0) {
      this.currentId.set(existingCorrelationId);
      return existingCorrelationId;
    }

    const generated = this.generateCorrelationId();
    this.currentId.set(generated);
    return generated;
  }

  /**
   * Updates the current correlation id with the value provided by the backend response.
   */
  updateFromResponse(correlationId?: string | null): void {
    if (correlationId && correlationId.trim().length > 0) {
      this.currentId.set(correlationId);
    }
  }

  private generateCorrelationId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    // Simple fallback for environments without crypto.randomUUID (e.g., older browsers/tests)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
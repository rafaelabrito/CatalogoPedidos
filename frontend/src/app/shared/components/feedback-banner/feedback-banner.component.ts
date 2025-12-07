import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-feedback-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible()" class="feedback-wrapper">
      <div
        class="feedback-banner"
        [ngClass]="{
          'feedback-success': severity() === 'success',
          'feedback-error': severity() === 'error',
          'feedback-info': severity() === 'info'
        }"
        [attr.role]="severity() === 'error' ? 'alert' : 'status'"
        [attr.aria-live]="severity() === 'error' ? 'assertive' : 'polite'"
      >
        <div class="message-wrapper">
          <span class="message">{{ message() }}</span>
          <span *ngIf="correlationId()" class="correlation-id">
            ID de correlação: {{ correlationId() }}
          </span>
        </div>
        <button type="button" class="close-btn" (click)="dismiss()" aria-label="Fechar alerta">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [`
    .feedback-wrapper {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 1050;
      max-width: 420px;
    }

    .feedback-banner {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      font-size: 0.95rem;
    }

    .message-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      line-height: 1.4;
    }

    .message {
      font-weight: 500;
    }

    .correlation-id {
      font-size: 0.8125rem;
      color: inherit;
      opacity: 0.85;
    }

    .feedback-success {
      background-color: #d1e7dd;
      color: #0f5132;
      border: 1px solid #badbcc;
    }

    .feedback-error {
      background-color: #f8d7da;
      color: #842029;
      border: 1px solid #f5c2c7;
    }

    .feedback-info {
      background-color: #cff4fc;
      color: #055160;
      border: 1px solid #b6effb;
    }

    .close-btn {
      border: none;
      background: transparent;
      color: inherit;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }

    .close-btn:focus {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    @media (max-width: 768px) {
      .feedback-wrapper {
        left: 1rem;
        right: 1rem;
        top: auto;
        bottom: 1.5rem;
      }
    }
  `]
})
export class FeedbackBannerComponent {
  private readonly feedbackService = inject(FeedbackService);

  private readonly current = computed(() => this.feedbackService.current());

  readonly message = computed(() => this.current()?.message ?? '');
  readonly severity = computed(() => this.current()?.severity ?? 'info');
  readonly visible = computed(() => this.current() !== null);
  readonly correlationId = computed(() => this.current()?.correlationId ?? null);

  dismiss(): void {
    this.feedbackService.clear();
  }
}
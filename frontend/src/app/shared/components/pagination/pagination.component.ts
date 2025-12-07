// src/app/shared/components/pagination/pagination.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pagination" *ngIf="totalPages !== 0" aria-label="Paginação">
      <button
        type="button"
        class="page-btn"
        [disabled]="currentPage <= 1"
        (click)="goToPage(currentPage - 1)"
        aria-label="Página anterior"
      >
        « Anterior
      </button>

      <div class="pages">
        <button
          *ngFor="let page of visiblePages"
          type="button"
          class="page-number"
          [class.active]="page === currentPage"
          (click)="goToPage(page)"
          [attr.aria-current]="page === currentPage ? 'page' : null"
        >
          {{ page }}
        </button>
      </div>

      <button
        type="button"
        class="page-btn"
        [disabled]="currentPage >= totalPages"
        (click)="goToPage(currentPage + 1)"
        aria-label="Próxima página"
      >
        Próxima »
      </button>
    </nav>
  `,
  styles: [`
    .pagination { display: flex; align-items: center; justify-content: center; gap: .5rem; padding: 1rem; flex-wrap: wrap; }
    .page-btn { padding: .5rem .9rem; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; font-size: 0.95rem; }
    .page-btn:disabled { opacity: .45; cursor: not-allowed; }
    .pages { display: flex; gap: .25rem; }
    .page-number { padding: .4rem .75rem; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
    .page-number.active { background: #0d6efd; color: #fff; border-color: #0d6efd; font-weight: 600; }
    .page-number:hover:not(.active) { background: #f0f0f0; }
  `]
})
export class PaginationComponent {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  // Calcula a janela de páginas visíveis (até 7 botões) toda vez que as inputs mudam
  get visiblePages(): number[] {
    const total = Math.max(1, this.totalPages || 1);
    const current = Math.min(Math.max(1, this.currentPage || 1), total);
    const windowSize = 7;

    if (total <= windowSize) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  goToPage(page: number): void {
    const newPage = Math.min(Math.max(1, page), Math.max(1, this.totalPages));
    if (newPage !== this.currentPage) {
      this.pageChange.emit(newPage);
    }
  }
}

// src/app/shared/components/paginator/paginator.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="paginator" *ngIf="totalPages > 1">
      <button 
        [disabled]="currentPage === 1" 
        (click)="onPageChange(currentPage - 1)">
        Anterior
      </button>
      
      <span class="page-info">
        Página {{ currentPage }} de {{ totalPages }}
      </span>
      
      <button 
        [disabled]="currentPage === totalPages" 
        (click)="onPageChange(currentPage + 1)">
        Próxima
      </button>
    </div>
  `,
  styles: [`
    .paginator {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      padding: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      background-color: #fff;
      cursor: pointer;
      border-radius: 4px;
    }

    button:hover:not(:disabled) {
      background-color: #f0f0f0;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 0.9rem;
      color: #666;
    }
  `]
})
export class PaginatorComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}

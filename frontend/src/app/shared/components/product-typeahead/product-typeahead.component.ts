import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-typeahead',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="typeahead-container">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Buscar produtos..."
          [(ngModel)]="searchTerm"
          (input)="onSearchChange($event)"
          aria-label="Buscar produtos"
        />
        <button
          *ngIf="searchTerm"
          type="button"
          class="clear-btn"
          (click)="clearSearch()"
          aria-label="Limpar busca"
        >
          ✕
        </button>
      </div>
      <div class="search-info" *ngIf="isSearching">
        <span class="searching-text">Buscando...</span>
      </div>
    </div>
  `,
  styles: [`
    .typeahead-container {
      width: 100%;
      max-width: 500px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background-color: white;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      transition: border-color 0.2s ease;
    }

    .search-box:focus-within {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    .search-icon {
      width: 20px;
      height: 20px;
      color: #6c757d;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      color: #212529;
      background: transparent;
    }

    .search-input::placeholder {
      color: #6c757d;
    }

    .clear-btn {
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0;
      margin-left: 0.5rem;
      line-height: 1;
      transition: color 0.2s ease;
    }

    .clear-btn:hover {
      color: #212529;
    }

    .search-info {
      margin-top: 0.5rem;
      padding: 0.25rem 0.5rem;
    }

    .searching-text {
      font-size: 0.875rem;
      color: #6c757d;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .typeahead-container {
        max-width: 100%;
      }

      .search-input {
        font-size: 0.9375rem;
      }
    }
  `]
})
export class ProductTypeaheadComponent implements OnDestroy {
  @Output() searchChange = new EventEmitter<string>();
  
  searchTerm: string = '';
  isSearching: boolean = false;
  
  private searchSubject = new Subject<string>();

  constructor() {
    // Configura o pipeline RxJS com debounce e distinct
    this.searchSubject
      .pipe(
        debounceTime(300),           // Aguarda 300ms após o usuário parar de digitar
        distinctUntilChanged()        // Só emite se o valor realmente mudou
      )
      .subscribe(term => {
        this.isSearching = false;
        this.searchChange.emit(term.trim());
      });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.isSearching = value.length > 0;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.searchChange.emit('');
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}

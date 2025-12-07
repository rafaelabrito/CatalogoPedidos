// src/app/shared/components/filter-bar/filter-bar.component.ts

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="filter-bar" [formGroup]="filterForm">
      <div class="filter-group">
        <label for="searchTerm">Buscar:</label>
        <input 
          id="searchTerm"
          type="text" 
          formControlName="searchTerm" 
          placeholder="Nome ou SKU do produto..."
          class="form-control">
      </div>

      <div class="filter-group">
        <label for="orderBy">Ordenar por:</label>
        <select id="orderBy" formControlName="orderBy" class="form-control">
          <option value="name">Nome</option>
          <option value="sku">SKU</option>
          <option value="price">Preço</option>
          <option value="stockQty">Estoque</option>
          <option value="createdAt">Criado em</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="sortDirection">Direção:</label>
        <select id="sortDirection" formControlName="sortDirection" class="form-control">
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="status">Status:</label>
        <select id="status" formControlName="status" class="form-control">
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="all">Todos</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 200px;
      flex: 1;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
    }

    @media (max-width: 768px) {
      .filter-bar {
        flex-direction: column;
        gap: 0.75rem;
      }

      .filter-group {
        width: 100%;
      }
    }
  `]
})
export class FilterBarComponent {
  @Output() filtersChanged = new EventEmitter<any>();

  filterForm = new FormGroup({
    searchTerm: new FormControl(''),
    orderBy: new FormControl('name'),
    sortDirection: new FormControl('asc'),
    status: new FormControl('active')
  });

  constructor() {
    // Emite mudanças quando o usuário digita (com debounce)
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(filters => {
        this.filtersChanged.emit(filters);
      });
  }
}

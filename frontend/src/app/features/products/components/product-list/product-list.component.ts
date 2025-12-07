// src/app/features/products/components/product-list/product-list.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductListItemDto } from '../../../../shared/models/api-models';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component'; // Componente compartilhado

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, PaginatorComponent],
  template: `
    <div class="product-table-wrapper">
      <table class="product-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>SKU</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of products">
            <td data-label="Nome">{{ product.name }}</td>
            <td data-label="SKU">{{ product.sku }}</td>
            <td data-label="Preço">{{ product.price | currency:'BRL' }}</td>
            <td data-label="Estoque">{{ product.stockQty }}</td>
            <td data-label="Ações">
              <button
                type="button"
                class="icon-button"
                aria-label="Editar produto"
                (click)="editClicked.emit(product.id)">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.21a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
                </svg>
                <span class="sr-only">Editar</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <app-paginator
      [totalItems]="totalCount"
      [pageSize]="pageSize"
      [currentPage]="pageNumber"
      (pageChange)="pageChanged.emit($event)">
    </app-paginator>
  `,
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  // Dados recebidos do Container
  @Input() products: ProductListItemDto[] = [];
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageNumber: number = 1;

  // Eventos emitidos para o Container
  @Output() pageChanged = new EventEmitter<number>();
  @Output() editClicked = new EventEmitter<string>();
}
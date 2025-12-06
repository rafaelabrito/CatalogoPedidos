import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListItemDto } from '../../models/api-models';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="product-table" role="table" aria-label="Tabela de produtos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>SKU</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th *ngIf="enableActions" class="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of products">
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.sku }}</td>
            <td>{{ product.price | currency:'BRL' }}</td>
            <td>{{ product.stockQty }}</td>
            <td *ngIf="enableActions" class="actions-cell">
              <button
                type="button"
                class="btn btn-edit"
                (click)="editRequested.emit(product)"
                [attr.aria-label]="'Editar produto ' + product.name">
                Editar
              </button>
              <button
                type="button"
                class="btn btn-delete"
                (click)="deleteRequested.emit(product.id)"
                [attr.aria-label]="'Excluir produto ' + product.name">
                Excluir
              </button>
            </td>
          </tr>
          <tr *ngIf="!products || products.length === 0">
            <td [attr.colspan]="enableActions ? 6 : 5" class="empty-message">Nenhum produto encontrado</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .product-table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
    }

    .product-table thead {
      background-color: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }

    .product-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .product-table tbody tr {
      border-bottom: 1px solid #dee2e6;
      transition: background-color 0.2s ease;
    }

    .product-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .product-table tbody tr:last-child {
      border-bottom: none;
    }

    .product-table td {
      padding: 1rem;
      color: #212529;
      font-size: 0.9375rem;
    }

    .actions-header {
      text-align: center;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      align-items: center;
    }

    .btn {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s ease;
    }

    .btn-edit {
      background-color: #0d6efd;
      color: #fff;
    }

    .btn-edit:hover {
      background-color: #0b5ed7;
    }

    .btn-delete {
      background-color: #dc3545;
      color: #fff;
    }

    .btn-delete:hover {
      background-color: #bb2d3b;
    }

    .empty-message {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      padding: 2rem !important;
    }

    @media (max-width: 768px) {
      .product-table th,
      .product-table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class ProductTableComponent {
  @Input() products: ProductListItemDto[] = [];
  @Input() enableActions = false;

  @Output() editRequested = new EventEmitter<ProductListItemDto>();
  @Output() deleteRequested = new EventEmitter<string>();
}

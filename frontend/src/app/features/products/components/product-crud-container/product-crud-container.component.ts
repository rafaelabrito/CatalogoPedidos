import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { ProductListItemDto, PagedResult, ListProductsQuery } from '../../../../shared/models/api-models';
import { BehaviorSubject, switchMap, map, catchError, of, startWith, EMPTY, take } from 'rxjs';

interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-product-crud-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent, FilterBarComponent],
  template: `
    <div class="product-crud-container">
      <div class="header-section">
        <h2>Gestão de Produtos</h2>
        <button class="btn btn-primary" (click)="openCreateModal()">
          + Novo Produto
        </button>
      </div>

      <app-filter-bar (filtersChanged)="onFiltersChanged($event)"></app-filter-bar>

      <div *ngIf="loading()" class="loading">Carregando produtos...</div>
      <div *ngIf="error()" class="error">{{ error() }}</div>

      <div *ngIf="!loading() && productsResult()">
        <div class="results-summary">
          {{ productsResult()!.totalCount || 0 }}
          {{ (productsResult()!.totalCount || 0) === 1 ? 'item encontrado' : 'itens encontrados' }}
        </div>
        <div class="table-wrapper">
          <table class="crud-table" role="table" aria-label="Lista de produtos">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nome</th>
                <th scope="col">SKU</th>
                <th scope="col">Preço</th>
                <th scope="col">Estoque</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of productsResult()?.items">
                <td data-label="ID">{{ product.id }}</td>
                <td data-label="Nome">{{ product.name }}</td>
                <td data-label="SKU">{{ product.sku }}</td>
                <td data-label="Preço">{{ product.price | currency:'BRL' }}</td>
                <td data-label="Estoque">{{ product.stockQty }}</td>
                <td class="actions" data-label="Ações">
                  <button class="btn-edit" 
                          (click)="openEditModal(product)"
                          [attr.aria-label]="'Editar produto ' + product.name"
                          type="button">Editar</button>
                  <button class="btn-delete" 
                          (click)="deleteProduct(product.id)"
                          [attr.aria-label]="'Excluir produto ' + product.name"
                          type="button">Excluir</button>
                </td>
              </tr>
              <tr *ngIf="(productsResult()?.items?.length ?? 0) === 0">
                <td colspan="6" class="empty-message">Nenhum produto encontrado</td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-pagination
          *ngIf="productsResult()"
          [totalPages]="productsResult()!.totalPages"
          [currentPage]="productsResult()!.pageNumber"
          (pageChange)="onPageChanged($event)">
        </app-pagination>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" 
           *ngIf="showModal()" 
           (click)="closeModal()"
           role="dialog"
           aria-modal="true"
           [attr.aria-labelledby]="isEditMode() ? 'modal-edit-title' : 'modal-create-title'">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 [id]="isEditMode() ? 'modal-edit-title' : 'modal-create-title'">{{ isEditMode() ? 'Editar Produto' : 'Novo Produto' }}</h3>
            <button class="close-btn" 
                    (click)="closeModal()" 
                    (keydown.enter)="closeModal()" 
                    (keydown.space)="closeModal(); $event.preventDefault()"
                    aria-label="Fechar modal"
                    type="button">×</button>
          </div>
          
          <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
            <div class="form-group">
              <label for="name">Nome *</label>
              <input 
                id="name" 
                type="text" 
                formControlName="name" 
                class="form-control"
                aria-required="true"
                aria-describedby="name-error"
                [class.invalid]="productForm.get('name')?.invalid && productForm.get('name')?.touched">
              <div id="name-error" class="error-message" *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched" role="alert">
                Nome é obrigatório
              </div>
            </div>

            <div class="form-group">
              <label for="sku">SKU *</label>
              <input 
                id="sku" 
                type="text" 
                formControlName="sku" 
                class="form-control"
                aria-required="true"
                aria-describedby="sku-error"
                [class.invalid]="productForm.get('sku')?.invalid && productForm.get('sku')?.touched">
              <div id="sku-error" class="error-message" *ngIf="productForm.get('sku')?.invalid && productForm.get('sku')?.touched" role="alert">
                SKU é obrigatório
              </div>
            </div>

            <div class="form-group">
              <label for="price">Preço *</label>
              <input 
                id="price" 
                type="number" 
                step="0.01"
                formControlName="price" 
                class="form-control"
                aria-required="true"
                aria-describedby="price-error"
                [class.invalid]="productForm.get('price')?.invalid && productForm.get('price')?.touched">
              <div id="price-error" class="error-message" *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched" role="alert">
                Preço deve ser maior que zero
              </div>
            </div>

            <div class="form-group">
              <label for="stockQty">Estoque *</label>
              <input 
                id="stockQty" 
                type="number" 
                formControlName="stockQty" 
                class="form-control"
                aria-required="true"
                aria-describedby="stockQty-error"
                [class.invalid]="productForm.get('stockQty')?.invalid && productForm.get('stockQty')?.touched">
              <div id="stockQty-error" class="error-message" *ngIf="productForm.get('stockQty')?.invalid && productForm.get('stockQty')?.touched" role="alert">
                Estoque deve ser zero ou maior
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  id="isActive"
                  type="checkbox"
                  formControlName="isActive"
                  class="checkbox-input"
                  aria-describedby="isActive-help">
                <span>Produto ativo</span>
              </label>
              <small id="isActive-help" class="help-text">Desmarque para ocultar o produto do catálogo.</small>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || saving()">
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-crud-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h2 {
      color: #333;
      margin: 0;
      font-size: 1.75rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background-color: #0d6efd;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0b5ed7;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5c636a;
    }

    .loading, .error {
      text-align: center;
      padding: 2rem;
      margin: 2rem 0;
    }

    .error {
      color: #dc3545;
      background-color: #f8d7da;
      border-radius: 4px;
    }

    .table-wrapper {
      overflow-x: auto;
      margin: 2rem 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .results-summary {
      margin: 1rem 0 0.5rem;
      font-weight: 500;
      color: #495057;
    }


    .crud-table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
    }

    .crud-table thead {
      background-color: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }

    .crud-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .crud-table tbody tr {
      border-bottom: 1px solid #dee2e6;
      transition: background-color 0.2s ease;
    }

    .crud-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .crud-table td {
      padding: 1rem;
      color: #212529;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit, .btn-delete {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .btn-edit {
      background-color: #0d6efd;
      color: white;
    }

    .btn-edit:hover {
      background-color: #0b5ed7;
    }

    .btn-delete {
      background-color: #dc3545;
      color: white;
    }

    .btn-delete:hover {
      background-color: #bb2d3b;
    }

    .empty-message {
      text-align: center;
      color: #6c757d;
      font-style: italic;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #6c757d;
      line-height: 1;
      padding: 0;
    }

    .close-btn:hover {
      color: #000;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #495057;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #dee2e6;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #0d6efd;
    }

    .form-control.invalid {
      border-color: #dc3545;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: -0.5rem;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-input {
      width: 1rem;
      height: 1rem;
    }

    .help-text {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .product-crud-container {
        padding: 0 1rem 2rem;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-section .btn-primary {
        width: 100%;
        text-align: center;
      }

      .table-wrapper {
        margin: 1rem 0;
        box-shadow: none;
        border-radius: 0;
      }

      .crud-table {
        display: block;
        background: none;
      }

      .crud-table thead {
        display: none;
      }

      .crud-table tbody {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .crud-table tbody tr {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 1rem;
        border: 1px solid #dee2e6;
        border-radius: 0.75rem;
        background-color: #fff;
      }

      .crud-table td {
        display: flex;
        flex-direction: column;
        padding: 0.35rem 0;
        border: none;
        font-size: 0.95rem;
        word-break: break-word;
      }

      .crud-table td::before {
        content: attr(data-label);
        font-size: 0.75rem;
        font-weight: 600;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 0.15rem;
      }

      .crud-table td.actions {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
      }
    }
  `]
})
export class ProductCrudContainerComponent implements OnInit {
  productsResult = signal<PagedResult<ProductListItemDto> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showModal = signal(false);
  isEditMode = signal(false);
  saving = signal(false);
  
  productForm: FormGroup;
  private querySubject = new BehaviorSubject<ListProductsQuery>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    orderBy: 'name',
    sortDirection: 'asc',
    isActive: true
  });

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      sku: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stockQty: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.querySubject.pipe(
      switchMap(query => {
        this.loading.set(true);
        this.error.set(null);
        return this.productService.listProducts(query).pipe(
          map(result => ({ result, error: null })),
          catchError(err => of({ result: null, error: err.message || 'Erro ao carregar produtos' }))
        );
      })
    ).subscribe(({ result, error }) => {
      this.loading.set(false);
      if (error) {
        this.error.set(error);
      } else {
        this.productsResult.set(result);
      }
    });
  }

  onFiltersChanged(filters: { searchTerm?: string; orderBy?: string; sortDirection?: string; status?: string }): void {
    const nextQuery: ListProductsQuery = {
      ...this.querySubject.value,
      searchTerm: filters.searchTerm ?? this.querySubject.value.searchTerm ?? '',
      orderBy: filters.orderBy ?? this.querySubject.value.orderBy ?? 'name',
      sortDirection: (filters.sortDirection as 'asc' | 'desc') ?? this.querySubject.value.sortDirection ?? 'asc',
      pageNumber: 1
    };

    const status = filters.status ?? 'active';
    if (status === 'all') {
      nextQuery.isActive = undefined;
      nextQuery.skipIsActiveDefault = true;
    } else {
      nextQuery.isActive = status === 'inactive' ? false : true;
      if (nextQuery.skipIsActiveDefault) {
        delete nextQuery.skipIsActiveDefault;
      }
    }

    this.querySubject.next(nextQuery);
  }

  onPageChanged(pageNumber: number): void {
    this.querySubject.next({
      ...this.querySubject.value,
      pageNumber
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.productForm.reset({
      id: null,
      name: '',
      sku: '',
      price: 0,
      stockQty: 0,
      isActive: true
    });
    this.showModal.set(true);
  }

  openEditModal(product: ProductListItemDto): void {
    this.isEditMode.set(true);
    this.productForm.patchValue({
      ...product,
      isActive: product.isActive ?? true
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.productForm.reset({ isActive: true });
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    this.saving.set(true);
    const formData = this.sanitizeProductData({ ...this.productForm.value });

    if (!this.isEditMode()) {
      delete formData.id;
    } else if (!formData.id) {
      this.error.set('Produto selecionado inválido. Tente novamente.');
      this.saving.set(false);
      return;
    }

    const excludeId = this.isEditMode() ? formData.id : undefined;

    this.productService.isSkuAvailable(formData.sku, excludeId).pipe(
      take(1),
      switchMap(isAvailable => {
        if (!isAvailable) {
          this.error.set('Já existe um produto com este SKU. Informe um código diferente.');
          this.saving.set(false);
          return EMPTY;
        }

        return this.isEditMode()
          ? this.productService.updateProduct(formData.id!, formData)
          : this.productService.createProduct(formData);
      })
    ).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.refreshList();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err.message || 'Erro ao salvar produto');
      }
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.refreshList();
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao excluir produto');
      }
    });
  }

  private refreshList(): void {
    this.querySubject.next({ ...this.querySubject.value });
  }

  private sanitizeProductData(data: ProductFormData): ProductFormData {
    const sanitizedName = (data.name ?? '').trim();
    const sanitizedSku = (data.sku ?? '').trim().toUpperCase();

    return {
      ...data,
      name: sanitizedName,
      sku: sanitizedSku,
      price: Number(data.price ?? 0),
      stockQty: Number(data.stockQty ?? 0),
      isActive: data.isActive ?? true
    };
  }
}

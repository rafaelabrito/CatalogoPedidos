import { Component, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomerService, CustomerListFilters, CustomerSortField, SortDirection } from '../services/customer.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { CustomerListItemDto, CustomerFormData } from '../../../shared/models/customer-models';
import { PagedResult } from '../../../shared/models/api-models';
import { BehaviorSubject, switchMap, map, catchError, of, debounceTime, distinctUntilChanged, take, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CustomersQueryState = {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortField: CustomerSortField;
  sortDirection: SortDirection;
  emailFilter: string;
  documentFilter: string;
  createdFrom: string | null;
  createdTo: string | null;
};

type CustomerFiltersFormValue = {
  sortField: CustomerSortField;
  sortDirection: SortDirection;
  email: string;
  document: string;
  createdFrom: string;
  createdTo: string;
};

@Component({
  selector: 'app-customer-crud-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent],
  template: `
    <div class="customer-crud-container">
      <div class="header-section">
        <h2>Gestão de Clientes</h2>
        <button class="btn btn-primary" (click)="openCreateModal()">
          + Novo Cliente
        </button>
      </div>

      <!-- <div class="search-section">
        <label for="customer-search" class="sr-only">Buscar cliente</label>
        <input
          id="customer-search"
          type="search"
          placeholder="pesquisar por nome, email ou documento..."
          class="search-input"
          aria-label="Buscar cliente"
          [formControl]="searchControl"
        />
      </div> -->

      <div class="filters-section" [formGroup]="filtersForm">
        <div class="filters-grid">
          <div class="filter-group">
            <!-- <label for="customer-search" class="sr-only">Buscar cliente</label> -->
            <label for="customer-search">Pesquisa</label>
            <input
              id="customer-search"
              type="search"
              placeholder="pesquisar por nome, email ou documento..."
              class="search-input"
              aria-label="Buscar cliente"
              [formControl]="searchControl"
            />
          </div>


          <div class="filter-group">
            <label for="sortField">Ordenação</label>
            <select id="sortField" formControlName="sortField" class="form-control">
              <option value="createdAt">Criado em</option>
              <option value="name">Nome</option>
              <option value="email">Email</option>
              <option value="document">Documento</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sortDirection">Direção</label>
            <select id="sortDirection" formControlName="sortDirection" class="form-control">
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigos</option>
            </select>
          </div>

          <!-- <div class="filter-group">
            <label for="emailFilter">Email</label>
            <input
              id="emailFilter"
              type="email"
              formControlName="email"
              placeholder="cliente@exemplo.com"
              class="form-control">
          </div> -->

          <!-- <div class="filter-group">
            <label for="documentFilter">Documento</label>
            <input
              id="documentFilter"
              type="text"
              formControlName="document"
              placeholder="Somente números"
              class="form-control">
          </div> -->

          <!-- <div class="filter-group">
            <label for="createdFrom">Criado a partir de</label>
            <input id="createdFrom" type="date" formControlName="createdFrom" class="form-control">
          </div> -->

          <!-- <div class="filter-group">
            <label for="createdTo">Criado até</label>
            <input id="createdTo" type="date" formControlName="createdTo" class="form-control">
          </div> -->
        </div>

        <div class="filters-actions">
          <button
            type="button"
            class="btn btn-link"
            (click)="clearFilters()"
            [disabled]="!hasActiveFilters()">
            Limpar filtros
          </button>
        </div>
      </div>

      <div *ngIf="dateRangeError()" class="filter-error">{{ dateRangeError() }}</div>

      <div *ngIf="loading()" class="loading">Carregando clientes...</div>
      <div *ngIf="error()" class="error">{{ error() }}</div>

      <div *ngIf="!loading() && customersResult()">
        <div class="results-summary">
          {{ customersResult()!.totalCount || 0 }}
          {{ (customersResult()!.totalCount || 0) === 1 ? 'cliente encontrado' : 'clientes encontrados' }}
        </div>
        <div class="table-wrapper">
          <table class="crud-table" role="table" aria-label="Lista de clientes">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nome</th>
                <th scope="col">Email</th>
                <th scope="col">Documento</th>
                <th scope="col">Criado em</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of customersResult()?.items">
                <td data-label="ID">{{ customer.id }}</td>
                <td data-label="Nome">{{ customer.name }}</td>
                <td data-label="Email">{{ customer.email }}</td>
                <td data-label="Documento">{{ customer.document }}</td>
                <td data-label="Criado em">{{ customer.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="actions" data-label="Ações">
                  <button
                    type="button"
                    class="action-button edit"
                    (click)="openEditModal(customer)"
                    [attr.aria-label]="'Editar cliente ' + customer.name">
                    Editar
                  </button>
                  <button
                    type="button"
                    class="action-button delete"
                    (click)="deleteCustomer(customer.id)"
                    [attr.aria-label]="'Excluir cliente ' + customer.name">
                    Excluir
                  </button>
                </td>
              </tr>
              <tr *ngIf="(customersResult()?.items?.length ?? 0) === 0">
                <td colspan="6" class="empty-message">Nenhum cliente encontrado</td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-pagination
          *ngIf="customersResult()"
          [totalPages]="customersResult()!.totalPages"
          [currentPage]="customersResult()!.pageNumber"
          (pageChange)="onPageChanged($event)">
        </app-pagination>
      </div>

      <div
        class="modal-overlay"
        *ngIf="showModal()"
        (click)="closeModal()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="isEditMode() ? 'modal-edit-title' : 'modal-create-title'">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 [id]="isEditMode() ? 'modal-edit-title' : 'modal-create-title'">
              {{ isEditMode() ? 'Editar Cliente' : 'Novo Cliente' }}
            </h3>
            <button
              class="close-btn"
              type="button"
              aria-label="Fechar modal"
              (click)="closeModal()"
              (keydown.enter)="closeModal()"
              (keydown.space)="closeModal(); $event.preventDefault()">
              ×
            </button>
          </div>

          <form [formGroup]="customerForm" (ngSubmit)="saveCustomer()">
            <div class="form-group">
              <label for="name">Nome *</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="form-control"
                aria-required="true"
                aria-describedby="name-error"
                [class.invalid]="customerForm.get('name')?.invalid && customerForm.get('name')?.touched">
              <div
                id="name-error"
                class="error-message"
                *ngIf="customerForm.get('name')?.invalid && customerForm.get('name')?.touched"
                role="alert">
                Nome é obrigatório
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-control"
                aria-required="true"
                aria-describedby="email-error"
                [class.invalid]="customerForm.get('email')?.invalid && customerForm.get('email')?.touched">
              <div
                id="email-error"
                class="error-message"
                *ngIf="customerForm.get('email')?.invalid && customerForm.get('email')?.touched"
                role="alert">
                Email válido é obrigatório
              </div>
            </div>

            <div class="form-group">
              <label for="document">Documento (CPF/CNPJ) *</label>
              <input
                id="document"
                type="text"
                formControlName="document"
                class="form-control"
                aria-required="true"
                aria-describedby="document-error"
                [class.invalid]="customerForm.get('document')?.invalid && customerForm.get('document')?.touched">
              <div
                id="document-error"
                class="error-message"
                *ngIf="customerForm.get('document')?.invalid && customerForm.get('document')?.touched"
                role="alert">
                Documento é obrigatório
              </div>
              <div
                class="error-message"
                *ngIf="documentDuplicateError()"
                role="alert">
                {{ documentDuplicateError() }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="customerForm.invalid || saving()">
                {{ saving() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customer-crud-container {
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

    .search-section {
      margin-bottom: 2rem;
    }

    .search-input {
      width: 100%;
      max-width: 500px;
      padding: 0.75rem 1rem;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #0d6efd;
    }

    .filters-section {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .filters-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: #0d6efd;
      padding: 0.25rem 0.5rem;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-link:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .filter-error {
      margin: -0.5rem 0 1.5rem;
      color: #dc3545;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }

    .results-summary {
      margin: 1rem 0 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
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

    .loading,
    .error {
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
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

    .action-button {
      padding: 0.4rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      color: #fff;
      min-width: 84px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    .action-button:focus-visible {
      outline: 2px solid rgba(13, 110, 253, 0.4);
      outline-offset: 2px;
    }

    .action-button.edit {
      background-color: #0d6efd;
    }

    .action-button.edit:hover {
      background-color: #0b5ed7;
      transform: translateY(-1px);
    }

    .action-button.delete {
      background-color: #dc3545;
    }

    .action-button.delete:hover {
      background-color: #bb2d3b;
      transform: translateY(-1px);
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

    textarea.form-control {
      resize: vertical;
    }

  `]
})
export class CustomerCrudContainerComponent implements OnInit {
  customersResult = signal<PagedResult<CustomerListItemDto> | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showModal = signal(false);
  isEditMode = signal(false);
  saving = signal(false);
  documentDuplicateError = signal<string | null>(null);
  dateRangeError = signal<string | null>(null);

  private readonly defaultSortField: CustomerSortField = 'createdAt';
  private readonly defaultSortDirection: SortDirection = 'desc';
  private readonly defaultPageSize = 10;

  customerForm: FormGroup;
  searchControl = new FormControl('');
  filtersForm: FormGroup;
  private querySubject = new BehaviorSubject<CustomersQueryState>({
    pageNumber: 1,
    pageSize: this.defaultPageSize,
    searchTerm: '',
    sortField: this.defaultSortField,
    sortDirection: this.defaultSortDirection,
    emailFilter: '',
    documentFilter: '',
    createdFrom: null,
    createdTo: null
  });

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private destroyRef: DestroyRef
  ) {
    this.customerForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      document: ['', Validators.required]
    });

    this.filtersForm = this.fb.group({
      sortField: [this.defaultSortField],
      sortDirection: [this.defaultSortDirection],
      email: [''],
      document: [''],
      createdFrom: [''],
      createdTo: ['']
    });

    this.customerForm.get('document')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.documentDuplicateError()) {
          this.clearDocumentDuplicateError();
        }
      });
  }

  ngOnInit(): void {
    this.searchControl.setValue(this.querySubject.value.searchTerm, { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(searchTerm => {
        this.querySubject.next({
          ...this.querySubject.value,
          searchTerm: searchTerm ?? '',
          pageNumber: 1
        });
      });

    this.filtersForm.valueChanges
      .pipe(
        debounceTime(200),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(values => {
        this.applyFilterChanges(values as Partial<CustomerFiltersFormValue>);
      });

    this.querySubject.pipe(
      switchMap(query => {
        this.loading.set(true);
        this.error.set(null);
        return this.customerService.listCustomers(
          query.pageNumber,
          query.pageSize,
          query.searchTerm,
          this.buildFiltersFromQuery(query)
        ).pipe(
          map(result => ({ result, error: null })),
          catchError(err => of({ result: null, error: err.message || 'Erro ao carregar clientes' }))
        );
      })
    ).subscribe(({ result, error }) => {
      this.loading.set(false);
      if (error) {
        this.error.set(error);
      } else {
        this.customersResult.set(result);
      }
    });
  }

  onPageChanged(pageNumber: number): void {
    this.querySubject.next({
      ...this.querySubject.value,
      pageNumber
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.customerForm.reset({
      id: null,
      name: '',
      email: '',
      document: ''
    });
    this.clearDocumentDuplicateError();
    this.showModal.set(true);
  }

  openEditModal(customer: CustomerListItemDto): void {
    this.isEditMode.set(true);
    this.customerService.getCustomerById(customer.id).subscribe({
      next: (data) => {
        this.customerForm.patchValue({
          ...data,
          document: this.normalizeDocument(data.document)
        });
        this.clearDocumentDuplicateError();
        this.showModal.set(true);
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao carregar cliente');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.customerForm.reset({
      id: null,
      name: '',
      email: '',
      document: ''
    });
    this.clearDocumentDuplicateError();
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) {
      return;
    }

    this.saving.set(true);
    this.clearDocumentDuplicateError();
    this.error.set(null);
    const formData = this.sanitizeCustomerData({ ...this.customerForm.value });
    const payload: CustomerFormData = {
      name: formData.name,
      email: formData.email,
      document: formData.document
    };

    if (!this.isEditMode()) {
      delete formData.id;
    } else if (!formData.id || !formData.id.trim()) {
      this.error.set('Cliente selecionado inválido. Tente novamente.');
      this.saving.set(false);
      return;
    }

    const excludeId = this.isEditMode() ? formData.id : undefined;

    this.customerService.isDocumentAvailable(formData.document, excludeId).pipe(
      take(1),
      switchMap(isAvailable => {
        if (!isAvailable) {
          this.setDocumentDuplicateError();
          this.saving.set(false);
          return EMPTY;
        }

        return this.isEditMode()
          ? this.customerService.updateCustomer(formData.id!, payload).pipe(map(() => ({ mode: 'update' as const, id: formData.id! })))
          : this.customerService.createCustomer(payload).pipe(map(id => ({ mode: 'create' as const, id })));
      })
    ).subscribe({
      next: ({ id }) => {
        this.saving.set(false);
        this.closeModal();
        const fallbackData: CustomerFormData = { ...payload, id };
        this.syncCustomerLocally(id, fallbackData);
        this.refreshList();
      },
      error: (err: any) => {
        this.saving.set(false);
        if (!this.tryHandleServerDuplicate(err)) {
          this.error.set(err?.message || 'Erro ao salvar cliente');
        }
      }
    });
  }

  deleteCustomer(id: string): void {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    this.customerService.deleteCustomer(id).subscribe({
      next: () => this.refreshList(),
      error: (err) => this.error.set(err.message || 'Erro ao excluir cliente')
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({
      sortField: this.defaultSortField,
      sortDirection: this.defaultSortDirection,
      email: '',
      document: '',
      createdFrom: '',
      createdTo: ''
    });
    this.dateRangeError.set(null);
  }

  hasActiveFilters(): boolean {
    const query = this.querySubject.value;
    return Boolean(
      query.emailFilter ||
      query.documentFilter ||
      query.createdFrom ||
      query.createdTo ||
      query.sortField !== this.defaultSortField ||
      query.sortDirection !== this.defaultSortDirection
    );
  }

  private refreshList(): void {
    this.querySubject.next({ ...this.querySubject.value });
  }

  private applyFilterChanges(filters: Partial<CustomerFiltersFormValue>): void {
    const sortField = (filters.sortField as CustomerSortField) ?? this.defaultSortField;
    const sortDirection = (filters.sortDirection as SortDirection) ?? this.defaultSortDirection;
    const email = (filters.email ?? '').trim();
    const document = this.normalizeDocument(filters.document ?? '');
    const createdFrom = filters.createdFrom || null;
    const createdTo = filters.createdTo || null;

    if (createdFrom && createdTo && createdFrom > createdTo) {
      this.dateRangeError.set('A data inicial não pode ser maior que a data final.');
      return;
    }

    this.dateRangeError.set(null);

    this.querySubject.next({
      ...this.querySubject.value,
      pageNumber: 1,
      sortField,
      sortDirection,
      emailFilter: email,
      documentFilter: document,
      createdFrom,
      createdTo
    });
  }

  private buildFiltersFromQuery(query: CustomersQueryState): CustomerListFilters {
    return {
      sortField: query.sortField,
      sortDirection: query.sortDirection,
      email: query.emailFilter || undefined,
      document: query.documentFilter || undefined,
      createdFrom: this.normalizeDateBoundary(query.createdFrom, false),
      createdTo: this.normalizeDateBoundary(query.createdTo, true)
    };
  }

  private normalizeDateBoundary(value?: string | null, endOfDay = false): string | undefined {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date.toISOString();
  }

  private sanitizeCustomerData(data: CustomerFormData): CustomerFormData {
    const sanitizedName = (data.name ?? '').trim();
    const sanitizedEmail = (data.email ?? '').trim().toLowerCase();
    const sanitizedDocument = this.normalizeDocument(data.document);
    const sanitizedId = this.normalizeId(data.id);

    return {
      ...data,
      id: sanitizedId,
      name: sanitizedName,
      email: sanitizedEmail,
      document: sanitizedDocument
    };
  }

  private normalizeId(value?: string | null): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalized = String(value).trim();
    if (!normalized) {
      return undefined;
    }

    const lower = normalized.toLowerCase();
    return lower === 'null' || lower === 'undefined' ? undefined : normalized;
  }

  private normalizeDocument(value: string): string {
    return (value ?? '').replace(/\D+/g, '');
  }

  private setDocumentDuplicateError(): void {
    const message = 'Já existe um cliente com este CPF/CNPJ.';
    this.documentDuplicateError.set(message);
    const control = this.customerForm.get('document');
    if (control) {
      const errors = { ...(control.errors ?? {}), duplicate: true };
      control.setErrors(errors);
      control.markAsTouched();
    }
  }

  private clearDocumentDuplicateError(): void {
    if (this.documentDuplicateError()) {
      this.documentDuplicateError.set(null);
    }
    const control = this.customerForm.get('document');
    if (control && control.errors) {
      const { duplicate, ...others } = control.errors;
      control.setErrors(Object.keys(others).length ? others : null);
    }
  }

  private tryHandleServerDuplicate(err: any): boolean {
    if (!err) {
      return false;
    }

    const httpError = err as HttpErrorResponse;
    const apiMessage = typeof httpError.error?.mensagem === 'string' ? httpError.error.mensagem : '';
    const normalized = `${apiMessage} ${httpError.message ?? ''}`.toLowerCase();
    const looksLikeDuplicate = httpError.status === 409
      || (httpError.status === 500 && normalized.includes('document'))
      || normalized.includes('duplic')
      || normalized.includes('cpf')
      || normalized.includes('cnpj');

    if (looksLikeDuplicate) {
      this.setDocumentDuplicateError();
      return true;
    }

    return false;
  }

  private syncCustomerLocally(id: string, fallback: CustomerFormData): void {
    this.customerService.getCustomerById(id).pipe(take(1)).subscribe({
      next: (data) => {
        const customer: CustomerListItemDto = {
          id: data.id ?? id,
          name: data.name,
          email: data.email,
          document: data.document,
          createdAt: data.createdAt ?? new Date().toISOString()
        };
        this.upsertCustomerLocally(customer);
      },
      error: () => {
        this.upsertCustomerLocally(this.buildListItemFromForm(id, fallback));
      }
    });
  }

  private buildListItemFromForm(id: string, data: CustomerFormData): CustomerListItemDto {
    return {
      id,
      name: data.name,
      email: data.email,
      document: data.document,
      createdAt: new Date().toISOString()
    };
  }

  private upsertCustomerLocally(customer: CustomerListItemDto): void {
    const current = this.customersResult();
    const pageSize = current?.pageSize ?? this.querySubject.value.pageSize;

    if (!current) {
      this.customersResult.set({
        items: [customer],
        totalCount: 1,
        pageNumber: 1,
        pageSize,
        totalPages: 1
      });
      return;
    }

    const exists = current.items.some(item => item.id === customer.id);
    const updatedItems = [customer, ...current.items.filter(item => item.id !== customer.id)];
    const trimmedItems = updatedItems.slice(0, pageSize || updatedItems.length);
    const totalCount = exists ? current.totalCount : current.totalCount + 1;
    const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

    this.customersResult.set({
      ...current,
      items: trimmedItems,
      totalCount,
      totalPages
    });
  }
}

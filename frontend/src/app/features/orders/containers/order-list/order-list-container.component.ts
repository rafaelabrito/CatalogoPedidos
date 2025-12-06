// frontend/src/app/features/orders/containers/order-list/order-list-container.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, BehaviorSubject, combineLatest, startWith } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { PagedResult, OrderListItemDto } from '../../../../shared/models/api-models';
import { OrderTableComponent } from '../../../../shared/components/order-table/order-table.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-order-list-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderTableComponent, PaginationComponent],
  template: `
    <div class="order-list-container">
      <div class="header-section">
        <h2>Lista de Pedidos</h2>
      </div>
      
      <div class="filters">
        <div class="filter-group">
          <label for="customerName">Cliente:</label>
          <input 
            id="customerName"
            type="text" 
            [formControl]="customerNameFilterControl" 
            placeholder="Filtrar por nome do cliente..."
            class="form-control">
        </div>
        
        <div class="filter-group">
          <label for="status">Status:</label>
          <select id="status" [formControl]="statusFilterControl" class="form-control">
            <option *ngFor="let status of statusOptions" [value]="status">
              {{ status }}
            </option>
          </select>
        </div>
      </div>

      <div *ngIf="isLoading()" class="loading">Carregando pedidos...</div>

      <div *ngIf="!isLoading() && pagedResult()">
        <app-order-table [orders]="pagedResult()?.items || []"></app-order-table>
        
        <app-pagination
          *ngIf="pagedResult()"
          [totalPages]="pagedResult()!.totalPages"
          [currentPage]="pagedResult()!.pageNumber"
          (pageChange)="onPageChange($event)">
        </app-pagination>
      </div>

      <div *ngIf="!isLoading() && (!pagedResult() || (pagedResult()?.items?.length ?? 0) === 0)" class="empty-state">
        Nenhum pedido encontrado.
      </div>
    </div>
  `,
  styles: [`
    .order-list-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      margin-bottom: 2rem;
    }

    h2 {
      color: #333;
      margin: 0;
      font-size: 1.75rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #495057;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-control {
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

    .loading {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      font-size: 1.125rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
      }

      h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class OrderListContainerComponent implements OnInit {

  // --- Estado da Aplicação (Signals) ---
  pagedResult = signal<PagedResult<OrderListItemDto> | null>(null);
  isLoading = signal(true); 

  // --- Filtros e Paginação (RxJS Subjects/Controls) ---
  
  // Gerencia a página atual
  private currentPageSubject = new BehaviorSubject<number>(1);
  
  // Controla o filtro por nome do cliente
  customerNameFilterControl = new FormControl(''); 
  
  // Controla o filtro por status (CREATED, PAID, etc.)
  statusFilterControl = new FormControl('ALL'); 
  
  // Opções de Status (baseado na enumeração do backend)
  statusOptions = ['ALL', 'CREATED', 'PAID', 'CANCELLED'];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    
    // 1. Define os fluxos reativos de filtros
    const nameFilter$ = this.customerNameFilterControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    );
    
    const statusFilter$ = this.statusFilterControl.valueChanges.pipe(
      distinctUntilChanged()
    );

    // 2. Combina todos os fluxos de estado (página, nome, status)
    combineLatest([
      this.currentPageSubject,
      nameFilter$.pipe(startWith('')),
      statusFilter$.pipe(startWith('ALL'))
    ])
    .pipe(
        // Troca para o Observable de chamada da API
        switchMap(([page, nameFilter, statusFilter]) => {
            this.isLoading.set(true); 
            
            // Mapeia 'ALL' para nulo, permitindo ao backend ignorar o filtro
            const finalStatus = statusFilter === 'ALL' ? null : statusFilter;
            
            // Chama o OrderService (Endpoint GET /api/orders)
            return this.orderService.listOrders(
                page, 
                10, // PageSize
                nameFilter || null,
                finalStatus
            );
        })
    )
    .subscribe({
      next: (result) => {
        this.pagedResult.set(result); // Atualiza a lista
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.isLoading.set(false);
      }
    });
  }

  // Método chamado pelo PaginationComponent (Output)
  onPageChange(page: number): void {
    if (page !== this.currentPageSubject.value) {
      this.currentPageSubject.next(page);
    }
  }

  viewOrder(orderId: number): void {
    console.log('Visualizar pedido:', orderId);
    // Aqui você pode navegar para a página de detalhes
    // this.router.navigate(['/orders', orderId]);
  }
}
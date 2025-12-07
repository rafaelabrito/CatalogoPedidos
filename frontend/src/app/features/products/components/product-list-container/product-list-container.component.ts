// src/app/features/products/components/product-list-container/product-list-container.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, switchMap, startWith, map, tap, catchError, of } from 'rxjs';

import { ProductService } from '../../services/product.service'; 
import { ProductListComponent } from '../product-list/product-list.component'; // Componente Dumb
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component'; // Componente compartilhado
import { PagedResult, ProductListItemDto, ListProductsQuery } from '../../../../shared/models/api-models';
import { ProductTableComponent } from '../../../../shared/components/product-table/product-table.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

// Interface para o estado da UI
interface ProductListViewState {
  productsResult: PagedResult<ProductListItemDto> | null;
  loading: boolean;
  error: any;
}

@Component({
  selector: 'app-product-list-container',
  standalone: true,
  imports: [CommonModule, FilterBarComponent, ProductTableComponent, PaginationComponent], 
  template: `
    <div class="product-container">
      <div class="header-section">
        <h2>Catálogo de Produtos</h2>
      </div>

      <app-filter-bar (filtersChanged)="onFiltersChanged($event)"></app-filter-bar>

      <ng-container *ngIf="viewState$ | async as viewState">
        <div *ngIf="viewState.loading" class="loading">Carregando produtos...</div>
        <div *ngIf="viewState.error" class="error">Erro: {{ viewState.error | json }}</div>

        <ng-container *ngIf="viewState.productsResult && !viewState.loading">
          <div class="results-summary">
            {{ viewState.productsResult.totalCount || 0 }} itens encontrados
          </div>
          <app-product-table [products]="viewState.productsResult.items"></app-product-table>
          
          <app-pagination
            [totalPages]="viewState.productsResult.totalPages"
            [currentPage]="viewState.productsResult.pageNumber"
            (pageChange)="onPageChanged($event)">
          </app-pagination>
        </ng-container>
      </ng-container>
    </div>
  `,
  styleUrl: './product-list-container.component.css'
})
export class ProductListContainerComponent implements OnInit {

  // BehaviorSubject para gerenciar o estado da QUERY
  private queryParamsSubject = new BehaviorSubject<ListProductsQuery>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    orderBy: 'name',
    sortDirection: 'asc',
    isActive: true
  });
  
  // Observable que armazena o estado completo da tela (dados, loading, erro)
  viewState$!: Observable<ProductListViewState>;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.viewState$ = this.queryParamsSubject.pipe(
      // 1. Faz a chamada à API (endpoint Dapper)
      switchMap(query => 
        this.productService.listProducts(query).pipe(
          // 3. Mapeia a resposta de sucesso
          map(result => ({ 
            productsResult: result, 
            loading: false, 
            error: null 
          })),
          // 4. Mapeia erros da API (capturados pelo Interceptor)
          catchError(error => {
            return of({ 
              productsResult: null, 
              loading: false, 
              error: error 
            });
          })
        )
      ),
      // Estado inicial antes da primeira requisição
      startWith({ productsResult: null, loading: true, error: null } as ProductListViewState)
    );
  }

  // Ações de Usuário

  onFiltersChanged(filters: { searchTerm?: string; orderBy?: string; sortDirection?: string; status?: string }): void {
    const nextQuery: ListProductsQuery = {
      ...this.queryParamsSubject.value,
      searchTerm: filters.searchTerm ?? this.queryParamsSubject.value.searchTerm ?? '',
      orderBy: filters.orderBy ?? this.queryParamsSubject.value.orderBy ?? 'name',
      sortDirection: (filters.sortDirection as 'asc' | 'desc') ?? this.queryParamsSubject.value.sortDirection ?? 'asc',
      pageNumber: 1
    };

    const status = filters.status;
    if (status === 'all') {
      nextQuery.isActive = undefined;
      nextQuery.skipIsActiveDefault = true;
    } else if (status === 'inactive') {
      nextQuery.isActive = false;
      delete nextQuery.skipIsActiveDefault;
    } else if (status === 'active' || !status) {
      nextQuery.isActive = true;
      delete nextQuery.skipIsActiveDefault;
    }

    this.queryParamsSubject.next(nextQuery);
  }

  onPageChanged(pageNumber: number): void {
    // Altera apenas o número da página
    this.queryParamsSubject.next({
      ...this.queryParamsSubject.value,
      pageNumber: pageNumber
    });
  }

  onEditProduct(productId: string): void {
    // Lógica para navegação ou abertura de modal de edição
    console.log('Editar produto ID:', productId);
    // this.router.navigate(['/products/edit', productId]);
  }
}
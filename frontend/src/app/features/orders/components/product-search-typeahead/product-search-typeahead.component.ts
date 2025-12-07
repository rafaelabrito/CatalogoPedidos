// src/app/features/orders/components/product-search-typeahead/product-search-typeahead.component.ts

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, filter, catchError, of, Observable, map, tap } from 'rxjs';

import { ProductService } from '../../../products/services/product.service';
import { ProductListItemDto, PagedResult, ListProductsQuery } from '../../../../shared/models/api-models';

@Component({
  selector: 'app-product-search-typeahead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="search-container">
      <input 
        type="text" 
        [formControl]="searchControl" 
        placeholder="Buscar produto por nome ou SKU..."
        class="form-control">

      <ul *ngIf="products$ | async as products" class="suggestions-list">
        <li *ngIf="isLoading" class="suggestion-item loading">Carregando...</li>
        <li *ngIf="!isLoading && products.length === 0 && searchControl.value" class="suggestion-item no-results">
            Nenhum produto encontrado.
        </li>
        
        <li *ngFor="let product of products" 
            (click)="selectProduct(product)" 
            class="suggestion-item">
          {{ product.name }} ({{ product.sku }}) - {{ product.price | currency:'BRL' }}
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./product-search-typeahead.component.css']
})
export class ProductSearchTypeaheadComponent implements OnInit {

  // Controla o input de busca
  searchControl = new FormControl('');
  
  // Observable para os resultados da busca
  products$!: Observable<ProductListItemDto[]>;
  
  // Estado de carregamento para a UI
  isLoading: boolean = false;

  // Evento emitido quando um produto é selecionado
  @Output() productSelected = new EventEmitter<ProductListItemDto>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products$ = this.searchControl.valueChanges.pipe(
      // 1. DEBOUNCE: Aguarda 300ms antes de prosseguir
      debounceTime(300),
      
      // 2. DISTINCT: Só prossegue se o valor for diferente do anterior
      distinctUntilChanged(),
      
      // 3. FILTER: Só prossegue se o termo for válido (>= 3 caracteres)
      filter(term => {
        if (!term || term.length < 3) {
          this.isLoading = false;
          // Limpa as sugestões se o termo for inválido
          return false; 
        }
        this.isLoading = true;
        return true;
      }),
      
      // 4. SWITCHMAP: Cancela a requisição anterior e inicia uma nova
      switchMap(term => {
        const query: ListProductsQuery = {
            pageNumber: 1, 
            pageSize: 5, // Limita o número de resultados
            searchTerm: term || '',
            isActive: true
        };
        
        // Chama o serviço (endpoint Dapper)
        return this.productService.listProducts(query).pipe(
          catchError(() => of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 5, totalPages: 0 } as PagedResult<ProductListItemDto>)), // Falha silenciosa
          map((result: PagedResult<ProductListItemDto>) => result.items),
          // Finaliza o carregamento
          tap(() => this.isLoading = false)
        );
      })
    );
  }
  
  // Ação ao selecionar um item
  selectProduct(product: ProductListItemDto): void {
    this.productSelected.emit(product);
    this.searchControl.setValue('', { emitEvent: false }); // Limpa o input sem disparar nova busca
  }
}
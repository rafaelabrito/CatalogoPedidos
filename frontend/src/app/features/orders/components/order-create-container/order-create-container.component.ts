// src/app/features/orders/components/order-create-container/order-create-container.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductSearchTypeaheadComponent } from '../product-search-typeahead/product-search-typeahead.component';
import { ProductListItemDto } from '../../../../shared/models/api-models';

@Component({
  selector: 'app-order-create-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductSearchTypeaheadComponent],
  template: `
    <div class="order-create-container">
      <h2>Criar Novo Pedido</h2>
      
      <form [formGroup]="orderForm">
        <section>
          <h3>Informações do Cliente</h3>
          <div class="form-group">
            <label for="customerName">Nome do Cliente:</label>
            <input id="customerName" type="text" formControlName="customerName" class="form-control">
          </div>
        </section>

        <section>
          <h3>Adicionar Itens</h3>
          
          <app-product-search-typeahead 
            (productSelected)="onProductSelected($event)">
          </app-product-search-typeahead>
          
          <div class="order-items" *ngIf="items.length > 0">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>SKU</th>
                  <th>Preço Unit.</th>
                  <th>Quantidade</th>
                  <th>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody formArrayName="items">
                <tr *ngFor="let item of items.controls; let i = index" [formGroupName]="i">
                  <td>{{ item.get('productName')?.value }}</td>
                  <td>{{ item.get('sku')?.value }}</td>
                  <td>{{ item.get('unitPrice')?.value | currency:'BRL' }}</td>
                  <td>
                    <input type="number" formControlName="quantity" min="1" class="quantity-input">
                  </td>
                  <td>{{ getItemTotal(i) | currency:'BRL' }}</td>
                  <td>
                    <button type="button" (click)="removeItem(i)" class="btn-remove">Remover</button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="order-total">
              <strong>Total do Pedido: {{ getOrderTotal() | currency:'BRL' }}</strong>
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button type="button" (click)="submitOrder()" [disabled]="!orderForm.valid || items.length === 0" class="btn-primary">
            Criar Pedido
          </button>
          <button type="button" (click)="cancelOrder()" class="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .order-create-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      margin-bottom: 2rem;
      color: #333;
    }

    h3 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #555;
    }

    section {
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .order-items {
      margin-top: 1rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    .items-table th,
    .items-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .items-table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .quantity-input {
      width: 80px;
      padding: 0.25rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .btn-remove {
      padding: 0.375rem 0.75rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-remove:hover {
      background-color: #c82333;
    }

    .order-total {
      text-align: right;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }
  `]
})
export class OrderCreateContainerComponent implements OnInit {
  orderForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  onProductSelected(product: ProductListItemDto): void {
    // Verifica se o produto já está na lista
    const existingItemIndex = this.items.controls.findIndex(
      control => control.get('productId')?.value === product.id
    );

    if (existingItemIndex >= 0) {
      // Se já existe, aumenta a quantidade
      const currentQty = this.items.at(existingItemIndex).get('quantity')?.value || 0;
      this.items.at(existingItemIndex).patchValue({ quantity: currentQty + 1 });
    } else {
      // Se não existe, adiciona um novo item
      const itemGroup = this.fb.group({
        productId: [product.id, Validators.required],
        productName: [product.name],
        sku: [product.sku],
        unitPrice: [product.price],
        quantity: [1, [Validators.required, Validators.min(1)]],
        availableStock: [product.stock]
      });

      this.items.push(itemGroup);
    }
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  getOrderTotal(): number {
    return this.items.controls.reduce((total, item, index) => {
      return total + this.getItemTotal(index);
    }, 0);
  }

  submitOrder(): void {
    if (this.orderForm.valid && this.items.length > 0) {
      console.log('Pedido criado:', this.orderForm.value);
      // Aqui você chamaria o serviço para salvar o pedido
      // this.orderService.createOrder(this.orderForm.value).subscribe(...)
    }
  }

  cancelOrder(): void {
    this.orderForm.reset();
    this.items.clear();
  }
}
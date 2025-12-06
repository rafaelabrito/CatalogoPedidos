import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerListItemDto } from '../../../../shared/models/customer-models';
import { CreateOrderRequest, ProductListItemDto } from '../../../../shared/models/api-models';
import { OrderService } from '../../services/order.service';
import { CustomerSearchTypeaheadComponent } from '../customer-search-typeahead/customer-search-typeahead.component';
import { ProductSearchTypeaheadComponent } from '../product-search-typeahead/product-search-typeahead.component';

@Component({
  selector: 'app-order-create-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomerSearchTypeaheadComponent, ProductSearchTypeaheadComponent],
  template: `
    <div class="order-create-container">
      <h2>Criar Novo Pedido</h2>

      <div *ngIf="submitSuccess" class="alert alert-success" role="status">
        <p>{{ submitSuccess }} <span *ngIf="createdOrderId">Código: {{ createdOrderId }}</span></p>
        <button type="button" class="btn-link" (click)="goToOrdersList()">Ver lista de pedidos</button>
      </div>

      <div *ngIf="submitError" class="alert alert-error" role="alert">
        {{ submitError }}
      </div>

      <form [formGroup]="orderForm" novalidate>
        <section>
          <h3>Informações do Cliente</h3>
          <app-customer-search-typeahead
            (customerSelected)="onCustomerSelected($event)"
            (customerCleared)="onCustomerCleared()">
          </app-customer-search-typeahead>

          <div *ngIf="selectedCustomer" class="selected-customer">
            <div>
              <span class="customer-name">{{ selectedCustomer.name }}</span>
              <div class="customer-meta">
                <span>{{ selectedCustomer.document }}</span>
                <span>{{ selectedCustomer.email }}</span>
              </div>
            </div>
            <button type="button" class="btn-link" (click)="clearSelectedCustomer()">Trocar cliente</button>
          </div>

          <div *ngIf="formSubmitted && orderForm.get('customerId')?.invalid" class="field-error">
            Selecione um cliente válido.
          </div>
        </section>

        <section>
          <h3>Adicionar Itens</h3>

          <app-product-search-typeahead
            (productSelected)="onProductSelected($event)">
          </app-product-search-typeahead>

          <p class="section-hint">Selecione produtos para compor o pedido. Quantidades respeitam o estoque atual.</p>

          <div class="order-items" *ngIf="items.length > 0; else emptyItems">
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
                  <td>
                    <div class="product-name">{{ item.get('productName')?.value }}</div>
                    <div class="stock-helper">Disponível: {{ item.get('availableStock')?.value }}</div>
                  </td>
                  <td>{{ item.get('sku')?.value }}</td>
                  <td>{{ item.get('unitPrice')?.value | currency:'BRL' }}</td>
                  <td>
                    <input
                      type="number"
                      formControlName="quantity"
                      min="1"
                      [max]="item.get('availableStock')?.value || null"
                      class="quantity-input"
                      (change)="onQuantityBlur(i)"
                      (blur)="onQuantityBlur(i)">
                    <div *ngIf="formSubmitted && item.get('quantity')?.invalid" class="field-error">
                      Quantidade deve estar entre 1 e {{ item.get('availableStock')?.value }}.
                    </div>
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

          <ng-template #emptyItems>
            <div class="empty-items">
              Nenhum produto selecionado até o momento.
            </div>
          </ng-template>
        </section>

        <div class="form-actions">
          <button
            type="button"
            (click)="submitOrder()"
            [disabled]="isSubmitting || items.length === 0 || orderForm.invalid"
            class="btn-primary">
            {{ isSubmitting ? 'Processando...' : 'Criar Pedido' }}
          </button>
          <button type="button" (click)="cancelOrder()" class="btn-secondary">
            Limpar
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

    .alert {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      border: 1px solid transparent;
    }

    .alert-success {
      background-color: #d1e7dd;
      border-color: #badbcc;
      color: #0f5132;
    }

    .alert-error {
      background-color: #f8d7da;
      border-color: #f5c2c7;
      color: #842029;
    }

    .btn-link {
      background: none;
      border: none;
      color: #0d6efd;
      cursor: pointer;
      padding: 0;
      font-weight: 600;
    }

    .btn-link:hover {
      text-decoration: underline;
    }

    .selected-customer {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .customer-name {
      font-weight: 600;
      color: #212529;
    }

    .customer-meta {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 0.25rem;
    }

    .section-hint {
      margin: 0.75rem 0 0;
      color: #6c757d;
      font-size: 0.9375rem;
    }

    .order-items {
      margin-top: 1.5rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
      background-color: #fff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }

    .items-table th,
    .items-table td {
      padding: 0.85rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
      vertical-align: top;
    }

    .items-table th {
      background-color: #f1f3f5;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8125rem;
      letter-spacing: 0.02em;
    }

    .product-name {
      font-weight: 500;
      color: #212529;
    }

    .stock-helper {
      margin-top: 0.35rem;
      font-size: 0.8125rem;
      color: #6c757d;
    }

    .quantity-input {
      width: 90px;
      padding: 0.4rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
    }

    .btn-remove {
      padding: 0.45rem 0.9rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-remove:hover {
      background-color: #c82333;
    }

    .order-total {
      text-align: right;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      font-size: 1.05rem;
      font-weight: 600;
      color: #212529;
    }

    .empty-items {
      margin-top: 1.5rem;
      padding: 1.5rem;
      border: 2px dashed #ced4da;
      border-radius: 6px;
      text-align: center;
      color: #6c757d;
      font-style: italic;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary {
      padding: 0.85rem 1.75rem;
      background-color: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0b5ed7;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 0.85rem 1.5rem;
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

    .field-error {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #b02a37;
    }

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .items-table {
        font-size: 0.875rem;
      }
    }
  `]
})
export class OrderCreateContainerComponent implements OnInit {
  orderForm!: FormGroup;
  formSubmitted = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  createdOrderId: string | null = null;
  selectedCustomer: CustomerListItemDto | null = null;

  @ViewChild(CustomerSearchTypeaheadComponent) private customerLookup?: CustomerSearchTypeaheadComponent;

  constructor(
    private readonly fb: FormBuilder,
    private readonly orderService: OrderService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      items: this.fb.array([])
    });
  }

  get items(): FormArray<FormGroup> {
    return this.orderForm.get('items') as FormArray<FormGroup>;
  }

  onCustomerSelected(customer: CustomerListItemDto): void {
    this.selectedCustomer = customer;
    this.orderForm.patchValue({ customerId: customer.id });
    this.submitError = null;
  }

  onCustomerCleared(): void {
    if (!this.selectedCustomer && !this.orderForm.get('customerId')?.value) {
      return;
    }
    this.selectedCustomer = null;
    this.orderForm.patchValue({ customerId: '' });
  }

  clearSelectedCustomer(): void {
    this.selectedCustomer = null;
    this.orderForm.patchValue({ customerId: '' });
    this.customerLookup?.clearSelection();
  }

  onProductSelected(product: ProductListItemDto): void {
    this.submitError = null;
    this.submitSuccess = null;

    const availableStockRaw = Number(product.stockQty ?? 0);
    const availableStock = Number.isFinite(availableStockRaw) ? Math.max(0, Math.floor(availableStockRaw)) : 0;

    if (availableStock <= 0) {
      this.submitError = 'Produto selecionado está sem estoque disponível.';
      return;
    }

    const existingIndex = this.items.controls.findIndex(ctrl => ctrl.get('productId')?.value === product.id);

    if (existingIndex >= 0) {
      const itemGroup = this.items.at(existingIndex);
      const currentQty = Number(itemGroup.get('quantity')?.value ?? 0);
      const newQty = Math.min(currentQty + 1, availableStock);
      itemGroup.patchValue({ quantity: newQty });
      return;
    }

    const quantityValidators = [Validators.required, Validators.min(1), Validators.max(availableStock)];

    const itemGroup = this.fb.group({
      productId: [product.id, Validators.required],
      productName: [product.name],
      sku: [product.sku],
      unitPrice: [Number(product.price ?? 0)],
      quantity: [1, quantityValidators],
      availableStock: [availableStock]
    });

    this.items.push(itemGroup);
  }

  onQuantityBlur(index: number): void {
    const itemGroup = this.items.at(index);
    const quantityControl = itemGroup.get('quantity');
    const maxStock = Number(itemGroup.get('availableStock')?.value ?? 0);

    if (!quantityControl) {
      return;
    }

    let value = Number(quantityControl.value ?? 0);

    if (!Number.isFinite(value) || value < 1) {
      value = 1;
    }

    if (maxStock > 0 && value > maxStock) {
      value = maxStock;
    }

    quantityControl.setValue(value, { emitEvent: false });
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index);
    const quantity = Number(item.get('quantity')?.value ?? 0);
    const unitPrice = Number(item.get('unitPrice')?.value ?? 0);
    return quantity * unitPrice;
  }

  getOrderTotal(): number {
    return this.items.controls.reduce((total, _, index) => total + this.getItemTotal(index), 0);
  }

  submitOrder(): void {
    this.formSubmitted = true;
    this.submitError = null;
    this.submitSuccess = null;
    this.createdOrderId = null;

    if (this.orderForm.invalid || this.items.length === 0) {
      return;
    }

    const customerId = (this.orderForm.get('customerId')?.value as string)?.trim();
    if (!customerId) {
      return;
    }

    const payload: CreateOrderRequest = {
      customerId,
      items: this.items.controls.map(control => ({
        productId: control.get('productId')?.value,
        quantity: Number(control.get('quantity')?.value ?? 0)
      }))
    };

    this.isSubmitting = true;

    this.orderService.createOrder(payload).subscribe({
      next: orderId => {
        this.isSubmitting = false;
        this.submitSuccess = 'Pedido criado com sucesso.';
        this.createdOrderId = orderId;
        this.resetForm();
      },
      error: error => {
        this.isSubmitting = false;
        this.submitError = error?.message ?? 'Falha ao criar pedido.';
      }
    });
  }

  cancelOrder(): void {
    this.submitError = null;
    this.submitSuccess = null;
    this.createdOrderId = null;
    this.resetForm();
  }

  goToOrdersList(): void {
    this.router.navigate(['/orders']);
  }

  private resetForm(): void {
    this.formSubmitted = false;
    this.orderForm.reset({ customerId: '' });
    while (this.items.length) {
      this.items.removeAt(0);
    }
    this.selectedCustomer = null;
    this.customerLookup?.clearSelection();
  }
}

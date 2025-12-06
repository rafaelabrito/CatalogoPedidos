import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { OrderCreateContainerComponent } from './order-create-container.component';
import { OrderService } from '../../services/order.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { CustomerListItemDto } from '../../../../shared/models/customer-models';
import { ProductListItemDto } from '../../../../shared/models/api-models';

describe('OrderCreateContainerComponent', () => {
  let orderService: jasmine.SpyObj<OrderService>;
  let feedbackService: jasmine.SpyObj<FeedbackService>;

  const customer: CustomerListItemDto = {
    id: 'customer-1',
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    document: '12345678900',
    createdAt: '2024-01-01T00:00:00Z'
  };

  const product: ProductListItemDto = {
    id: 'product-1',
    name: 'Produto Teste',
    sku: 'SKU-001',
    price: 99.9,
    stockQty: 5,
    isActive: true
  };

  beforeEach(async () => {
    orderService = jasmine.createSpyObj('OrderService', ['createOrder']);
    feedbackService = jasmine.createSpyObj('FeedbackService', ['error', 'success', 'info', 'clear']);

    await TestBed.configureTestingModule({
      imports: [OrderCreateContainerComponent, RouterTestingModule],
      providers: [
        { provide: OrderService, useValue: orderService },
        { provide: FeedbackService, useValue: feedbackService }
      ]
    }).compileComponents();
  });

  function prepareValidOrder(component: OrderCreateContainerComponent): void {
    component.onCustomerSelected(customer);
    component.onProductSelected(product);
  }

  it('should submit a valid order and navigate to details', async () => {
    orderService.createOrder.and.returnValue(of('order-123'));

    const fixture = TestBed.createComponent(OrderCreateContainerComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.detectChanges();
    prepareValidOrder(component);

    component.submitOrder();

    expect(orderService.createOrder).toHaveBeenCalledTimes(1);
    expect(orderService.createOrder).toHaveBeenCalledWith({
      customerId: customer.id,
      items: [{ productId: product.id, quantity: 1 }]
    });
    expect(feedbackService.success).toHaveBeenCalledWith(jasmine.stringMatching('order-123'));
    expect(navigateSpy).toHaveBeenCalledWith(['/orders', 'order-123']);
    expect(component.isSubmitting).toBeFalse();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(OrderCreateContainerComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    component.submitOrder();

    expect(orderService.createOrder).not.toHaveBeenCalled();
    expect(feedbackService.success).not.toHaveBeenCalled();
  });

  it('should show feedback when submission fails', () => {
    const submissionError = new Error('Falha ao criar pedido.');
    orderService.createOrder.and.returnValue(throwError(() => submissionError));

    const fixture = TestBed.createComponent(OrderCreateContainerComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    prepareValidOrder(component);

    component.submitOrder();

    expect(orderService.createOrder).toHaveBeenCalled();
    expect(feedbackService.error).toHaveBeenCalledWith(submissionError.message);
    expect(component.isSubmitting).toBeFalse();
  });
});
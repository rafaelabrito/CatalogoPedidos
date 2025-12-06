import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { OrderListContainerComponent } from './order-list-container.component';
import { OrderService } from '../../services/order.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { OrderListItemDto, PagedResult } from '../../../../shared/models/api-models';

describe('OrderListContainerComponent', () => {
  let orderService: jasmine.SpyObj<OrderService>;
  let feedbackService: jasmine.SpyObj<FeedbackService>;

  const pagedResult: PagedResult<OrderListItemDto> = {
    items: [
      {
        id: 'order-1',
        customerName: 'Cliente Teste',
        createdAt: '2024-01-01T10:00:00Z',
        status: 'CREATED',
        totalAmount: 120.5
      }
    ],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1
  };

  beforeEach(async () => {
    orderService = jasmine.createSpyObj('OrderService', ['listOrders']);
    feedbackService = jasmine.createSpyObj('FeedbackService', ['error', 'success', 'info', 'clear']);

    await TestBed.configureTestingModule({
      imports: [OrderListContainerComponent, RouterTestingModule],
      providers: [
        { provide: OrderService, useValue: orderService },
        { provide: FeedbackService, useValue: feedbackService }
      ]
    }).compileComponents();
  });

  it('should load orders on init', () => {
    orderService.listOrders.and.returnValue(of(pagedResult));

    const fixture = TestBed.createComponent(OrderListContainerComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(orderService.listOrders).toHaveBeenCalledWith(1, 10, null, null);
    expect(component.pagedResult()).toEqual(pagedResult);
    expect(component.isLoading()).toBeFalse();
  });

  it('should navigate to order detail when viewOrder is called', async () => {
    orderService.listOrders.and.returnValue(of(pagedResult));

    const fixture = TestBed.createComponent(OrderListContainerComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.detectChanges();

    component.viewOrder('order-123');

    expect(navigateSpy).toHaveBeenCalledWith(['/orders', 'order-123']);
  });

  it('should show feedback when loading fails', () => {
    const error = new Error('Falha ao carregar pedidos.');
    orderService.listOrders.and.returnValue(throwError(() => error));

    const fixture = TestBed.createComponent(OrderListContainerComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(feedbackService.error).toHaveBeenCalledWith(error.message);
    expect(component.isLoading()).toBeFalse();
  });
});
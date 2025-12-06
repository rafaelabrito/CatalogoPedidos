// src/app/features/orders/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PagedResult, ApiResponse, OrderListItemDto, CreateOrderRequest, OrderStatus, OrderDetailsDto } from '../../../shared/models/api-models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  listOrders(
    pageNumber: number, 
    pageSize: number, 
    customerName: string | null, 
    status: OrderStatus | null
  ): Observable<PagedResult<OrderListItemDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (customerName) {
      params = params.set('customerName', customerName);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PagedResult<OrderListItemDto>>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Formato de resposta inválido.');
      })
    );
  }

  createOrder(command: CreateOrderRequest, idempotencyKey?: string): Observable<string> {
    const key = idempotencyKey || this.generateIdempotencyKey();
    const headers = new HttpHeaders({ 'Idempotency-Key': key });

    return this.http.post<ApiResponse<string>>(this.apiUrl, command, { headers }).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Falha ao criar pedido.');
      })
    );
  }

  getOrderById(orderId: string): Observable<OrderDetailsDto> {
    return this.http.get<ApiResponse<OrderDetailsDto>>(`${this.apiUrl}/${orderId}`).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Pedido não encontrado.');
      })
    );
  }

  private generateIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    // fallback simples
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

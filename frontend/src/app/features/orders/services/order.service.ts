// src/app/features/orders/services/order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PagedResult, ApiResponse, OrderListItemDto } from '../../../shared/models/api-models';

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
    status: string | null
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

  createOrder(command: any): Observable<number> {
    return this.http.post<ApiResponse<number>>(this.apiUrl, command).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Falha ao criar pedido.');
      })
    );
  }

  getOrderById(orderId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${orderId}`).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Pedido não encontrado.');
      })
    );
  }
}

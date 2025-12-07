// src/app/shared/models/api-models.ts

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductListItemDto {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  isActive?: boolean;
}

export interface ListProductsQuery {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  orderBy?: string;
  sortDirection?: 'asc' | 'desc';
  isActive?: boolean;
  skipIsActiveDefault?: boolean;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'CANCELLED';

export interface OrderListItemDto {
  id: string;
  customerName: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
}

export interface OrderDetailsItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetailsDto {
  id: string;
  customerId: string;
  customerName: string;
  customerDocument: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderDetailsItemDto[];
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  items: CreateOrderItemRequest[];
}

export { ApiResponse } from './api-response.interface';

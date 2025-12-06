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

export interface OrderListItemDto {
  id: number;
  customerName: string;
  createdAt: string;
  status: string;
  totalAmount: number;
}

export { ApiResponse } from './api-response.interface';

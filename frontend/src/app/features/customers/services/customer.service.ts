import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError, throwError } from 'rxjs';
import { PagedResult, ApiResponse } from '../../../shared/models/api-models';
import { CustomerListItemDto, CustomerFormData } from '../../../shared/models/customer-models';

export type CustomerSortField = 'name' | 'email' | 'document' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface CustomerListFilters {
  sortField?: CustomerSortField;
  sortDirection?: SortDirection;
  email?: string;
  document?: string;
  createdFrom?: string;
  createdTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = '/api/customers';
  private advancedFiltersSupported = true;

  constructor(private http: HttpClient) {}

  listCustomers(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    filters?: CustomerListFilters
  ): Observable<PagedResult<CustomerListItemDto>> {
    const shouldUseAdvanced = this.advancedFiltersSupported && this.hasAdvancedFilters(filters);
    const params = this.buildListParams(pageNumber, pageSize, searchTerm, filters, shouldUseAdvanced);
    const fallbackParams = shouldUseAdvanced
      ? this.buildListParams(pageNumber, pageSize, searchTerm, undefined, false)
      : params;

    const listRequest$ = this.requestCustomers(params, pageNumber, pageSize);

    if (!shouldUseAdvanced) {
      return listRequest$;
    }

    return listRequest$.pipe(
      catchError(err => {
        if (this.isRecoverableListError(err)) {
          this.advancedFiltersSupported = false;
          console.warn('[CustomerService] Advanced filters unsupported by API. Falling back to basic query.', err);
          return this.requestCustomers(fallbackParams, pageNumber, pageSize);
        }
        return throwError(() => err);
      })
    );
  }

  getCustomerById(id: string): Observable<CustomerListItemDto> {
    return this.http.get<ApiResponse<CustomerListItemDto>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data!)
    );
  }

  createCustomer(command: CustomerFormData): Observable<string> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, command).pipe(
      map(response => response.data!)
    );
  }

  updateCustomer(id: string, command: CustomerFormData): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}`, command).pipe(
      map(() => undefined)
    );
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }

  isDocumentAvailable(document: string, excludeCustomerId?: string): Observable<boolean> {
    const normalizedDocument = this.normalizeDocument(document);
    if (!normalizedDocument) {
      return of(false);
    }

    return this.listCustomers(1, 25, normalizedDocument).pipe(
      map(result => {
        const existing = result.items.find(item => this.normalizeDocument(item.document) === normalizedDocument);
        if (!existing) {
          return true;
        }

        if (excludeCustomerId && existing.id === excludeCustomerId) {
          return true;
        }

        return false;
      }),
      catchError(() => of(true))
    );
  }

  private normalizeDocument(value: string): string {
    return (value ?? '').replace(/\D+/g, '');
  }

  private hasAdvancedFilters(filters?: CustomerListFilters): boolean {
    if (!filters) {
      return false;
    }

    return Boolean(
      filters.sortField ||
      filters.sortDirection ||
      (filters.email ?? '').trim() ||
      (filters.document ?? '').trim() ||
      filters.createdFrom ||
      filters.createdTo
    );
  }

  private buildListParams(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string,
    filters?: CustomerListFilters,
    includeAdvanced = true
  ): HttpParams {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    const trimmedSearch = (searchTerm ?? '').trim();
    if (trimmedSearch) {
      params = params.set('SearchTerm', trimmedSearch);
    }

    if (!includeAdvanced || !filters) {
      return params;
    }

    if (filters.sortField) {
      params = params.set('SortField', filters.sortField);
    }

    if (filters.sortDirection) {
      params = params.set('SortDirection', filters.sortDirection);
    }

    const trimmedEmail = (filters.email ?? '').trim();
    if (trimmedEmail) {
      params = params.set('Email', trimmedEmail);
    }

    const normalizedDocument = this.normalizeDocument(filters.document ?? '');
    if (normalizedDocument) {
      params = params.set('Document', normalizedDocument);
    }

    if (filters.createdFrom) {
      params = params.set('CreatedFrom', filters.createdFrom);
    }

    if (filters.createdTo) {
      params = params.set('CreatedTo', filters.createdTo);
    }

    return params;
  }

  private requestCustomers(params: HttpParams, pageNumber: number, pageSize: number): Observable<PagedResult<CustomerListItemDto>> {
    return this.http.get<ApiResponse<PagedResult<CustomerListItemDto>>>(this.apiUrl, { params }).pipe(
      map(response => {
        const payload = response.data ?? {} as PagedResult<CustomerListItemDto>;
        const items = payload.items ?? [];
        const totalCount = payload.totalCount ?? items.length;
        const pageSizeValue = payload.pageSize ?? pageSize;
        const pageNumberValue = payload.pageNumber ?? pageNumber;
        const totalPages = payload.totalPages ?? Math.max(1, Math.ceil(totalCount / (pageSizeValue || 1)));

        return {
          ...payload,
          items,
          totalCount,
          pageSize: pageSizeValue,
          pageNumber: pageNumberValue,
          totalPages
        };
      })
    );
  }

  private isRecoverableListError(err: any): err is HttpErrorResponse {
    return err instanceof HttpErrorResponse && (err.status === 400 || err.status >= 500);
  }
}

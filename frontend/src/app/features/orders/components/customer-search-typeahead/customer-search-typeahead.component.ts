import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, catchError, distinctUntilChanged, finalize, map, of, shareReplay, startWith, switchMap, takeUntil, debounceTime, tap } from 'rxjs';
import { CustomerListItemDto } from '../../../../shared/models/customer-models';
import { CustomerService } from '../../../customers/services/customer.service';

@Component({
  selector: 'app-customer-search-typeahead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="search-container">
      <label for="customer-search" class="sr-only">Buscar cliente</label>
      <input
        id="customer-search"
        type="text"
        [formControl]="searchControl"
        placeholder="Buscar cliente por nome ou documento..."
        class="form-control"
        autocomplete="off">

      <ng-container *ngIf="customers$ | async as customers">
        <ul *ngIf="showDropdown" class="suggestions-list">
          <li *ngIf="isLoading" class="suggestion-item loading">Carregando clientes...</li>
          <li *ngIf="!isLoading && customers.length === 0 && (searchControl.value ?? '').trim().length >= 3" class="suggestion-item no-results">
            Nenhum cliente encontrado.
          </li>
          <li *ngFor="let customer of customers" (click)="selectCustomer(customer)" class="suggestion-item">
            <span class="customer-name">{{ customer.name }}</span>
            <span class="customer-meta">{{ customer.document }} · {{ customer.email }}</span>
          </li>
        </ul>
      </ng-container>
    </div>
  `,
  styleUrls: ['./customer-search-typeahead.component.css']
})
export class CustomerSearchTypeaheadComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  customers$!: Observable<CustomerListItemDto[]>;
  isLoading = false;
  showDropdown = false;

  private destroy$ = new Subject<void>();
  private selectedCustomerId: string | null = null;
  private selectedCustomerName = '';

  @Output() customerSelected = new EventEmitter<CustomerListItemDto>();
  @Output() customerCleared = new EventEmitter<void>();

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    const inputChanges$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    );

    inputChanges$.subscribe(value => {
      const typed = (value ?? '').toString();
      if (this.selectedCustomerId && typed !== this.selectedCustomerName) {
        this.selectedCustomerId = null;
        this.selectedCustomerName = '';
        this.customerCleared.emit();
      }
    });

    this.customers$ = inputChanges$.pipe(
      debounceTime(300),
      map(value => (value ?? '').toString().trim()),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 3) {
          this.isLoading = false;
          this.showDropdown = false;
          return of([] as CustomerListItemDto[]);
        }

        this.isLoading = true;
        this.showDropdown = true;
        return this.customerService.listCustomers(1, 5, term).pipe(
          map(result => result.items ?? []),
          catchError(() => of([] as CustomerListItemDto[])),
          finalize(() => this.isLoading = false)
        );
      }),
      tap(results => {
        this.showDropdown = results.length > 0 || this.isLoading;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  selectCustomer(customer: CustomerListItemDto): void {
    this.selectedCustomerId = customer.id;
    this.selectedCustomerName = customer.name;
    this.customerSelected.emit(customer);
    this.searchControl.setValue(customer.name, { emitEvent: false });
    this.showDropdown = false;
  }

  clearSelection(): void {
    this.selectedCustomerId = null;
    this.selectedCustomerName = '';
    this.showDropdown = false;
    this.searchControl.setValue('', { emitEvent: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

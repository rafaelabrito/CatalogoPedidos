import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderDetailsDto } from '../../../../shared/models/api-models';
import { OrderService } from '../../services/order.service';
import { OrderDetailsComponent } from '../../components/order-details/order-details.component';

@Component({
  selector: 'app-order-details-container',
  standalone: true,
  imports: [CommonModule, RouterModule, OrderDetailsComponent],
  template: `
    <div class="details-container">
      <a routerLink="/orders" class="back-link">&larr; Voltar para lista</a>

      <ng-container *ngIf="isLoading()">
        <div class="loading" role="status" aria-live="polite">Carregando detalhes do pedido...</div>
      </ng-container>

      <ng-container *ngIf="errorMessage() as message">
        <div class="error" role="alert">
          {{ message }}
        </div>
      </ng-container>

      <ng-container *ngIf="order() as loadedOrder">
        <app-order-details [order]="loadedOrder"></app-order-details>
      </ng-container>
    </div>
  `,
  styles: [`
    .details-container {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      gap: 1.5rem;
    }

    .back-link {
      color: #0d6efd;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .back-link:hover,
    .back-link:focus {
      text-decoration: underline;
      outline: none;
    }

    .loading {
      background: #fff3cd;
      border: 1px solid #ffecb5;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      color: #664d03;
    }

    .error {
      background: #f8d7da;
      border: 1px solid #f5c2c7;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      color: #842029;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailsContainerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  // Simple signal-based state to avoid unnecessary templates logic
  state = signal<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'loaded'; order: OrderDetailsDto }
  >({ status: 'loading' });

  private readonly vm = computed(() => this.state());
  readonly isLoading = computed(() => {
    const snapshot = this.vm();
    return snapshot.status === 'loading';
  });

  readonly errorMessage = computed(() => {
    const snapshot = this.vm();
    return snapshot.status === 'error' ? snapshot.message : null;
  });

  readonly order = computed(() => {
    const snapshot = this.vm();
    return snapshot.status === 'loaded' ? snapshot.order : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        tap(() => this.state.set({ status: 'loading' })),
        switchMap(orderId => {
          if (!orderId) {
            return of<OrderDetailsDto | null>(null);
          }
          return this.orderService.getOrderById(orderId).pipe(
            catchError(() => {
              this.state.set({ status: 'error', message: 'Não foi possível carregar os detalhes do pedido.' });
              return of(null);
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe(order => {
        if (order) {
          this.state.set({ status: 'loaded', order });
        } else if (this.state().status === 'loading') {
          this.state.set({ status: 'error', message: 'Pedido não encontrado.' });
        }
      });
  }
}
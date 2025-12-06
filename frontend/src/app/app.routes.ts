import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/components/product-crud-container/product-crud-container.component')
      .then(m => m.ProductCrudContainerComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./features/customers/components/customer-crud-container.component')
      .then(m => m.CustomerCrudContainerComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/containers/order-list/order-list-container.component')
      .then(m => m.OrderListContainerComponent)
  }
];

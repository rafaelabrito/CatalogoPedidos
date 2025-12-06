import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav" aria-label="Menu lateral">
        <ul class="sidebar-list">
          <li class="sidebar-item">
            <a routerLink="/products" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>
              </svg>
              <span>Produtos</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a routerLink="/customers" routerLinkActive="active">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Clientes</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a routerLink="/orders" routerLinkActive="active">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                <path d="M7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
              </svg>
              <span>Pedidos</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100%;
      background-color: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 1rem 0;
    }

    .sidebar-nav {
      height: 100%;
    }

    .sidebar-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .sidebar-item {
      margin-bottom: 0.5rem;
    }

    .sidebar-item a {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: #495057;
      text-decoration: none;
      transition: all 0.2s ease;
      gap: 0.75rem;
    }

    .sidebar-item a:hover {
      background-color: #e9ecef;
      color: #212529;
    }

    .sidebar-item a.active {
      background-color: #0d6efd;
      color: white;
      font-weight: 500;
    }

    .icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .sidebar-item span {
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 60px;
      }

      .sidebar-item span {
        display: none;
      }

      .sidebar-item a {
        justify-content: center;
        padding: 0.75rem;
      }
    }
  `]
})
export class SidebarComponent {}

// src/app/shared/components/header/header.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header" role="banner">
      <nav class="nav" aria-label="Navegação principal">
        <a class="brand" [routerLink]="['/']" aria-label="Página inicial - Desafio">Desafio</a>

        <button
          type="button"
          class="menu-toggle"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen"
          aria-label="Alternar menu de navegação">
          <span class="menu-icon" aria-hidden="true"></span>
          <span class="sr-only">Menu</span>
        </button>

        <ul class="nav-list" role="list" [class.open]="menuOpen">
          <li class="nav-item">
            <a routerLink="/products" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" aria-label="Gerenciar produtos" (click)="handleNavClick()">Produtos</a>
          </li>
          <li class="nav-item">
            <a routerLink="/customers" routerLinkActive="active" aria-label="Gerenciar clientes" (click)="handleNavClick()">Clientes</a>
          </li>
          <li class="nav-item">
            <a routerLink="/orders" routerLinkActive="active" aria-label="Visualizar pedidos" (click)="handleNavClick()">Pedidos</a>
          </li>
        </ul>
      </nav>

      <div class="mobile-overlay" *ngIf="menuOpen" (click)="closeMenu()" aria-hidden="true"></div>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0d6efd;
      color: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .nav {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
    }
    .brand {
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      letter-spacing: 0.3px;
    }
    .nav-list {
      list-style: none;
      display: flex;
      gap: 1rem;
      margin: 0;
      padding: 0;
    }
    .menu-toggle {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.4);
      border-radius: 6px;
      padding: 0.35rem 0.5rem;
      color: #fff;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .menu-toggle:hover {
      background: rgba(255,255,255,0.1);
    }
    .menu-icon {
      width: 1.25rem;
      height: 0.125rem;
      background: currentColor;
      position: relative;
      display: inline-block;
    }
    .menu-icon::before,
    .menu-icon::after {
      content: '';
      position: absolute;
      left: 0;
      width: 100%;
      height: 0.125rem;
      background: currentColor;
    }
    .menu-icon::before { top: -0.35rem; }
    .menu-icon::after { top: 0.35rem; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
    .nav-item a {
      color: #e9f1ff;
      text-decoration: none;
      padding: 0.375rem 0.5rem;
      border-radius: 4px;
      transition: background-color 0.15s ease-in-out, color 0.15s;
    }
    .nav-item a:hover {
      background: rgba(255,255,255,0.15);
      color: #fff;
    }
    .nav-item a.active {
      background: #fff;
      color: #0d6efd;
      font-weight: 600;
    }
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 999;
    }
    @media (max-width: 768px) {
      .nav {
        padding: 0.75rem;
      }
      .menu-toggle {
        display: inline-flex;
      }
      .nav-list {
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: 280px;
        flex-direction: column;
        gap: 0.5rem;
        padding: 5rem 1.5rem 1.5rem;
        background: #0d6efd;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: -6px 0 16px rgba(0,0,0,0.2);
        z-index: 1000;
      }
      .nav-list.open {
        transform: translateX(0);
      }
      .nav-item a {
        font-size: 1rem;
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class HeaderComponent {
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  handleNavClick(): void {
    this.closeMenu();
  }
}

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  carritoService = inject(CarritoService);
  router = inject(Router);

  currentUser$ = this.authService.currentUser$;
  cantidadCarrito$ = this.carritoService.carrito$;
  isMenuOpen = false;

  private routerSubscription?: Subscription;

  ngOnInit() {
    // Cerrar menú móvil al cambiar de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMenuOpen = false;
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  getCantidadCarrito(): number {
    return this.carritoService.getCantidadTotal();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}

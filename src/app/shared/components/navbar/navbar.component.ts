import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { selectFavoritesCount } from '../../../store/favorites';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService);
  private store = inject(Store);

  isMenuOpen = false;
  favoritesCount = this.store.selectSignal(selectFavoritesCount);

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }
}

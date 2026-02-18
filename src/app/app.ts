import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';
import { Store } from '@ngrx/store';
import { loadFavorites } from './store/favorites';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private store = inject(Store);

  ngOnInit(): void {
    // Load favorites if user is authenticated on app start
    if (this.authService.isAuthenticated()) {
      this.store.dispatch(loadFavorites());
    }
  }
}

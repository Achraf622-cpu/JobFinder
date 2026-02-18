import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectAllFavorites,
  selectFavoritesLoading,
  loadFavorites,
  removeFavorite
} from '../../store/favorites';
import { FavoriteOffer } from '../../models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css'
})
export class FavoritesPageComponent implements OnInit {
  private store = inject(Store);

  favorites = this.store.selectSignal(selectAllFavorites);
  isLoading = this.store.selectSignal(selectFavoritesLoading);

  ngOnInit(): void {
    this.store.dispatch(loadFavorites());
  }

  removeFav(fav: FavoriteOffer): void {
    if (fav.id) {
      this.store.dispatch(removeFavorite({ id: fav.id }));
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

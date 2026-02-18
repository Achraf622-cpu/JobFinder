import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavoritesState } from './favorites.reducer';

export const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');

export const selectAllFavorites = createSelector(
    selectFavoritesState,
    (state) => state.favorites
);

export const selectFavoritesLoading = createSelector(
    selectFavoritesState,
    (state) => state.loading
);

export const selectFavoritesError = createSelector(
    selectFavoritesState,
    (state) => state.error
);

export const selectFavoritesCount = createSelector(
    selectAllFavorites,
    (favorites) => favorites.length
);

export const selectIsFavorite = (offerId: string) => createSelector(
    selectAllFavorites,
    (favorites) => favorites.some(f => f.offerId === offerId)
);

export const selectFavoriteByOfferId = (offerId: string) => createSelector(
    selectAllFavorites,
    (favorites) => favorites.find(f => f.offerId === offerId)
);

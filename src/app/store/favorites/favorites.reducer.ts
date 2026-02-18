import { createReducer, on } from '@ngrx/store';
import { FavoriteOffer } from '../../models';
import * as FavoritesActions from './favorites.actions';

export interface FavoritesState {
    favorites: FavoriteOffer[];
    loading: boolean;
    error: string | null;
}

export const initialState: FavoritesState = {
    favorites: [],
    loading: false,
    error: null
};

export const favoritesReducer = createReducer(
    initialState,

    // Load favorites
    on(FavoritesActions.loadFavorites, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
        ...state,
        favorites,
        loading: false
    })),
    on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Add favorite
    on(FavoritesActions.addFavorite, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => ({
        ...state,
        favorites: [...state.favorites, favorite],
        loading: false
    })),
    on(FavoritesActions.addFavoriteFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Remove favorite
    on(FavoritesActions.removeFavorite, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(FavoritesActions.removeFavoriteSuccess, (state, { id }) => ({
        ...state,
        favorites: state.favorites.filter(f => f.id !== id),
        loading: false
    })),
    on(FavoritesActions.removeFavoriteFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Clear error
    on(FavoritesActions.clearFavoritesError, (state) => ({
        ...state,
        error: null
    }))
);

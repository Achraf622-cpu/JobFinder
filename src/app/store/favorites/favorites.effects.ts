import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import * as FavoritesActions from './favorites.actions';
import { FavoriteOffer } from '../../models';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class FavoritesEffects {
    private actions$ = inject(Actions);
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private readonly API_URL = 'http://localhost:3000';

    loadFavorites$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.loadFavorites),
            switchMap(() => {
                const user = this.authService.currentUser();
                if (!user) {
                    return of(FavoritesActions.loadFavoritesFailure({
                        error: 'Utilisateur non connecté'
                    }));
                }

                return this.http.get<FavoriteOffer[]>(
                    `${this.API_URL}/favoritesOffers?userId=${user.id}`
                ).pipe(
                    map(favorites => FavoritesActions.loadFavoritesSuccess({ favorites })),
                    catchError(error => of(FavoritesActions.loadFavoritesFailure({
                        error: error.message || 'Erreur lors du chargement des favoris'
                    })))
                );
            })
        )
    );

    addFavorite$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.addFavorite),
            mergeMap(({ favorite }) => {
                const user = this.authService.currentUser();
                if (!user) {
                    return of(FavoritesActions.addFavoriteFailure({
                        error: 'Utilisateur non connecté'
                    }));
                }

                const newFavorite: FavoriteOffer = {
                    ...favorite,
                    userId: user.id,
                    dateAdded: new Date().toISOString()
                };

                return this.http.post<FavoriteOffer>(
                    `${this.API_URL}/favoritesOffers`,
                    newFavorite
                ).pipe(
                    map(created => FavoritesActions.addFavoriteSuccess({ favorite: created })),
                    catchError(error => of(FavoritesActions.addFavoriteFailure({
                        error: error.message || 'Erreur lors de l\'ajout aux favoris'
                    })))
                );
            })
        )
    );

    removeFavorite$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.removeFavorite),
            mergeMap(({ id }) =>
                this.http.delete<void>(`${this.API_URL}/favoritesOffers/${id}`).pipe(
                    map(() => FavoritesActions.removeFavoriteSuccess({ id })),
                    catchError(error => of(FavoritesActions.removeFavoriteFailure({
                        error: error.message || 'Erreur lors de la suppression'
                    })))
                )
            )
        )
    );
}

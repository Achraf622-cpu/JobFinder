import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, catchError, of, throwError, forkJoin, switchMap } from 'rxjs';
import { User, AuthUser, LoginCredentials, RegisterData, FavoriteOffer, Application } from '../../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private readonly API_URL = 'http://localhost:3000';
    private readonly STORAGE_KEY = 'jobfinder_user';

    // Signal for reactive auth state
    private currentUserSignal = signal<AuthUser | null>(this.getStoredUser());

    // Public computed signals
    readonly currentUser = this.currentUserSignal.asReadonly();
    readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

    private getStoredUser(): AuthUser | null {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    private storeUser(user: AuthUser): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
    }

    private clearUser(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.currentUserSignal.set(null);
    }

    // createUser handles registration including email check
    createUser(user: User): Observable<AuthUser> {
        return this.http.post<User>(`${this.API_URL}/users`, user).pipe(
            map(createdUser => {
                const authUser: AuthUser = {
                    id: createdUser.id!,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    email: createdUser.email
                };
                this.storeUser(authUser);
                return authUser;
            })
        );
    }

    login(credentials: LoginCredentials): Observable<AuthUser> {
        return this.http.get<User[]>(`${this.API_URL}/users?email=${credentials.email}`).pipe(
            map(users => {
                if (users.length === 0) {
                    throw new Error('Email ou mot de passe incorrect');
                }

                const user = users[0];
                if (user.password !== credentials.password) {
                    throw new Error('Email ou mot de passe incorrect');
                }

                const authUser: AuthUser = {
                    id: user.id!,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                };

                this.storeUser(authUser);
                return authUser;
            }),
            catchError(err => throwError(() => err))
        );
    }

    logout(): void {
        this.clearUser();
        this.router.navigate(['/']);
    }

    updateProfile(data: Partial<User>): Observable<AuthUser> {
        const currentUser = this.currentUserSignal();
        if (!currentUser) {
            return throwError(() => new Error('Utilisateur non connecté'));
        }

        return this.http.patch<User>(`${this.API_URL}/users/${currentUser.id}`, data).pipe(
            map(updatedUser => {
                const authUser: AuthUser = {
                    id: updatedUser.id!,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email
                };
                this.storeUser(authUser);
                return authUser;
            })
        );
    }

    deleteAccount(): Observable<void> {
        const currentUser = this.currentUserSignal();
        if (!currentUser) {
            return throwError(() => new Error('Utilisateur non connecté'));
        }

        // Fetch user's favorites and applications, then delete them all before deleting the user
        return forkJoin({
            favorites: this.http.get<FavoriteOffer[]>(`${this.API_URL}/favoritesOffers?userId=${currentUser.id}`),
            applications: this.http.get<Application[]>(`${this.API_URL}/applications?userId=${currentUser.id}`)
        }).pipe(
            switchMap(({ favorites, applications }) => {
                // Build an array of all delete requests
                const deleteRequests: Observable<void>[] = [];

                favorites.forEach(fav => {
                    deleteRequests.push(this.http.delete<void>(`${this.API_URL}/favoritesOffers/${fav.id}`));
                });

                applications.forEach(app => {
                    deleteRequests.push(this.http.delete<void>(`${this.API_URL}/applications/${app.id}`));
                });

                // Delete user entity
                deleteRequests.push(this.http.delete<void>(`${this.API_URL}/users/${currentUser.id}`));

                // Execute all deletes in parallel (if no favorites/apps, just deletes user)
                return forkJoin(deleteRequests.length > 0 ? deleteRequests : [of(undefined as void)]);
            }),
            map(() => {
                this.clearUser();
                this.router.navigate(['/']);
            })
        );
    }

    checkEmailExists(email: string): Observable<boolean> {
        return this.http.get<User[]>(`${this.API_URL}/users?email=${email}`).pipe(
            map(users => users.length > 0)
        );
    }
}

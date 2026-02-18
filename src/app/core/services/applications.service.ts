import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Application, ApplicationStatus } from '../../models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ApplicationsService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private readonly API_URL = 'http://localhost:3000';

    getApplications(): Observable<Application[]> {
        const user = this.authService.currentUser();
        if (!user) {
            return throwError(() => new Error('Utilisateur non connecté'));
        }

        return this.http.get<Application[]>(
            `${this.API_URL}/applications?userId=${user.id}`
        );
    }

    addApplication(application: Omit<Application, 'id' | 'userId' | 'status' | 'notes' | 'dateAdded'>): Observable<Application> {
        const user = this.authService.currentUser();
        if (!user) {
            return throwError(() => new Error('Utilisateur non connecté'));
        }

        const newApplication: Application = {
            ...application,
            userId: user.id,
            status: 'en_attente',
            notes: '',
            dateAdded: new Date().toISOString()
        };

        return this.http.post<Application>(`${this.API_URL}/applications`, newApplication);
    }

    updateStatus(id: number, status: ApplicationStatus): Observable<Application> {
        return this.http.patch<Application>(
            `${this.API_URL}/applications/${id}`,
            { status }
        );
    }

    updateNotes(id: number, notes: string): Observable<Application> {
        return this.http.patch<Application>(
            `${this.API_URL}/applications/${id}`,
            { notes }
        );
    }

    deleteApplication(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/applications/${id}`);
    }

    checkApplicationExists(offerId: string): Observable<boolean> {
        const user = this.authService.currentUser();
        if (!user) return throwError(() => new Error('Utilisateur non connecté'));

        return this.http.get<Application[]>(
            `${this.API_URL}/applications?userId=${user.id}&offerId=${offerId}`
        ).pipe(
            map(apps => apps.length > 0)
        );
    }
}

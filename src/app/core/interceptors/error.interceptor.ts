import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Une erreur est survenue';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = error.error.message;
            } else {
                // Server-side error
                switch (error.status) {
                    case 0:
                        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que JSON Server est lancé.';
                        break;
                    case 400:
                        errorMessage = 'Requête invalide';
                        break;
                    case 401:
                        errorMessage = 'Non autorisé. Veuillez vous connecter.';
                        break;
                    case 403:
                        errorMessage = 'Accès interdit';
                        break;
                    case 404:
                        errorMessage = 'Ressource non trouvée';
                        break;
                    case 500:
                        errorMessage = 'Erreur serveur interne';
                        break;
                    default:
                        errorMessage = `Erreur: ${error.message}`;
                }
            }

            console.error('HTTP Error:', errorMessage, error);
            return throwError(() => new Error(errorMessage));
        })
    );
};

import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const platformId = inject(PLATFORM_ID);

    // During SSR, localStorage is not available, so we skip the guard.
    // The client-side hydration will enforce the guard correctly.
    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
    });

    return false;
};

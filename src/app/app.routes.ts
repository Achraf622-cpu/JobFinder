import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { SearchPageComponent } from './features/jobs/pages/search/search-page.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ProfileComponent } from './features/auth/pages/profile/profile.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'JobFinder - Accueil'
    },
    {
        path: 'search',
        component: SearchPageComponent,
        title: 'JobFinder - Rechercher'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'JobFinder - Connexion'
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'JobFinder - Inscription'
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard],
        title: 'JobFinder - Mon Profil'
    },
    {
        path: 'favorites',
        loadChildren: () => import('./features/favorites/favorites.routes'),
        canActivate: [authGuard],
        title: 'JobFinder - Mes Favoris'
    },
    {
        path: 'applications',
        loadChildren: () => import('./features/applications/applications.routes'),
        canActivate: [authGuard],
        title: 'JobFinder - Mes Candidatures'
    },
    {
        path: '**',
        redirectTo: ''
    }
];

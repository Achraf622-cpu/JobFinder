import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  searchKeywords = '';
  searchLocation = '';
  selectedSource = '';
  selectedCountry = 'fr';
  resultsPerPage = 10;
  showFilters = signal(false);

  goToSearch(): void {
    const params: any = {};
    if (this.searchKeywords) params.keywords = this.searchKeywords;
    if (this.searchLocation) params.location = this.searchLocation;
    if (this.selectedSource) params.source = this.selectedSource;
    if (this.selectedCountry) params.country = this.selectedCountry;
    if (this.resultsPerPage) params.resultsPerPage = this.resultsPerPage;

    this.router.navigate(['/search'], { queryParams: params });
  }
}

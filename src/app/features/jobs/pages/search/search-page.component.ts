import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../../core/services/job.service';
import { ApplicationsService } from '../../../../core/services/applications.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Job, JobSearchResult } from '../../../../models';
import { JobCardComponent } from '../../components/job-card/job-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Store } from '@ngrx/store';
import { loadFavorites } from '../../../../store/favorites';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JobCardComponent,
    LoadingSpinnerComponent,
    PaginationComponent
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent implements OnInit {
  private jobService = inject(JobService);
  private applicationsService = inject(ApplicationsService);
  private authService = inject(AuthService);
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  keywords = '';
  location = '';
  selectedSource = '';
  selectedCountry = 'fr';
  resultsPerPage = 10;

  showFilters = signal(false);
  jobs = signal<Job[]>([]);
  totalResults = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  hasSearched = signal(false);
  currentSource = signal('');

  showToast = signal(false);
  toastMessage = signal('');

  isLoading = this.jobService.isLoading;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.store.dispatch(loadFavorites());
    }

    this.route.queryParams.subscribe(params => {
      if (params['keywords']) this.keywords = params['keywords'];
      if (params['location']) this.location = params['location'];
      if (this.keywords || this.location) this.search();
    });
  }

  search(page: number = 1): void {
    if (!this.keywords.trim() && !this.location.trim()) return;

    this.hasSearched.set(true);
    this.currentPage.set(page);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keywords: this.keywords || null,
        location: this.location || null
      },
      queryParamsHandling: 'merge'
    });

    const searchParams = {
      keywords: this.keywords,
      location: this.location,
      page,
      resultsPerPage: this.resultsPerPage,
      country: this.selectedCountry
    };

    const searchObs = this.selectedSource
      ? this.jobService.searchBySource(this.selectedSource as any, searchParams)
      : this.jobService.searchJobs(searchParams);

    searchObs.subscribe({
      next: (result: JobSearchResult) => {
        this.jobs.set(result.jobs);
        this.totalResults.set(result.totalResults);
        this.totalPages.set(result.totalPages);
        if (result.jobs.length > 0) {
          this.currentSource.set(result.jobs[0].apiSource);
        }
      },
      error: (err) => {
        console.error('Search error:', err);
        this.jobs.set([]);
      }
    });
  }

  onPageChange(page: number): void {
    this.search(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackApplication(job: Job): void {
    this.applicationsService.checkApplicationExists(job.id).subscribe({
      next: (exists) => {
        if (exists) {
          this.showToastMessage('Already in your applications');
          return;
        }

        this.applicationsService.addApplication({
          offerId: job.id,
          apiSource: job.apiSource,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url
        }).subscribe({
          next: () => this.showToastMessage('Added to applications'),
          error: () => this.showToastMessage('Error adding application')
        });
      }
    });
  }

  private showToastMessage(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of, forkJoin, throwError } from 'rxjs';
import { Job, JobSearchParams, JobSearchResult } from '../../models';

@Injectable({
    providedIn: 'root'
})
export class JobService {
    private http = inject(HttpClient);


    private readonly ADZUNA_APP_ID = 'b1b98c30';
    private readonly ADZUNA_API_KEY = '8c46f07d32e8f9b28a5e29f426b6e89e';
    private readonly ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

    private readonly ARBEITNOW_BASE_URL = 'https://www.arbeitnow.com/api/job-board-api';

    private readonly USAJOBS_API_KEY = 'Jt6OMaNOtwvvZjQ7i2d50yI+gw2R3fGf73WcvTMYf2Y=';
    private readonly USAJOBS_BASE_URL = 'https://data.usajobs.gov/api/search';

    readonly isLoading = signal(false);

    searchJobs(params: JobSearchParams): Observable<JobSearchResult> {
        this.isLoading.set(true);

        const page = params.page || 1;
        const resultsPerPage = params.resultsPerPage || 10;

        return this.searchAdzuna(params, page, resultsPerPage).pipe(
            map(result => {
                this.isLoading.set(false);
                return result;
            }),
            catchError(error => {
                console.warn('Adzuna failed, trying Arbeitnow...', error);
                return this.searchArbeitnow(params, page, resultsPerPage).pipe(
                    map(result => {
                        this.isLoading.set(false);
                        return result;
                    }),
                    catchError(err2 => {
                        console.warn('Arbeitnow failed, trying USA Jobs...', err2);
                        return this.searchUSAJobs(params, page, resultsPerPage).pipe(
                            map(result => {
                                this.isLoading.set(false);
                                return result;
                            }),
                            catchError(err3 => {
                                this.isLoading.set(false);
                                console.error('All APIs failed:', err3);
                                return of({
                                    jobs: [],
                                    totalResults: 0,
                                    currentPage: page,
                                    totalPages: 0
                                });
                            })
                        );
                    })
                );
            })
        );
    }

    // Search specific API
    searchBySource(source: 'adzuna' | 'arbeitnow' | 'usajobs', params: JobSearchParams): Observable<JobSearchResult> {
        this.isLoading.set(true);
        const page = params.page || 1;
        const resultsPerPage = params.resultsPerPage || 10;

        let observable: Observable<JobSearchResult>;

        switch (source) {
            case 'adzuna':
                observable = this.searchAdzuna(params, page, resultsPerPage);
                break;
            case 'arbeitnow':
                observable = this.searchArbeitnow(params, page, resultsPerPage);
                break;
            case 'usajobs':
                observable = this.searchUSAJobs(params, page, resultsPerPage);
                break;
        }

        return observable.pipe(
            map(result => {
                this.isLoading.set(false);
                return result;
            }),
            catchError(error => {
                this.isLoading.set(false);
                console.error(`${source} search failed:`, error);
                return of({
                    jobs: [],
                    totalResults: 0,
                    currentPage: page,
                    totalPages: 0
                });
            })
        );
    }

    // ===== ADZUNA API =====
    private searchAdzuna(params: JobSearchParams, page: number, resultsPerPage: number): Observable<JobSearchResult> {
        let httpParams = new HttpParams()
            .set('app_id', this.ADZUNA_APP_ID)
            .set('app_key', this.ADZUNA_API_KEY)
            .set('results_per_page', resultsPerPage.toString())
            .set('what_and', params.keywords)
            .set('title_only', '1')
            .set('sort_by', 'date');

        if (params.location) {
            httpParams = httpParams.set('where', params.location);
        }

        // Use FR for France, GB for UK, US for USA
        const country = params.country || 'fr';
        const url = `${this.ADZUNA_BASE_URL}/${country}/search/${page}`;

        return this.http.get<any>(url, { params: httpParams }).pipe(
            map(response => {
                let jobs: Job[] = (response.results || []).map((item: any) => this.mapAdzunaJob(item));

                // Client-side filter: only keep jobs with keyword in title
                if (params.keywords && params.keywords.trim()) {
                    const keywords = params.keywords.toLowerCase().split(/\s+/);
                    jobs = jobs.filter(job => {
                        const titleText = job.title.toLowerCase();
                        return keywords.some(kw => titleText.includes(kw));
                    });
                }

                return {
                    jobs,
                    totalResults: jobs.length,
                    currentPage: page,
                    totalPages: Math.ceil(jobs.length / resultsPerPage) || 1
                };
            })
        );
    }

    private mapAdzunaJob(item: any): Job {
        return {
            id: item.id?.toString() || crypto.randomUUID(),
            title: item.title || 'Poste non spécifié',
            company: item.company?.display_name || 'Entreprise non spécifiée',
            location: item.location?.display_name || 'Lieu non spécifié',
            description: this.cleanDescription(item.description || ''),
            url: item.redirect_url || '#',
            salary: this.formatSalary(item.salary_min, item.salary_max),
            publishedDate: item.created || new Date().toISOString(),
            apiSource: 'adzuna'
        };
    }

    // ===== ARBEITNOW API =====
    private searchArbeitnow(params: JobSearchParams, page: number, resultsPerPage: number): Observable<JobSearchResult> {
        // Arbeitnow API search param doesn't filter well, so we filter client-side
        const url = `${this.ARBEITNOW_BASE_URL}?page=${page}`;

        return this.http.get<any>(url).pipe(
            map(response => {
                const allJobs = response.data || [];
                let jobs: Job[] = allJobs.map((item: any) => this.mapArbeitnowJob(item));

                // Filter by keywords in title only
                if (params.keywords && params.keywords.trim()) {
                    const keywords = params.keywords.toLowerCase().split(/\s+/);
                    jobs = jobs.filter(job => {
                        const titleText = job.title.toLowerCase();
                        return keywords.some(kw => titleText.includes(kw));
                    });
                }

                // Filter by location if specified
                if (params.location && params.location.trim()) {
                    const loc = params.location.toLowerCase();
                    jobs = jobs.filter(j => j.location.toLowerCase().includes(loc));
                }

                return {
                    jobs: jobs.slice(0, resultsPerPage),
                    totalResults: jobs.length,
                    currentPage: page,
                    totalPages: Math.ceil(jobs.length / resultsPerPage) || 1
                };
            })
        );
    }

    private mapArbeitnowJob(item: any): Job {
        return {
            id: item.slug || crypto.randomUUID(),
            title: item.title || 'Poste non spécifié',
            company: item.company_name || 'Entreprise non spécifiée',
            location: item.location || (item.remote ? 'Remote' : 'Lieu non spécifié'),
            description: this.cleanDescription(item.description || ''),
            url: item.url || '#',
            salary: item.salary || undefined,
            publishedDate: item.created_at || new Date().toISOString(),
            apiSource: 'arbeitnow'
        };
    }

    // ===== USA JOBS API =====
    private searchUSAJobs(params: JobSearchParams, page: number, resultsPerPage: number): Observable<JobSearchResult> {
        const headers = new HttpHeaders({
            'Authorization-Key': this.USAJOBS_API_KEY,
            'User-Agent': 'jobfinder-angular-app'
        });

        let httpParams = new HttpParams()
            .set('Page', page.toString())
            .set('ResultsPerPage', resultsPerPage.toString());

        if (params.keywords) {
            httpParams = httpParams.set('PositionTitle', params.keywords);
        }
        if (params.location) {
            httpParams = httpParams.set('LocationName', params.location);
        }

        return this.http.get<any>(this.USAJOBS_BASE_URL, { headers, params: httpParams }).pipe(
            map(response => {
                const results = response.SearchResult?.SearchResultItems || [];
                let jobs: Job[] = results.map((item: any) => this.mapUSAJob(item.MatchedObjectDescriptor));

                // Client-side filter: only keep jobs with keyword in title
                if (params.keywords && params.keywords.trim()) {
                    const keywords = params.keywords.toLowerCase().split(/\s+/);
                    jobs = jobs.filter(job => {
                        const titleText = job.title.toLowerCase();
                        return keywords.some(kw => titleText.includes(kw));
                    });
                }

                return {
                    jobs,
                    totalResults: jobs.length,
                    currentPage: page,
                    totalPages: Math.ceil(jobs.length / resultsPerPage) || 1
                };
            })
        );
    }

    private mapUSAJob(item: any): Job {
        const salary = item.PositionRemuneration?.[0];
        const salaryStr = salary
            ? `$${this.formatNumber(salary.MinimumRange)} - $${this.formatNumber(salary.MaximumRange)} / ${salary.RateIntervalCode}`
            : undefined;

        return {
            id: item.PositionID || crypto.randomUUID(),
            title: item.PositionTitle || 'Position not specified',
            company: item.OrganizationName || item.DepartmentName || 'US Government',
            location: item.PositionLocationDisplay || 'Location not specified',
            description: this.cleanDescription(item.QualificationSummary || item.UserArea?.Details?.MajorDuties?.join(' ') || ''),
            url: item.PositionURI || item.ApplyURI?.[0] || '#',
            salary: salaryStr,
            publishedDate: item.PublicationStartDate || new Date().toISOString(),
            apiSource: 'usajobs'
        };
    }

    // ===== HELPERS =====
    private formatSalary(min?: number, max?: number): string | undefined {
        if (!min && !max) return undefined;
        if (min && max) return `${this.formatNumber(min)} - ${this.formatNumber(max)} €`;
        if (min) return `À partir de ${this.formatNumber(min)} €`;
        if (max) return `Jusqu'à ${this.formatNumber(max)} €`;
        return undefined;
    }

    private formatNumber(num: number): string {
        return new Intl.NumberFormat('fr-FR').format(num);
    }

    private cleanDescription(text: string): string {
        // Remove HTML tags
        return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
}

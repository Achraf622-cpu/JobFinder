
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    salary?: string;
    publishedDate: string;
    apiSource: 'adzuna' | 'arbeitnow' | 'usajobs';
}


export interface JobSearchParams {
    keywords: string;
    location: string;
    page?: number;
    resultsPerPage?: number;
    country?: string; 
}


export interface JobSearchResult {
    jobs: Job[];
    totalResults: number;
    currentPage: number;
    totalPages: number;
}

// Application status enum
export type ApplicationStatus = 'en_attente' | 'accepte' | 'refuse';

// Job application tracking model
export interface Application {
    id?: number;
    userId: number;
    offerId: string;
    apiSource: 'adzuna' | 'arbeitnow' | 'usajobs';
    title: string;
    company: string;
    location: string;
    url: string;
    status: ApplicationStatus;
    notes: string;
    dateAdded: string;
}

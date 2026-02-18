// Favorite offer stored in JSON Server
export interface FavoriteOffer {
    id?: number;
    userId: number;
    offerId: string;
    title: string;
    company: string;
    location: string;
    url: string;
    apiSource: 'adzuna' | 'arbeitnow' | 'usajobs';
    dateAdded: string;
}

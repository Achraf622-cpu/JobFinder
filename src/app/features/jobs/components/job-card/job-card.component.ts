import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../../../models';
import { AuthService } from '../../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { selectFavoriteByOfferId, addFavorite, removeFavorite } from '../../../../store/favorites';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-card.component.html',
  styleUrl: './job-card.component.css'
})
export class JobCardComponent {
  job = input.required<Job>();
  onTrackApplication = output<Job>();

  authService = inject(AuthService);
  private store = inject(Store);

  isFavorite(): boolean {
    const favorite = this.store.selectSignal(selectFavoriteByOfferId(this.job().id));
    return !!favorite();
  }

  toggleFavorite(): void {
    const job = this.job();
    const favorite = this.store.selectSignal(selectFavoriteByOfferId(job.id))();

    if (favorite) {
      this.store.dispatch(removeFavorite({ id: favorite.id! }));
    } else {
      this.store.dispatch(addFavorite({
        favorite: {
          offerId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          apiSource: job.apiSource
        }
      }));
    }
  }

  trackApplication(): void {
    this.onTrackApplication.emit(this.job());
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  truncateDescription(text: string): string {
    const maxLength = 160;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  getApiLabel(source: string): string {
    const labels: Record<string, string> = {
      'adzuna': 'Adzuna',
      'arbeitnow': 'Arbeitnow',
      'usajobs': 'USA Jobs'
    };
    return labels[source] || source;
  }
}

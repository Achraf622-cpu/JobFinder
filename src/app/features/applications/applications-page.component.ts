import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationsService } from '../../core/services/applications.service';
import { Application, ApplicationStatus } from '../../models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-applications-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent],
  templateUrl: './applications-page.component.html',
  styleUrl: './applications-page.component.css'
})
export class ApplicationsPageComponent implements OnInit {
  private applicationsService = inject(ApplicationsService);

  applications = signal<Application[]>([]);
  isLoading = signal(true);
  showToast = signal(false);
  toastMessage = signal('');

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.applicationsService.getApplications().subscribe({
      next: (apps) => {
        apps.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        this.applications.set(apps);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.isLoading.set(false);
      }
    });
  }

  getStatusCount(status: ApplicationStatus): number {
    return this.applications().filter(app => app.status === status).length;
  }

  updateStatus(app: Application, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as ApplicationStatus;

    this.applicationsService.updateStatus(app.id!, newStatus).subscribe({
      next: () => {
        const apps = this.applications().map(a =>
          a.id === app.id ? { ...a, status: newStatus } : a
        );
        this.applications.set(apps);
        this.showToastMessage('Status updated');
      },
      error: () => this.showToastMessage('Error updating status')
    });
  }

  updateNotes(app: Application, event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const newNotes = textarea.value;

    if (newNotes === app.notes) return;

    this.applicationsService.updateNotes(app.id!, newNotes).subscribe({
      next: () => {
        const apps = this.applications().map(a =>
          a.id === app.id ? { ...a, notes: newNotes } : a
        );
        this.applications.set(apps);
        this.showToastMessage('Notes saved');
      },
      error: () => console.error('Error updating notes')
    });
  }

  deleteApplication(app: Application): void {
    if (!confirm('Remove this application from tracking?')) return;

    this.applicationsService.deleteApplication(app.id!).subscribe({
      next: () => {
        const apps = this.applications().filter(a => a.id !== app.id);
        this.applications.set(apps);
        this.showToastMessage('Application removed');
      },
      error: () => this.showToastMessage('Error removing application')
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  private showToastMessage(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}

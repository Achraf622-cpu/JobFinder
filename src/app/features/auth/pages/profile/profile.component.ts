import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileForm!: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  showDeleteConfirm = signal(false);

  ngOnInit(): void {
    const user = this.authService.currentUser();

    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      lastName: [user?.lastName || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      newPassword: ['', Validators.minLength(6)]
    });
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { firstName, lastName, email, newPassword } = this.profileForm.value;
    const updateData: any = { firstName, lastName, email };

    if (newPassword) {
      updateData.password = newPassword;
    }

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        this.successMessage.set('Profil mis à jour avec succès!');
        this.isLoading.set(false);
        this.profileForm.get('newPassword')?.reset();
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erreur lors de la mise à jour');
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  deleteAccount(): void {
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erreur lors de la suppression');
        this.showDeleteConfirm.set(false);
      }
    });
  }
}

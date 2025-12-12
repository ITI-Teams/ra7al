import { Component } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService } from '../../core/services/profile/profile-service';
import { FavouriteService } from '../../core/services/favourite/favourite-service';
import { AuthService } from '../../core/services/authService/auth.service';
import {
  RentalRequest,
  RentalRequestService,
  RentalRequestResponse,
} from '../../core/services/rental-request-service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    NgClass,
    NgIf,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css'],
})
export class StudentProfile {
  properties: any[] = [];

  // Rental Requests
  rentalRequests: RentalRequest[] = [];
  rentalRequestsLoading: boolean = false;
  selectedRequestStatus: string = '';
  currentRequestPage: number = 1;
  totalRequestPages: number = 1;
  totalRequests: number = 0;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast: boolean = false;

  profile: any;
  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;

  profileForm: FormGroup;

  isEditing = false;
  activeTab: string = 'favourites';
  user: any = null;

  constructor(
    private fb: FormBuilder,
    private profileSrv: ProfileService,
    private cdr: ChangeDetectorRef,
    private favouriteService: FavouriteService,
    private router: Router,
    private auth: AuthService,
    private rentalRequestService: RentalRequestService
  ) {
    this.profileForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.pattern(/^(?!\s*$)[\p{L}\s]+$/u)],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6), Validators.maxLength(20)]],
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(5), Validators.max(120)]],
      habits: [''],
      preferences: [''],
      roommate_style: [
        '',
        [Validators.required, Validators.pattern(/^(?!\s*$)[\p{L}\s]+$/u)],
      ],
      cleanliness_level: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]$/)],
      ],
      smoking: ['', Validators.required],
      pets: ['', Validators.required],
      bio: ['', Validators.required],
      avatar: [''],
    });

    // Subscribe to user changes
    this.auth.user$.subscribe((user) => {
      this.user = user;
    });

    // Listen to storage changes
    window.addEventListener('storage', () => {
      const user = this.auth.getUser();
      this.user = user;
    });
  }

  changeTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'requests') {
      this.loadRentalRequests();
    }
  }
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }
  ngOnInit(): void {
    this.cdr.detectChanges();
    this.loadProfile();
    this.loadFavourites();
  }

  loadProfile() {
    this.profileSrv.getProfile().subscribe({
      next: ({ profile }) => {
        // Backend returns avatar as path: images/users/avatar/avatar_23_...jpg
        // avatarUrl() method will handle building the full URL
        if (!profile.avatar) {
          profile.avatar = undefined;
        }

        this.profile = profile;
        this.cdr.detectChanges();

        console.log(this.profile);

        /** Parse fields if returned as string */
        if (profile.habits && typeof profile.habits === 'string') {
          profile.habits = JSON.parse(profile.habits);
        }

        if (profile.preferences && typeof profile.preferences === 'string') {
          profile.preferences = JSON.parse(profile.preferences);
        }

        /** Normalize boolean values */
        profile.smoking = Number(profile.smoking) === 1 ? 'yes' : 'no';
        profile.pets = Number(profile.pets) === 1 ? 'yes' : 'no';

        /** Protect from invalid gender */
        if (profile.gender !== 'male' && profile.gender !== 'female') {
          profile.gender = '';
        }

        /** Update form */
        this.profileForm.patchValue({
          ...profile,
          password: '',
        });
      },
      error: (err) => console.error(err),
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
  saveData() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showToastMessage(
        'Please fix the errors in the form before saving.',
        'error'
      );
      return;
    }

    const raw = this.profileForm.getRawValue();

    const payload = {
      ...raw,
      age: raw.age ? Number(raw.age) : null,
      cleanliness_level: raw.cleanliness_level
        ? Number(raw.cleanliness_level)
        : null,
      smoking: raw.smoking === 'yes' ? 1 : 0,
      pets: raw.pets === 'yes' ? 1 : 0,
      bio: raw.bio,
      gender: raw.gender || null,
      habits: Array.isArray(raw.habits)
        ? raw.habits
        : raw.habits?.split(',').map((h: string) => h.trim()) || [],
      preferences: Array.isArray(raw.preferences)
        ? raw.preferences
        : raw.preferences?.split(',').map((p: string) => p.trim()) || [],
    };

    console.log('Payload to send:', payload);

    // If avatar file selected, send as FormData so backend can process file upload
    if (this.selectedAvatarFile) {
      const form = new FormData();
      Object.keys(payload).forEach((k) => {
        const v: any = (payload as any)[k];
        if (v === null || v === undefined) return;
        if (Array.isArray(v) || typeof v === 'object') {
          form.append(k, JSON.stringify(v));
        } else {
          form.append(k, String(v));
        }
      });
      form.append('avatar', this.selectedAvatarFile as File);

      this.profileSrv.saveProfile(form).subscribe({
        next: (res) => {
          this.showToastMessage('Data saved successfully', 'success');

          if (res && res.profile) {
            const updated = {
              ...res.profile,
              smoking: res.profile.smoking === 1 ? 'yes' : 'no',
              pets: res.profile.pets === 1 ? 'yes' : 'no',
            };

            // Parse habits if string
            if (updated.habits && typeof updated.habits === 'string') {
              try {
                updated.habits = JSON.parse(updated.habits);
              } catch {
                updated.habits = updated.habits
                  .split(',')
                  .map((h: string) => h.trim());
              }
            } else if (!Array.isArray(updated.habits)) {
              updated.habits = [];
            }

            // Parse preferences if string
            if (
              updated.preferences &&
              typeof updated.preferences === 'string'
            ) {
              try {
                updated.preferences = JSON.parse(updated.preferences);
              } catch {
                updated.preferences = [updated.preferences];
              }
            } else if (!Array.isArray(updated.preferences)) {
              updated.preferences = [];
            }

            if (
              updated.avatar &&
              typeof updated.avatar === 'string' &&
              updated.avatar.includes('/images/users/')
            ) {
              updated.avatar = updated.avatar.replace(
                '://localhost:8000/',
                '://localhost:8000/storage/'
              );
            }

            this.profile = updated;

            // Update selectedHabits for the dropdown
            if (Array.isArray(updated.habits)) {
              this.selectedHabits = updated.habits;
            }

            this.profileForm.patchValue({
              ...updated,
              password: '',
              habits: Array.isArray(updated.habits)
                ? updated.habits.join(', ')
                : '',
            });

            this.cdr.detectChanges();
          }

          this.isEditing = false;
        },
        error: (err) => {
          console.log('Error status:', err.status);
          console.log('Error body:', err.error);
          this.showToastMessage(
            'An error occurred while saving. Please try again.',
            'error'
          );
        },
      });

      return;
    }

    this.profileSrv.saveProfile(payload).subscribe({
      next: (res) => {
        this.showToastMessage('Data saved successfully', 'success');

        // Update local profile and form with server response
        if (res && res.profile) {
          const updated = {
            ...res.profile,
            smoking: res.profile.smoking === 1 ? 'yes' : 'no',
            pets: res.profile.pets === 1 ? 'yes' : 'no',
          };

          // Parse habits if string
          if (updated.habits && typeof updated.habits === 'string') {
            try {
              updated.habits = JSON.parse(updated.habits);
            } catch {
              updated.habits = updated.habits
                .split(',')
                .map((h: string) => h.trim());
            }
          } else if (!Array.isArray(updated.habits)) {
            updated.habits = [];
          }

          // Parse preferences if string
          if (updated.preferences && typeof updated.preferences === 'string') {
            try {
              updated.preferences = JSON.parse(updated.preferences);
            } catch {
              updated.preferences = [updated.preferences];
            }
          } else if (!Array.isArray(updated.preferences)) {
            updated.preferences = [];
          }

          // replace avatar path if necessary
          if (
            updated.avatar &&
            typeof updated.avatar === 'string' &&
            updated.avatar.includes('/images/users/')
          ) {
            updated.avatar = updated.avatar.replace(
              '://localhost:8000/',
              '://localhost:8000/storage/'
            );
          }

          this.profile = updated;

          // Update selectedHabits for the dropdown
          if (Array.isArray(updated.habits)) {
            this.selectedHabits = updated.habits;
          }

          // Ensure form shows updated values
          this.profileForm.patchValue({
            ...updated,
            password: '',
            habits: Array.isArray(updated.habits)
              ? updated.habits.join(', ')
              : '',
          });

          this.cdr.detectChanges();
        }

        this.isEditing = false;
      },
      error: (err) => {
        // console.error('Error while saving:', err);

        console.log('Error status:', err.status);
        console.log('Error body:', err.error);
        console.log('Full error:', err);
        this.showToastMessage(
          'An error occurred while saving. Please try again.',
          'error'
        );
      },
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.selectedAvatarFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;

      // Show preview confirmation dialog
      const isDark = document.documentElement.classList.contains('dark');

      Swal.fire({
        // 🔥 Dark mode support
        background: isDark ? '#1f2937' : '#ffffff', // gray-800
        color: isDark ? '#e5e7eb' : '#111827', // gray-200 / gray-900
        iconColor: isDark ? '#fbbf24' : '#f59e0b', // amber

        title: 'Update Photo?',
        html: `
        <div class="flex flex-col items-center gap-4">
          <img src="${this.avatarPreview}" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
          <p class="text-gray-600 dark:text-gray-300">Confirm to update your profile photo</p>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: 'Update Photo',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#6b7280',
        customClass: {
          popup: 'bg-white dark:bg-gray-900 rounded-2xl',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300',
          confirmButton: 'py-2 px-6 rounded-lg',
          cancelButton: 'py-2 px-6 rounded-lg',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.saveAvatarOnly();
        } else {
          // Reset on cancel
          this.selectedAvatarFile = null;
          this.avatarPreview = null;
          input.value = '';
        }
      });
    };
    reader.readAsDataURL(this.selectedAvatarFile);
  }

  saveAvatarOnly() {
    if (!this.selectedAvatarFile) {
      this.showToastMessage('No file selected', 'error');
      return;
    }

    this.profileSrv.uploadAvatar(this.selectedAvatarFile).subscribe({
      next: (res: any) => {
        this.showToastMessage('Photo updated successfully', 'success');

        if (res && res.profile && res.profile.avatar) {
          // Backend returns just the path: images/users/avatar/avatar_23_1702225800.jpg
          const avatarPath = res.profile.avatar;

          this.profile.avatar = avatarPath;
          this.user.avatar = avatarPath;
          this.auth.updateUserAvatar(avatarPath);
        }

        this.selectedAvatarFile = null;
        this.avatarPreview = null;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error uploading avatar:', err);
        this.showToastMessage(
          'Failed to update photo. Please try again.',
          'error'
        );
        this.selectedAvatarFile = null;
        this.avatarPreview = null;
      },
    });
  }

  loadFavourites() {
    this.favouriteService.getMyFavourites().subscribe((res) => {
      console.log((this.properties = res));
    });
  }

  viewProperty(property: any) {
    this.router.navigate(['/properties', property.id]);
  }

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 3; // 3 per row × 2 rows

  get paginatedProperties() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.properties.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.properties.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
  // Dropdown state
  // Dropdown toggle
  dropdown = { habits: false };

  // Options list
  habitsOptions = ['Reading', 'Sports', 'Music', 'Gaming', 'Traveling'];

  // Selected items
  selectedHabits: string[] = [];

  // Toggle dropdown open/close
  toggleDropdown(type: 'habits') {
    this.dropdown[type] = !this.dropdown[type];
  }

  // Select habit
  selectHabit(option: string) {
    if (!this.selectedHabits.includes(option)) {
      this.selectedHabits.push(option);
      this.updateFormHabits();
    }
  }

  // Remove selected habit
  removeHabit(option: string) {
    this.selectedHabits = this.selectedHabits.filter((h) => h !== option);
    this.updateFormHabits();
  }

  // Update form control
  private updateFormHabits() {
    this.profileForm.patchValue({
      habits: this.selectedHabits.join(', '),
    });
  }
  avatarUrl(): string {
    if (!this.user) return '/assets/default-avatar.svg';
    if (this.user.avatar) {
      return `${this.auth.getBackendBase()}/storage/${this.user.avatar}`;
    }
    const name = (this.user.name || '').trim();
    let initials = '';
    if (name.length === 0) initials = '??';
    else {
      const parts = name.split(/\s+/).filter(Boolean);
      initials =
        parts.length === 1
          ? parts[0].slice(0, 2).toUpperCase()
          : (parts[0][0] + (parts[1][0] || '')).toUpperCase();
    }
    const bg = '#667eea';
    const fg = '#ffffff';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
      <rect width='100%' height='100%' fill='${bg}' rx='16' />
      <text x='50%' y='50%' dy='.1em' text-anchor='middle' fill='${fg}' font-family='Helvetica, Arial, sans-serif' font-size='52'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  openAvatarModal() {
    const isDark = document.documentElement.classList.contains('dark');

    Swal.fire({
      // 🔥 Dark mode support
      background: isDark ? '#1f2937' : '#ffffff', // gray-800
      color: isDark ? '#e5e7eb' : '#111827', // gray-200 / gray-900
      iconColor: isDark ? '#fbbf24' : '#f59e0b', // amber
      html: `
      <div class="relative flex flex-col items-center">

        <!-- Floating Glow Circle -->
        <div class="absolute w-40 h-40 bg-linear-to-r from-orange-500 to-pink-500
                    rounded-full blur-2xl opacity-40 animate-glow"></div>

        <!-- Avatar -->
        <img src="${this.avatarUrl()}"
             class="relative w-40 h-40 rounded-3xl object-cover shadow-2xl border-4
                    border-white dark:border-gray-700 animate-pop" />

        <!-- Username -->
        <h2 class="mt-4 text-xl font-bold dark:text-white">${
          this.profileForm.get('name')?.value
        }</h2>

        <!-- Email -->
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          ${this.profile?.email}
        </p>

        <!-- Upload Button -->
        <button id="changePhotoBtn"
                class="w-full mt-3 cursor-pointer py-3 rounded-xl text-white font-semibold
                       bg-linear-to-r from-orange-500 to-pink-500 shadow-lg
                       hover:scale-105 transition-all flex items-center justify-center gap-2">
          <i class="pi pi-camera"></i> Change Photo
        </button>

        <!-- Remove -->
        <button id="removeAvatarBtn"
                class="w-full mt-2 py-3 rounded-xl text-white font-semibold
                       bg-linear-to-r from-red-500 to-rose-500 shadow-lg
                       hover:scale-105 transition-all flex items-center justify-center gap-2">
          <i class="pi pi-times"></i> Remove Photo
        </button>

      </div>
    `,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup:
          'bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl animate-popupEnter',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300',
      },
      didOpen: () => {
        // Change Photo Button - Click file input
        const changePhotoBtn = document.getElementById('changePhotoBtn');
        changePhotoBtn?.addEventListener('click', () => {
          const fileInput = document.getElementById(
            'avatarInput'
          ) as HTMLInputElement;
          fileInput?.click();
        });

        // Remove Avatar Button - Confirm removal
        const removeBtn = document.getElementById('removeAvatarBtn');
        removeBtn?.addEventListener('click', () => {
          Swal.close();
          this.confirmRemoveAvatar();
        });
      },
    });
  }

  confirmRemoveAvatar() {
    const isDark = document.documentElement.classList.contains('dark');

    Swal.fire({
      // 🔥 Dark mode support
      background: isDark ? '#1f2937' : '#ffffff', // gray-800
      color: isDark ? '#e5e7eb' : '#111827', // gray-200 / gray-900
      iconColor: isDark ? '#fbbf24' : '#f59e0b', // amber
      title: 'Remove Photo?',
      text: 'Are you sure you want to remove your profile photo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-white dark:bg-gray-900 rounded-2xl',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-gray-300',
        confirmButton: 'py-2 px-6 rounded-lg',
        cancelButton: 'py-2 px-6 rounded-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeAvatarFromDatabase();
      }
    });
  }

  removeAvatarFromDatabase() {
    this.profileSrv.removeAvatar().subscribe({
      next: (res: any) => {
        this.showToastMessage('Photo removed successfully', 'success');
        this.profile.avatar = null;
        this.profileForm.patchValue({ avatar: null });
        this.avatarPreview = null;
        this.selectedAvatarFile = null;
        this.user.avatar = null;

        // Update user in localStorage
        this.auth.updateUserAvatar(null);

        this.cdr.detectChanges();

        const isDark = document.documentElement.classList.contains('dark');
      },
      error: (err: any) => {
        this.showToastMessage(
          'Failed to remove photo. Please try again.',
          'error'
        );
        console.error('Error removing avatar:', err);
      },
    });
  }

  // Load Rental Requests
  loadRentalRequests() {
    this.rentalRequestsLoading = true;
    this.rentalRequestService
      .getMyRequests(
        this.selectedRequestStatus || undefined,
        this.currentRequestPage,
        6
      )
      .subscribe({
        next: (response: RentalRequestResponse) => {
          this.rentalRequests = response.data;
          this.currentRequestPage = response.current_page;
          this.totalRequestPages = response.last_page;
          this.totalRequests = response.total;
          this.rentalRequestsLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading rental requests:', error);
          this.rentalRequestsLoading = false;
          this.showToastMessage('Failed to load rental requests', 'error');
        },
      });
  }

  // Filter requests by status
  filterRequestsByStatus(status: string) {
    this.selectedRequestStatus = status;
    this.currentRequestPage = 1;
    this.loadRentalRequests();
  }

  // Change request page
  changeRequestPage(page: number) {
    if (page >= 1 && page <= this.totalRequestPages) {
      this.currentRequestPage = page;
      this.loadRentalRequests();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  // Get status text in Arabic
  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      case 'pending':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      default:
        return status;
    }
  }

  // View property details
  viewPropertyFromRequest(propertyId: number) {
    this.router.navigate(['/properties', propertyId]);
  }
}

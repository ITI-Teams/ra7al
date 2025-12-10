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

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports:  [FormsModule,RouterModule , NgClass,NgIf,ReactiveFormsModule,CommonModule],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css'],
})
export class StudentProfile {
  properties: any[] = [];

toastMessage: string = '';
toastType: 'success' | 'error' = 'success';
showToast: boolean = false;

    profile:any;
    selectedAvatarFile: File | null = null;
    avatarPreview: string | null = null;


   profileForm: FormGroup;

    isEditing = false;
  activeTab: string = 'favourites';
    user: any = null;

  constructor(private fb: FormBuilder, private profileSrv: ProfileService,private cdr: ChangeDetectorRef,   private favouriteService: FavouriteService ,  private router: Router, private auth: AuthService) {
  this.profileForm = this.fb.group({
  name: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[\p{L}\s]+$/u)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.minLength(6), Validators.maxLength(20)]],
  gender:['',Validators.required],
  age: ['', [Validators.required, Validators.min(5), Validators.max(120)]],
    habits: [''],
    preferences: [''],
    roommate_style: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[\p{L}\s]+$/u)]],
    cleanliness_level: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    smoking: ['', Validators.required],
    pets: ['', Validators.required],
    bio:['',Validators.required],
    avatar: [''],
});

// Subscribe to user changes
    this.auth.user$.subscribe((user) => {
      this.user = user;});

    // Listen to storage changes
    window.addEventListener('storage', () => {
      const user = this.auth.getUser();
      this.user = user;
    });
}



  changeTab(tab: string) {
    this.activeTab = tab;
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

      /** -----------------------------
       * Fix avatar storage path
       * ------------------------------ */
      // Fix avatar path by inserting /storage/ after the domain
if (profile.avatar) {
  // Example: http://localhost:8000/images/users/file.jpg
  const url = profile.avatar;

  if (url.includes('/images/users/')) {
    // Insert /storage after the base URL
    profile.avatar = url.replace(
      '://localhost:8000/',
      '://localhost:8000/storage/'
    );
  }
} else {
  profile.avatar = '/assets/default-avatar.png';
}


      this.cdr.detectChanges();
      this.profile = profile;

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
        password: ''
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
      this.showToastMessage('Please fix the errors in the form before saving.','error');
    return;
  }


  const raw = this.profileForm.getRawValue();





  const payload = {
  ...raw,
  age: raw.age ? Number(raw.age) : null,
  cleanliness_level: raw.cleanliness_level ? Number(raw.cleanliness_level) : null,
  smoking: raw.smoking === 'yes' ? 1 : 0,
  pets: raw.pets === 'yes' ? 1 : 0,
  bio:raw.bio,
 gender: raw.gender || null,
  habits: Array.isArray(raw.habits) ? raw.habits : raw.habits?.split(',').map((h:string) => h.trim()) || [],
  preferences: Array.isArray(raw.preferences) ? raw.preferences : raw.preferences?.split(',').map((p:string) => p.trim()) || [],
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
            pets: res.profile.pets === 1 ? 'yes' : 'no'
          };

          if (updated.avatar && typeof updated.avatar === 'string' && updated.avatar.includes('/images/users/')) {
            updated.avatar = updated.avatar.replace('://localhost:8000/', '://localhost:8000/storage/');
          }

          this.profile = updated;
          this.profileForm.patchValue({ ...updated, password: '' });
        }

        this.isEditing = false;
      },
      error: (err) => {
        console.log('Error status:', err.status);
        console.log('Error body:', err.error);
        this.showToastMessage('An error occurred while saving. Please try again.','error');
      }
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
          pets: res.profile.pets === 1 ? 'yes' : 'no'
        };

        // replace avatar path if necessary
        if (updated.avatar && typeof updated.avatar === 'string' && updated.avatar.includes('/images/users/')) {
          updated.avatar = updated.avatar.replace('://localhost:8000/', '://localhost:8000/storage/');
        }

        this.profile = updated;

        // Ensure form shows updated values
        this.profileForm.patchValue({ ...updated, password: '' });
      }

      this.isEditing = false;
    },
    error: (err) => {
      // console.error('Error while saving:', err);

      console.log('Error status:', err.status);
      console.log('Error body:', err.error);
      console.log('Full error:', err);
      this.showToastMessage('An error occurred while saving. Please try again.','error');
    },
  });
}

onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) return;

  this.selectedAvatarFile = input.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    this.avatarPreview = reader.result as string; // preview only
  };
  reader.readAsDataURL(this.selectedAvatarFile);
}



 loadFavourites(){
    this.favouriteService.getMyFavourites().subscribe(res => {
      console.log(this.properties = res);
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
    this.toggleDropdown('habits');
  }

  // Remove selected habit
  removeHabit(option: string) {
    this.selectedHabits = this.selectedHabits.filter(h => h !== option);
    this.updateFormHabits();
  }

  // Update form control
  private updateFormHabits() {
    this.profileForm.patchValue({
      habits: this.selectedHabits.join(', ')
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
      initials = parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + (parts[1][0] || '')).toUpperCase();
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
  Swal.fire({
    html: `
      <div class="relative flex flex-col items-center">

        <!-- Floating Glow Circle -->
        <div class="absolute w-40 h-40 bg-gradient-to-r from-orange-500 to-pink-500
                    rounded-full blur-2xl opacity-40 animate-glow"></div>

        <!-- Avatar -->
        <img src="${this.avatarUrl()}"
             class="relative w-40 h-40 rounded-3xl object-cover shadow-2xl border-4
                    border-white dark:border-gray-700 animate-pop" />

        <!-- Username -->
        <h2 class="mt-4 text-xl font-bold dark:text-white">${this.profileForm.get('name')?.value}</h2>

        <!-- Email -->
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          ${this.profile?.email}
        </p>

        <!-- Upload Button -->
        <label for="avatarInput"
               class="w-full mt-3 cursor-pointer py-3 rounded-xl text-white font-semibold
                      bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg
                      hover:scale-105 transition-all flex items-center justify-center gap-2">
          <i class="pi pi-camera"></i> Change Photo
        </label>

        <!-- Remove -->
        <button id="removeAvatarBtn"
                class="w-full mt-2 py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-red-500 to-rose-500 shadow-lg
                       hover:scale-105 transition-all flex items-center justify-center gap-2">
          <i class="pi pi-times"></i> Remove Photo
        </button>

      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      popup: 'bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl animate-popupEnter',
    },
    didOpen: () => {
      // Remove Avatar Function
      const removeBtn = document.getElementById('removeAvatarBtn');
      removeBtn?.addEventListener('click', () => {
        this.avatarPreview = null;
        Swal.close();
      });

    }
  });
}


}




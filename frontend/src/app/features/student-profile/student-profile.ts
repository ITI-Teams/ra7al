import { Component } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';



import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService } from '../../core/services/profile/profile-service';
import { FavouriteService } from '../../core/services/favourite/favourite-service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports:  [FormsModule,NgClass,NgIf,ReactiveFormsModule,CommonModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css',
})
export class StudentProfile {
  properties: any[] = [];

toastMessage: string = '';
toastType: 'success' | 'error' = 'success';
showToast: boolean = false;

    profile:any;

   profileForm: FormGroup;

    isEditing = false;
  activeTab: string = 'favourites';

  constructor(private fb: FormBuilder, private profileSrv: ProfileService,private cdr: ChangeDetectorRef,   private favouriteService: FavouriteService) {
  this.profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[\p{L}\s]+$/u)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6), Validators.maxLength(20)]],
    gender:['',Validators.required],
    age: ['', [Validators.required, Validators.min(5), Validators.max(113)]],
    habits: [''],
    preferences: [''],
    roommate_style: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[\p{L}\s]+$/u)]],
    cleanliness_level: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    smoking: ['', Validators.required],
    pets: ['', Validators.required],
    bio:['',Validators.required],
    avatar: ['']
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


      profile.avatar = profile.avatar
        ? profile.avatar
        : '/assets/default-avatar.png';

           this.cdr.detectChanges();

      this.profile = profile;

      console.log(this.profile)

  if (profile.habits && typeof profile.habits === 'string') {
  profile.habits = JSON.parse(profile.habits);
}
if (profile.preferences && typeof profile.preferences === 'string') {
  profile.preferences = JSON.parse(profile.preferences);
}

profile.smoking = Number(profile.smoking) === 1 ? 'yes' : 'no';
profile.pets = Number(profile.pets) === 1 ? 'yes' : 'no';

if (profile.gender !== 'male' && profile.gender !== 'female') {
  profile.gender = '';
}



this.profile = profile;


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


  this.profileSrv.saveProfile(payload).subscribe({
    next: (res) => {



this.showToastMessage('Data saved successfully', 'success');

      // this.isEditing = false;


      if (res.profile) {
        const profile = {
          ...res.profile,
          smoking: res.profile.smoking === 1 ? 'yes' : 'no',
          pets: res.profile.pets === 1 ? 'yes' : 'no'
        };



      }
    },
    error: (err) => {
      // console.error('Error while saving:', err);

        console.log('Error status:', err.status);
  console.log('Error body:', err.error);
  console.log('Full error:', err);
        this.showToastMessage('حدث خطأ أثناء الحفظ، حاول مرة أخرى.','error');
    },
  });
}

onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {

      this.profileForm.patchValue({ avatar: reader.result });
    };

    reader.readAsDataURL(file);
  }
}


 loadFavourites(){
    this.favouriteService.getMyFavourites().subscribe(res => {
      console.log(this.properties = res);
    });
  }




}





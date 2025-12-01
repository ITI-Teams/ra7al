import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';



import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService } from '../../core/services/profile/profile-service';

@Component({
  selector: 'app-student-profile',
  imports:  [FormsModule,NgClass,NgIf,ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css',
})
export class StudentProfile {

   profileForm: FormGroup;

    isEditing = false;
  activeTab: string = 'favourites';

  constructor(private fb: FormBuilder, private profileSrv: ProfileService) {
  this.profileForm = this.fb.group({
  name: [{ value: '', disabled: true }, Validators.required],
  email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
  password: [''],
  age: [''],
  gender: [''],
  habits: [''],
  preferences: [''],
  roommate_style: [''],
  cleanliness_level: [''],
  smoking: [''],
  pets: ['']
});
    }



  changeTab(tab: string) {
    this.activeTab = tab;
  }
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }
  ngOnInit(): void {
    this.loadProfile();
  }

 loadProfile() {
   this.profileSrv.getProfile().subscribe({
  next: (res) => {

   console.log( this.profileForm.patchValue(res.profile));
  },
  error: (err) => console.error(err)
});
 }

saveInfo(){
  console.log('yes');
}
}



import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-student-profile',
  imports:  [FormsModule,NgClass,NgIf],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css',
})
export class StudentProfile {

    isEditing = false;

  user = {
    name: 'Yusuf Alsyd',
    email: 'yusuf@gmail.com',
    password: ''
  };

  activeTab: string = 'favourites';

  changeTab(tab: string) {
    this.activeTab = tab;
  }
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

   saveInfo() {
    console.log('User updated:', this.user);
    this.isEditing = false;


  }
}

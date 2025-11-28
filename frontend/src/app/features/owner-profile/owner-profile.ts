import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-owner-profile',
  imports:  [FormsModule,NgClass,NgIf],
  templateUrl: './owner-profile.html',
  styleUrl: './owner-profile.css',
})
export class OwnerProfile {

    isEditing = false;

  user = {
    name: 'Saad Safwat',
    email: 'Saad@gmail.com',
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

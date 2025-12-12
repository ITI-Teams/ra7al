import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { PropertyService } from '../../../../core/services/property/property.service';
import { AuthService } from '../../../../core/services/authService/auth.service';
import { Property } from '../../../../core/models/property.model';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-apartments',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule, ButtonModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './apartments.html',
  styleUrl: './apartments.css',
})
export class Apartments implements OnInit {
  properties: any[] = [];
  isLoading = false;
  userId: number | null = null;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.userId = user?.id || null;
    this.loadProperties();
  }

  loadProperties() {
    this.isLoading = true;
    // Fetch owner's properties using dedicated endpoint
    this.propertyService.getOwnerProperties(1, 100).subscribe({
      next: (response) => {
        // Handle paginated response from backend
        console.log('Response received:', response);

        if (response && response.data) {
          // response.data could be either:
          // 1. Direct array if backend returns array
          // 2. Paginated object with 'data' property
          if (Array.isArray(response.data)) {
            this.properties = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            this.properties = response.data.data;
          } else {
            this.properties = [];
          }
        } else {
          this.properties = [];
        }

        console.log('Properties loaded:', this.properties);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load properties:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load properties: ' + (error.error?.message || error.message),
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }

  editProperty(property: any) {
    this.router.navigate(['/owner-dashboard/edit-property', property.id]);
  }

  deleteProperty(property: any) {
   const isDark = document.documentElement.classList.contains('dark');

      Swal.fire({
        // 🔥 Dark mode support
        background: isDark ? '#1f2937' : '#ffffff', // gray-800
        color: isDark ? '#e5e7eb' : '#111827', // gray-200 / gray-900
        iconColor: isDark ? '#fbbf24' : '#f59e0b', // amber
    title: 'Are you sure?',
    html: `<strong>${property.title}</strong><br>This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#e53935', // red
    cancelButtonColor: '#6b7280',  // gray
    reverseButtons: true,
    focusCancel: true,

    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.performDelete(property);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: 'Cancelled',
        text: 'Your property is safe :)',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}


  private performDelete(property: any) {
    this.propertyService.deleteProperty(property.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Property deleted successfully',
          life: 3000
        });
        // Remove property from list
        this.properties = this.properties.filter(p => p.id !== property.id);
      },
      error: (error) => {
        console.error('Failed to delete property:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to delete property',
          life: 3000
        });
      }
    });
  }

  viewProperty(property: any) {
    this.router.navigate(['/properties', property.id]);
  }

  createNewProperty() {
    this.router.navigate(['/owner-dashboard/create-property']);
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

addProperty(){
  this.router.navigate(['owner-dashboard/create-property']);
}

}

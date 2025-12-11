import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
  RentalRequestService,
  RentalRequest,
} from '../../../../core/services/rental-request-service';

@Component({
  selector: 'app-rental-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './rental-requests.html',
  styleUrls: ['./rental-requests.css'],
})
export class RentalRequests implements OnInit {
  requests: RentalRequest[] = [];
  search: string = '';
  status: string = '';
  page: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;

  constructor(private rentalRequestService: RentalRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.rentalRequestService
      .getRequests(this.search, this.status, this.page)
      .subscribe({
        next: (res) => {
          console.log('Rental requests response:', res);

          this.requests = res.data;
          this.totalPages = res.last_page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading rental requests:', err);
          this.isLoading = false;
        },
      });
  }

  approve(id: number): void {
    this.rentalRequestService
      .approveRequest(id)
      .subscribe(() => this.loadRequests());
  }

  reject(id: number): void {
    this.rentalRequestService
      .rejectRequest(id)
      .subscribe(() => this.loadRequests());
  }

  searchRequests(): void {
    this.page = 1;
    this.loadRequests();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.loadRequests();
  }

  get pages(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }
}

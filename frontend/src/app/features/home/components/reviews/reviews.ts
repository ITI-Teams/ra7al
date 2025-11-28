import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-reviews',
  templateUrl: './reviews.html',
})
export class Reviews {

  reviews = [
    {
      id: 1,
      name: "Omar Ahmed",
      college: "Engineering, Cairo University",
      review: "The service helped me find the perfect roommate and a safe accommodation near campus!",
      stars: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      name: "Sara Mohammed",
      college: "Computer Science, Ain Shams University",
      review: "Fast, easy to use, and reliable. I found my apartment in less than two days!",
      stars: 4,
      image: "https://randomuser.me/api/portraits/women/45.jpg"
    },
    {
      id: 3,
      name: "Mina Youssef",
      college: "Pharmacy, Alexandria University",
      review: "A trusted platform that made my student life much easier.",
      stars: 5,
      image: "https://randomuser.me/api/portraits/men/12.jpg"
    }
  ];
}

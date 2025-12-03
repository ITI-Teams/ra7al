import Swal from 'sweetalert2';
import {
  Component,
  AfterViewInit,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-speakers',
  standalone: true,
  imports: [],
  templateUrl: './speakers.html',
  styleUrls: ['./speakers.css'],
})
export class Speakers implements AfterViewInit {
  speakers = [
    { name: 'Saad Safwat', title: 'Full-Stack PHP Developer', img: 'asset/speakers/speaker1.jpg', bio: 'Expert in Artificial Intelligence with 10+ years experience.' },
    { name: 'Mariam Ayman', title: 'Full-Stack PHP Developer', img: 'asset/speakers/speaker2.jpg', bio: 'Frontend Developer specializing in Angular and React.' },
    { name: 'Abdallah Shoker', title: 'Full-Stack PHP Developer', img: 'asset/speakers/speaker3.jpg', bio: 'Data science and predictive analytics professional.' },
    { name: 'Fady Samir', title: 'Full-Stack PHP Developer', img: 'asset/speakers/speaker4.jpg', bio: 'Creative UX/UI designer focusing on modern interfaces.' },
    { name: 'Moaz Yasser', title: 'Full-Stack PHP Developer', img: 'asset/speakers/speaker5.jpg', bio: 'Full Stack Engineer passionate about clean code and performance.' },
  ];

  ngAfterViewInit() {
    this.handleScrollAnimation();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.handleScrollAnimation();
  }

  private handleScrollAnimation() {
    const fadeEls = document.querySelectorAll('.fade-in');
    fadeEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('show');
      }
    });
  }

  showDetails(speaker: any) {
  const isDark = document.documentElement.classList.contains('dark'); // 👈 يتحقق من الوضع الحالي
  const bgColor = isDark ? '#0a0a0a' : '#f9f9f9';
  const textColor = isDark ? '#ffffff' : '#111111';
  const subTextColor = isDark ? '#ccc' : '#444';
  const cardBg = isDark ? '#111' : '#fff';
  const borderColor = isDark ? '#333' : '#ddd';
  const accent = '#9233FA';

  Swal.fire({
   html: `
  <div style="
    height: 80vh;
    display: flex; flex-wrap: wrap; align-items: center;
    justify-content: center; gap: 50px; padding: 40px;
    color: ${textColor}; background: transparent;
  ">
    <img src="${speaker.img}" alt="${speaker.name}"
      style="width: 320px; height: 320px; border-radius: 50%; object-fit: cover;
      box-shadow: 0 0 20px rgba(0,0,0,0.3); border: 3px solid ${accent};">

    <div style="max-width: 550px; text-align: left;">
      <h2 style="font-size: 34px; font-weight: 800; margin-bottom: 6px;">
        ${speaker.name}
      </h2>

      <h4 style="font-size: 20px; color: ${accent}; margin-bottom: 16px;">
        Full-Stack PHP Developer
      </h4>

      <p style="font-size: 15px; color: ${subTextColor}; line-height: 1.8; margin-bottom: 30px;">
        ${speaker.name} is part of our dedicated Full-Stack PHP development team,
        specializing in building robust web applications .
      </p>

      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px;">
        Role & Responsibilities
      </h3>

      <div style="display: flex; flex-wrap: wrap; gap: 25px; margin-bottom: 25px;">
        <div style="flex: 1; min-width: 200px; background: ${cardBg};
          border-radius: 10px; padding: 15px 20px; border: 1px solid ${borderColor};">
          <strong style="font-size: 16px;">Backend</strong><br/>
          <span style="font-size: 15px; color: ${accent};">Laravel · APIs · MySQL</span><br/>
          <span style="font-size: 14px; color: ${subTextColor};">
            Building powerful and secure backend systems.
          </span>
        </div>

        <div style="flex: 1; min-width: 200px; background: ${cardBg};
          border-radius: 10px; padding: 15px 20px; border: 1px solid ${borderColor};">
          <strong style="font-size: 16px;">Frontend</strong><br/>
          <span style="font-size: 15px; color: ${accent};">Angular · JS · UI/UX</span><br/>
          <span style="font-size: 14px; color: ${subTextColor};">
            Creating clean, fast, and modern user interfaces.
          </span>
        </div>
      </div>

      <div style="display: flex; gap: 18px; margin: 10px;">
        <a href="#" style="color: ${textColor};"><i class="fa-brands fa-facebook-f"></i></a>
        <a href="#" style="color: ${textColor};"><i class="fa-brands fa-twitter"></i></a>
        <a href="#" style="color: ${textColor};"><i class="fa-brands fa-linkedin-in"></i></a>
        <a href="#" style="color: ${textColor};"><i class="fa-brands fa-instagram"></i></a>
      </div>
    </div>
  </div>
`,

    background: bgColor,
    color: textColor,
    width: '100%',
    heightAuto: false,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      popup: 'full-screen-modal',
      closeButton: 'close-btn',
    },
    backdrop: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.6)',
  });
}

}

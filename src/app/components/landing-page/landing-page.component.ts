import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';

interface WorkflowAbility {
  id: string;
  icon: string;
  title: string;
  category: string;
  enabled: boolean;
}

export interface ImageSlide {
  id: string;
  title: string;
  alt: string;
  image: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  readonly service = inject(LicenfyService);

  readonly isDemoModalOpen = signal<boolean>(false);
  readonly isHeaderFloating = signal<boolean>(false);

  // Carrossel de Imagens dos Recursos Oficiais Licenfy
  readonly slides: ImageSlide[] = [
    {
      id: 'recursos-avancados',
      title: 'Recursos Avançados',
      alt: 'Licenfy - Recursos Avançados: Licenças, garantias e manutenção unificadas',
      image: 'carousel/carousel-1.png'
    },
    {
      id: 'seguranca-corporativa',
      title: 'Segurança Corporativa',
      alt: 'Licenfy - Segurança Corporativa: Sua empresa em conformidade, sem risco de multas',
      image: 'carousel/carousel-2.jpg'
    },
    {
      id: 'software-compliance',
      title: 'Software e Compliance',
      alt: 'Licenfy - Software e Compliance: Centralize licenças, prazos e manutenções em um único lugar',
      image: 'carousel/carousel-3.jpg'
    }
  ];

  readonly currentSlideIndex = signal<number>(0);
  private carouselTimer: any = null;

  ngOnInit() {
    this.onWindowScroll();
    this.startCarouselAutoPlay();
  }

  ngOnDestroy() {
    this.stopCarouselAutoPlay();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isHeaderFloating.set(window.scrollY > 24);
  }

  startCarouselAutoPlay() {
    this.stopCarouselAutoPlay();
    this.carouselTimer = setInterval(() => {
      this.nextSlide();
    }, 4500);
  }

  stopCarouselAutoPlay() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
  }

  nextSlide() {
    this.currentSlideIndex.update(idx => (idx + 1) % this.slides.length);
  }

  prevSlide() {
    this.currentSlideIndex.update(idx => (idx - 1 + this.slides.length) % this.slides.length);
  }

  setSlide(index: number) {
    this.currentSlideIndex.set(index);
    this.startCarouselAutoPlay();
  }

  openDemoModal() {
    this.isDemoModalOpen.set(true);
  }

  closeDemoModal() {
    this.isDemoModalOpen.set(false);
  }

  openLogin() {
    this.service.openLogin();
  }

  openSignup() {
    this.service.openSignup();
  }

  goToApp(tab: 'dashboard' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi' = 'dashboard') {
    this.service.setTab(tab);
    this.service.setView('app');
  }
}

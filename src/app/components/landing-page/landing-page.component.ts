import { Component, computed, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoLicenfy } from '../../core/services/licenfy.service';

export interface SlideImagem {
  id: string;
  titulo?: string;
  title?: string;
  alt: string;
  imagem?: string;
  image?: string;
}
export type ImageSlide = SlideImagem;

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class PaginaInicialComponente implements OnInit, OnDestroy {
  readonly servico = inject(ServicoLicenfy);

  readonly modalDemonstracaoAberto = signal<boolean>(false);
  readonly cabecalhoFlutuante = signal<boolean>(false);

  readonly exibicaoEconomiaAcumulada = computed(() => {
    const ganho = this.servico.dadosRoi().ganhoFinanceiroTotal ?? this.servico.dadosRoi().totalFinancialGain ?? 0;
    const totalEmMilhares = ganho / 1000;
    return `R$ ${totalEmMilhares.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k+`;
  });

  readonly slides: SlideImagem[] = [
    {
      id: 'visao-completa',
      titulo: 'Visão completa',
      title: 'Visão completa',
      alt: 'Painel Licenfy em computador e celular',
      imagem: 'hero-slide-dashboard-desktop-mobile-transparent.png',
      image: 'hero-slide-dashboard-desktop-mobile-transparent.png'
    },
    {
      id: 'painel-mobile',
      titulo: 'Painel no celular',
      title: 'Painel no celular',
      alt: 'Painel de regularidade Licenfy no celular',
      imagem: 'hero-phone-licenfy-transparent.png',
      image: 'hero-phone-licenfy-transparent.png'
    },
    {
      id: 'cofre-digital',
      titulo: 'Cofre digital',
      title: 'Cofre digital',
      alt: 'Cofre Digital com OCR no celular',
      imagem: 'hero-slide-digital-vault-transparent.png',
      image: 'hero-slide-digital-vault-transparent.png'
    }
  ];

  readonly indiceSlideAtual = signal<number>(0);
  private temporizadorCarrossel: any = null;

  get service() { return this.servico; }
  get isDemoModalOpen() { return this.modalDemonstracaoAberto; }
  get isHeaderFloating() { return this.cabecalhoFlutuante; }
  get accumulatedSavingsDisplay() { return this.exibicaoEconomiaAcumulada; }
  get currentSlideIndex() { return this.indiceSlideAtual; }

  ngOnInit() {
    this.aoRolarJanela();
    this.iniciarReproducaoCarrossel();
  }

  ngOnDestroy() {
    this.pararReproducaoCarrossel();
  }

  @HostListener('window:scroll')
  aoRolarJanela() {
    this.cabecalhoFlutuante.set(window.scrollY > 24);
  }
  onWindowScroll() { this.aoRolarJanela(); }

  iniciarReproducaoCarrossel() {
    this.pararReproducaoCarrossel();
    this.temporizadorCarrossel = setInterval(() => {
      this.proximoSlide();
    }, 6000);
  }
  startCarouselAutoPlay() { this.iniciarReproducaoCarrossel(); }

  pararReproducaoCarrossel() {
    if (this.temporizadorCarrossel) {
      clearInterval(this.temporizadorCarrossel);
      this.temporizadorCarrossel = null;
    }
  }
  stopCarouselAutoPlay() { this.pararReproducaoCarrossel(); }

  proximoSlide() {
    this.indiceSlideAtual.update(idx => (idx + 1) % this.slides.length);
  }
  nextSlide() { this.proximoSlide(); }

  slideAnterior() {
    this.indiceSlideAtual.update(idx => (idx - 1 + this.slides.length) % this.slides.length);
  }
  prevSlide() { this.slideAnterior(); }

  definirSlide(indice: number) {
    this.indiceSlideAtual.set(indice);
    this.iniciarReproducaoCarrossel();
  }
  setSlide(index: number) { this.definirSlide(index); }

  abrirModalDemonstracao() {
    this.modalDemonstracaoAberto.set(true);
  }
  openDemoModal() { this.abrirModalDemonstracao(); }

  fecharModalDemonstracao() {
    this.modalDemonstracaoAberto.set(false);
  }
  closeDemoModal() { this.fecharModalDemonstracao(); }

  abrirLogin() {
    this.servico.abrirLogin();
  }
  openLogin() { this.abrirLogin(); }

  abrirCadastro() {
    this.servico.abrirCadastro();
  }
  openSignup() { this.abrirCadastro(); }

  irParaAplicacao(aba: 'dashboard' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi' = 'dashboard') {
    this.servico.definirAba(aba);
    this.servico.definirVisao('app');
  }
  goToApp(tab: 'dashboard' | 'vault' | 'assets' | 'notifications' | 'inspection' | 'roi' = 'dashboard') { this.irParaAplicacao(tab); }
}

export const LandingPageComponent = PaginaInicialComponente;

import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qr-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-canvas.component.html',
  styleUrls: ['./qr-canvas.component.css']
})
export class QrCanvasComponente implements OnChanges, AfterViewInit {
  @Input() url = '';
  @Input() tamanho = 140;
  @Input() set size(valor: number) { this.tamanho = valor; }
  get size(): number { return this.tamanho; }

  @Input() corEscura = '#1f2937';
  @Input() set darkColor(valor: string) { this.corEscura = valor; }
  get darkColor(): string { return this.corEscura; }

  @Input() corClara = '#ffffff';
  @Input() set lightColor(valor: string) { this.corClara = valor; }
  get lightColor(): string { return this.corClara; }

  @ViewChild('qrCanvas') referenciaCanvas!: ElementRef<HTMLCanvasElement>;
  get canvasRef(): ElementRef<HTMLCanvasElement> { return this.referenciaCanvas; }

  private visualizacaoPronta = false;

  ngAfterViewInit() {
    this.visualizacaoPronta = true;
    this.gerarQr();
  }

  ngOnChanges(_alteracoes: SimpleChanges) {
    if (this.visualizacaoPronta) {
      this.gerarQr();
    }
  }

  gerarQr() {
    if (!this.referenciaCanvas?.nativeElement || !this.url) return;

    QRCode.toCanvas(this.referenciaCanvas.nativeElement, this.url, {
      width: this.tamanho,
      margin: 1,
      color: {
        dark: this.corEscura,
        light: this.corClara
      },
      errorCorrectionLevel: 'M'
    }, (erro: Error | null) => {
      if (erro) console.error('Erro ao gerar QR Code:', erro);
    });
  }

  baixarPng(nomeArquivo = 'qrcode.png') {
    if (!this.referenciaCanvas?.nativeElement) return;
    const link = document.createElement('a');
    link.download = nomeArquivo;
    link.href = this.referenciaCanvas.nativeElement.toDataURL('image/png');
    link.click();
  }
  downloadPng(nome = 'qrcode.png') { this.baixarPng(nome); }

  obterDataUrl(): string {
    return this.referenciaCanvas?.nativeElement?.toDataURL('image/png') || '';
  }
  getDataUrl(): string { return this.obterDataUrl(); }
}

export const QrCanvasComponent = QrCanvasComponente;

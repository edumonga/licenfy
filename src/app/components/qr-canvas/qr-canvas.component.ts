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
export class QrCanvasComponent implements OnChanges, AfterViewInit {
  @Input() url = '';
  @Input() size = 140;
  @Input() darkColor = '#1f2937';
  @Input() lightColor = '#ffffff';

  @ViewChild('qrCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private viewReady = false;

  ngAfterViewInit() {
    this.viewReady = true;
    this.generateQr();
  }

  ngOnChanges(_changes: SimpleChanges) {
    if (this.viewReady) {
      this.generateQr();
    }
  }

  private generateQr() {
    if (!this.canvasRef?.nativeElement || !this.url) return;

    QRCode.toCanvas(this.canvasRef.nativeElement, this.url, {
      width: this.size,
      margin: 1,
      color: {
        dark: this.darkColor,
        light: this.lightColor
      },
      errorCorrectionLevel: 'M'
    }, (err: Error | null) => {
      if (err) console.error('Erro ao gerar QR Code:', err);
    });
  }

  downloadPng(filename = 'qrcode.png') {
    if (!this.canvasRef?.nativeElement) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvasRef.nativeElement.toDataURL('image/png');
    link.click();
  }

  getDataUrl(): string {
    return this.canvasRef?.nativeElement?.toDataURL('image/png') || '';
  }
}

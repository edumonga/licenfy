import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoLicenfy } from '../../core/services/licenfy.service';
import { Unidade, Branch } from '../../core/models/types';

@Component({
  selector: 'app-unit-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-management.component.html',
  styleUrls: ['./unit-management.component.css']
})
export class GestaoUnidadesComponente {
  readonly servico = inject(ServicoLicenfy);
  readonly unidades = this.servico.unidades;
  readonly unidadeSelecionadaId = signal('sp-matriz');
  readonly exibirFormulario = signal(false);

  novaUnidade = {
    nome: '',
    name: '',
    cnpj: '',
    cidade: '',
    city: '',
    estado: '',
    state: '',
    endereco: '',
    address: '',
    gestor: '',
    manager: '',
    email: '',
    telefone: '',
    phone: ''
  };

  get service() { return this.servico; }
  get branches() { return this.unidades; }
  get selectedUnitId() { return this.unidadeSelecionadaId; }
  get showForm() { return this.exibirFormulario; }
  get newUnit() { return this.novaUnidade; }
  set newUnit(v: any) { this.novaUnidade = v; }

  get unidadeSelecionada(): Unidade {
    return this.unidades().find(u => u.id === this.unidadeSelecionadaId()) || this.unidades()[0];
  }
  get selectedUnit(): Unidade { return this.unidadeSelecionada; }

  selecionarUnidade(id: string) {
    this.unidadeSelecionadaId.set(id);
  }
  selectUnit(id: string) { this.selecionarUnidade(id); }

  salvarUnidade() {
    const nome = this.novaUnidade.nome || this.novaUnidade.name;
    const cnpj = this.novaUnidade.cnpj;
    const gestor = this.novaUnidade.gestor || this.novaUnidade.manager;
    const cidade = this.novaUnidade.cidade || this.novaUnidade.city || 'Não informado';
    const estado = this.novaUnidade.estado || this.novaUnidade.state || 'SP';
    const endereco = this.novaUnidade.endereco || this.novaUnidade.address || 'Endereço a confirmar';
    const email = this.novaUnidade.email;
    const telefone = this.novaUnidade.telefone || this.novaUnidade.phone || '';

    if (!nome || !cnpj || !gestor) return;

    const id = 'unit-' + Date.now();
    this.servico.adicionarUnidade({
      id,
      nome,
      name: nome,
      cnpj,
      cidade,
      city: cidade,
      estado,
      state: estado,
      endereco,
      address: endereco,
      razaoSocial: 'Grupo Alpha Brasil S.A.',
      companyName: 'Grupo Alpha Brasil S.A.',
      gerenteResponsavel: `${gestor} (Gestor da unidade)`,
      responsibleManager: `${gestor} (Gestor da unidade)`,
      responsaveis: [{
        id: id + '-primary',
        nome: gestor,
        name: gestor,
        cargo: 'Gestor da unidade',
        role: 'Gestor da unidade',
        email,
        telefone,
        phone: telefone,
        principal: true,
        primary: true
      }],
      pontuacaoConformidade: 100,
      complianceScore: 100,
      status: 'regular',
      contagemLicencas: { total: 0, regular: 0, atencao: 0, urgente: 0 },
      licensesCount: { total: 0, regular: 0, attention: 0, urgent: 0 },
      contagemAtivos: { total: 0, comGarantiaAtiva: 0, manutencaoPendente: 0 },
      assetsCount: { total: 0, withActiveWarranty: 0, maintenancePending: 0 }
    });

    this.unidadeSelecionadaId.set(id);
    this.exibirFormulario.set(false);
    this.novaUnidade = {
      nome: '',
      name: '',
      cnpj: '',
      cidade: '',
      city: '',
      estado: '',
      state: '',
      endereco: '',
      address: '',
      gestor: '',
      manager: '',
      email: '',
      telefone: '',
      phone: ''
    };
  }
  saveUnit() { this.salvarUnidade(); }
}

export const UnitManagementComponent = GestaoUnidadesComponente;

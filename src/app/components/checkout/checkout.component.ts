import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicenfyService } from '../../core/services/licenfy.service';
import { AuthService } from '../../core/services/auth.service';

@Component({selector:'app-checkout',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./checkout.component.html',styleUrls:['./checkout.component.css']})
export class CheckoutComponent {
  readonly service=inject(LicenfyService); readonly auth=inject(AuthService); readonly plan=this.service.planoCheckout; readonly completed=signal(false); readonly error=signal('');
  buyer={name:'',email:'',company:'',cnpj:'',password:'',confirmPassword:'',card:''};
  get annual(){return this.plan()==='annual';} get amount(){return this.annual?'1.200,00':'200,00';} get cadence(){return this.annual?'pagamento anual':'cobrança mensal';}
  back(){this.service.setView('landing');}
  openApp(){this.service.setView('app');}
  submit(){
    this.error.set('');
    if(!this.buyer.name.trim()||!this.buyer.email.trim()||!this.buyer.company.trim()||!this.buyer.password||!this.buyer.card.trim()) return;
    if(this.buyer.password.length < 8){this.error.set('Use uma senha com pelo menos 8 caracteres.');return;}
    if(this.buyer.password !== this.buyer.confirmPassword){this.error.set('As senhas não coincidem.');return;}
    const result=this.auth.cadastrar(this.buyer.name,this.buyer.email,this.buyer.password);
    if(!result.sucesso){this.error.set(result.mensagem || 'Não foi possível criar sua conta.');return;}
    this.auth.atualizarPerfil({empresa:this.buyer.company,cnpj:this.buyer.cnpj});
    this.completed.set(true);
  }
}

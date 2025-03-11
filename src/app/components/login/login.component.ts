import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Usuario } from 'src/app/models/usuario';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { login } from 'src/app/store/login.actions.action';
import { selectEmail, selectRoles, selectToken } from 'src/app/store/login.selectors.selectors';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public usuario: Usuario;
  public password: string;
  public token: string = '';
  public email: string = '';
  public roles: string[] = [];
  @ViewChild('usuarioForm', { static: false }) usuarioForm!: NgForm;
  public apiUrl: string = environment.apiUrl;

  constructor(
    private _usuarioService: UsuarioService,
    private _errorService: ErrorService,
    private router: Router, private _exitoService: ExitoService,
    private _actualizarComponentService: ActualizarComponentService, private store: Store) {
    this.usuario = new Usuario({});
    this.password = "";
  }

  verificarFormulario(form: NgForm) {
    for (const controlName in form.controls) {
      if (form.controls.hasOwnProperty(controlName)) {
        const control = form.controls[controlName];
        if (control.invalid || control.errors?.['required']) {
          this.usuarioForm.control.markAllAsTouched();
          return false;
        }
      }
    }
    return true;
  }

  @ViewChild('btn') btn!: ElementRef<HTMLButtonElement>;
  ingresarUsuario(form: NgForm, btn: MatButton) {
    if (this.verificarFormulario(form)) {
      //this.usuario.password = this.password;
      //this.store.dispatch(login({ email: this.email, password: this.password }));
      this._usuarioService.login(this.email, this.password).subscribe({
        next: (value) => {
          localStorage.setItem('token', value.token);
          this._actualizarComponentService.notificarHeader();
          const paginaAnterior = document.referrer;
          const regex = /\/cart-detail$/;
          if (regex.test(paginaAnterior)) {
            window.location.href = `/payment-detail`;
          } else {
            window.history.back();
          }
          this._exitoService.mostrarExito(`BIENVENIDO, es un placer tenerte de nuevo`);
          console.log(value.userName)
          console.log(value.email)
          console.log(value.roles)
        },
        error: (e: HttpErrorResponse) => {
          btn.disabled = false;
          this._errorService.msjError(e);
        }
      })
    } else {
      btn.disabled = false;
    }
  }

  public mostrarPassword: boolean = false;
  mostrarPasswordFuntion() {
    this.mostrarPassword = !this.mostrarPassword;
  }

}

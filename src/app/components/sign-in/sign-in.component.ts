import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  public usuario: Usuario;
  public confirmarPassword: string = '';
  public password: string = '';
  public cell_number: string = '09';
  public cedula_RUC: string = '';
  public chassis: string = '';
  public token: string | null = '';
  public existeEmail: boolean = false;
  public mostrarPassword: boolean = false;
  public mostrarPasswordConfirmada: boolean = false;
  @ViewChild('usuarioForm', { static: false }) usuarioForm!: NgForm;
  public siteKey: string = '6LcL6gQqAAAAAOYtQI5EmrTahCoTBFTHsmDtjqHC';
  public captchaResolved: boolean = false;
  public apiUrl: string = environment.apiUrl;

  constructor(private _usuarioService: UsuarioService, private _errorService: ErrorService, private _repuestoService: RepuestoService,
    private router: Router, private http: HttpClient, private _exitoService: ExitoService) {
    this.token = localStorage.getItem('token');
    this.usuario = new Usuario({});
  }
  ngOnInit() {
  }

  mostrarPasswordFuncion() {
    this.mostrarPassword = !this.mostrarPassword;
  }
  mostrarPasswordConfirmadaFuntion() {
    this.mostrarPasswordConfirmada = !this.mostrarPasswordConfirmada;
  }
  public aceptoTerminos: boolean = false;
  cambiarVerificacionTerminos() {
    this.aceptoTerminos = !this.aceptoTerminos;
  }

  validarCaptcha(captchaResponse: string) {
    this.captchaResolved = (captchaResponse && captchaResponse.length > 0) ? true : false
  }
  guardarUsuario(form: NgForm) {
    if (this.mostrarMensajeErrorCamposVacios(form)) {
      if (!this.aceptoTerminos) {
        this._errorService.msjError("Debe aceptar los términos y condiciones");
        return;
      }
      if (this.confirmarPassword !== this.password) {
        this._errorService.msjError("Las contraseñas son distintas, porfavor revise bien");
        return;
      }
      if (!this.captchaResolved) {
        this._errorService.msjError("Debe completar el reCAPTCHA");
        return;
      }
      this.usuario.password = this.password;
      this._usuarioService.guardarUsuario(this.usuario).subscribe({
        next: (value) => {
          //localStorage.setItem('token', value.token);
          this._exitoService.mostrarExito(value.message);
          this.router.navigate(['/login']);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
  mostrarMensajeErrorCamposVacios(form: NgForm) {
    for (const controlName in form.controls) {
      if (form.controls.hasOwnProperty(controlName)) {
        const control = form.controls[controlName];
        if (control.invalid || control.errors?.['required'] || control.value === 0) {
          this.usuarioForm.control.markAllAsTouched();
          return false;
        }
      }
    }
    return true;
  }

  public signinSeccion1: boolean = true;
  public signinSeccion2: boolean = false;
  mostrarSeccion1() {
    this.signinSeccion2 = false;
    this.signinSeccion1 = true;
  }
  mostrarSeccion2(form?: NgForm) {
    if (form) {
      if (this.mostrarMensajeErrorCamposVacios(form)) {
        this.signinSeccion1 = false;
        this.signinSeccion2 = true;
      }
    } else {
      this.signinSeccion1 = false;
      this.signinSeccion2 = true;
    }
  }
  regresarAcceso() {
    if (this.token == undefined) {
      this.router.navigate(['/acceso']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

}
import { Component, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import * as jwt from 'jwt-decode';
import { NgForm } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ErrorService } from 'src/app/services/error.service';
import { Router } from '@angular/router';
import { ExitoService } from 'src/app/services/exito.service';

interface ChangePassword {
  email: string;
  password: string;
  newPassword: string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  @ViewChild('usuarioForm', { static: false }) usuarioForm!: NgForm;
  public password: string = '';
  public confirmarPassword: string = '';
  public mostrarPasswordConfirmada: boolean = false;
  public newPassword: string = '';
  public token: string | null = '';
  public email: string | undefined = '';
  public otp: string = '';
  public loadingCrear: boolean = false;
  public usuario: ChangePassword;
  public mostrarPassword: boolean = false;
  public mostrarNewPassword: boolean = false;

  constructor(private _usuarioService: UsuarioService, private _errorService: ErrorService, private router: Router,
    private _exitoService: ExitoService) {
    this.usuario = {
      email: '',
      password: '',
      newPassword: ''
    };
    this.token = localStorage.getItem('token');
  }
  ngOnInit() {
    this.obtenerInformacionToken();
  }

  obtenerInformacionToken() {
    this.token = localStorage.getItem('token');
  }
  public mostrarContrasenia: boolean = false;
  mostrarPasswordFuntion() {
    this.mostrarPassword = !this.mostrarPassword;
  }
  mostrarNewPasswordFuntion() {
    this.mostrarNewPassword = !this.mostrarNewPassword;
  }

  mostrarPasswordConfirmadaFuntion() {
    this.mostrarPasswordConfirmada = !this.mostrarPasswordConfirmada;
  }
  actualizarContrasenia(form: NgForm) {
    if (form.valid) {
      if (this.token) {
        if (this.confirmarPassword !== this.newPassword) {
          this._errorService.msjError("Las nuevas contraseñas son distintas, porfavor revise bien");
          return;
        }
        this.usuario.email = this.email!;
        this.usuario.newPassword = this.newPassword;
        this.usuario.password = this.password;
        this._usuarioService.actualizarPassword(this.usuario).subscribe({
          next: () => {
            this._exitoService.mostrarExito()
            this.router.navigate(['/'])
          },
          error: (e) => {
            this._errorService.msjError(e)
          }
        })
      }
    }else{
      this.usuarioForm.control.markAllAsTouched();
    }

  }
  public regresar() {
    this.router.navigate(['/']);
  }
  public registrar() {
    this.router.navigate(['/signin']);
  }
}
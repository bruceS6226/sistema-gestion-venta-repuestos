import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth-google',
  templateUrl: './auth-google.component.html',
  styleUrls: ['./auth-google.component.css'],
  imports: [MatProgressSpinnerModule],
  standalone: true
})
export class AuthGoogleComponent implements OnInit{
  
  public token: string = '';

  constructor(private route: ActivatedRoute, private _usuarioService: UsuarioService,private router: Router,
    private _actualizarComponentService: ActualizarComponentService) {
    this.route.queryParams.subscribe(params => this.token = params['token']);
    //localStorage.setItem('token', this.token);
  }

  ngOnInit(): void {
    localStorage.setItem('token', this.token);
    this._actualizarComponentService.notificarHeader();
    this.router.navigate(['/']);
  }
}

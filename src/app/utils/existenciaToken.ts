import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { ActualizarComponentService } from '../services/actualizar.component.service';

@Injectable({
  providedIn: 'root'
})
export class ExistenciaToken implements CanActivate {
  constructor(private router: Router, private _usuarioService: UsuarioService, private _actualizarComponentService: ActualizarComponentService) { }
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Promise<boolean | UrlTree> {
    const token = localStorage.getItem('token');
    if (token) {
      let verificado: boolean = true;
      await this._usuarioService.verificarEstadoToken().subscribe({
        next: () => {
          verificado = true;
        },
        error: () => {
          verificado = false;
        },
      })
      if (verificado) {
          console.log("v")
        return verificado;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('repuestoCantidades');
        localStorage.removeItem('repuestosSeleccionadosParaCompra');
        this._actualizarComponentService.notificarHeader();
          console.log("f")
        return this.router.createUrlTree(['/login']);
      }
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}

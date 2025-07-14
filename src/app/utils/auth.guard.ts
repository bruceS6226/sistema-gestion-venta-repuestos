import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { ActualizarComponentService } from '../services/actualizar.component.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthRoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private _usuarioService: UsuarioService,
    private _actualizarComponentService: ActualizarComponentService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const token = localStorage.getItem('token');

    if (!token || token === 'undefined') {
      return this.router.createUrlTree(['/login']);
    }

    try {
      await firstValueFrom(this._usuarioService.verificarEstadoToken());

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRoles: string[] = payload.roles || [];
      const allowedRoles: string[] = route.data['roles'] || [];
      const hasRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return this.router.createUrlTree(['/access-denied']);
      }

      return true;

    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('repuestoCantidades');
      localStorage.removeItem('repuestosSeleccionadosParaCompra');
      this._actualizarComponentService.notificarHeader();
      return this.router.createUrlTree(['/login']);
    }
  }
}

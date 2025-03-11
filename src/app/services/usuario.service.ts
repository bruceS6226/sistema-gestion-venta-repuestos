import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { DetallesUsuario, OrdenCompra, Pago, Usuario } from '../models/usuario';
interface ChangePassword {
  email: string;
  password: string;
  newPassword: string;
}
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl: string;
  //public usuario: Usuario;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }
  
  guardarUsuario(usuario: Usuario): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/signup`, usuario);
  }
  login(email: string, password: string): Observable<any> {
    const usuario = { email: email, password: password };
    return this.http.post<any>(`${this.apiUrl}auth/signin`, usuario);
  }
  checkLoginStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}auth/status`);
  }
  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}auth/users`);
  }
  obtenerUsuario(_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}auth/user/${_id}`);
  }
  //actualizar usuario
  actualizarRolUsuario(_id: string, rol:string): Observable<any> {
    const body = {
      roles: [rol]
    }
    return this.http.patch<any>(`${this.apiUrl}auth/user/${_id}`, body);
  }
  cambiarEsActivo(_id: string, isActive: boolean): Observable<any> {
    const body = {
      isActive: isActive
    }
    return this.http.patch<any>(`${this.apiUrl}auth/user/${_id}`, body);
  }

  comprobarExistenciaUsuario(mail: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
  actualizarPassword(usuario: ChangePassword): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/change-password`, usuario);
  }
  //detalles usuario
  guardarDetallesUsuario(detallesUsuario: DetallesUsuario): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}user-detail`, detallesUsuario);
  }
  obtenerDetallesUsuario(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user-detail`);
  }
  //pago
  guardarOrdenCompra(detallesOrdenCompra: OrdenCompra): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}order`, detallesOrdenCompra);
  }
  guardarPago(detallesPago: Pago): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}order/stripe-payment`, detallesPago);
  }

  //estado token
  verificarEstadoToken(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}auth/status`);
  }
}

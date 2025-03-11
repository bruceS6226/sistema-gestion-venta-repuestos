import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Marca } from '../models/marca';
@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  agregarImagen(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}files/image`, formData);
  }
  crearMarca(marca: Marca): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}brand`, marca);
  }
  obtenerMarcas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}brand`);
  }
  obtenerMarca(_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}brand/${_id}`);
  }
  actualizarMarca(_id: string, marca: Marca): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}brand/${_id}`, marca);
  }
  eliminarMarca(_id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}brand/${_id}`);
  }
  
  buscarRepuestosPorMarca(textoBuscar: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part?brand=${textoBuscar}`)
  }
  
  obtenerModelos(marca: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}brand/model/all?brandName=${marca}`);
  }
  obtenerTipos(modelo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}brand/model/type/all?modelName=${modelo}`);
  }
}

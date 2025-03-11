import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Categoria } from '../models/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }

  crearCategoria(categoria: Categoria): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}category`, categoria);
  }
  obtenerCategorias(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}category`);
  }
  obtenerCategoria(_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}category/${_id}`);
  }
  actualizarCategoria(_id: string, categoria: Categoria): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}category/${_id}`, categoria);
  }
  eliminarCategoria(_id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}category/${_id}`);
  }

  buscarRepuestosPorCategoria(textoBuscar: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part?category=${textoBuscar}`)
  }

}

import { Injectable } from '@angular/core';
import { Repuesto } from '../models/repuesto';
import { map, Observable, switchMap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environment/environment';
import { Marca } from '../models/marca';
interface RepuestoFilters {
  search?: string;
  category?: string;
  brand?: string;
  brandModel?: string;
  modelType?: string;
  modelTypeYear?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RepuestoService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiUrl;
  }
  agregarImagen(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}files/image`, formData);
  }
  crearRepuesto(repuesto: Repuesto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}spare-part`, repuesto);
  }
  actualizarRepuesto(_id: string, repuesto: Repuesto): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}spare-part/${_id}`, repuesto);
  }
  obtenerRepuestos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part`);
  }
  obtenerRepuesto(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part/${code}`);
  }
  eliminarRepuesto(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}spare-part/${code}`);
  }

  obtenerCategorias(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}category`);
  }
  
  obtenerMarcas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}brand`);
  }
  obtenerModelos(marca: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}brand/model/all?brandName=${marca}`);
  }
  obtenerTipos(modelo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}brand/model/type/all?modelName=${modelo}`);
  }

  buscarRepuestos(filters: RepuestoFilters): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      const value = filters[key as keyof RepuestoFilters];
      if (value) {
        params = params.set(key, value);
      }
    });
    return this.http.get<any>(`${this.apiUrl}spare-part`, { params });
  }
  buscarRepuestosPorCategoria(textoBuscar: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part?category=${textoBuscar}`)
  }
  buscarRepuestosPorMarca(textoBuscar: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part?brand=${textoBuscar}`)
  }
  buscarRepuestosPorModelo(textoBuscar: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part?brandModel=${textoBuscar}`)
  }
  buscarRepuestosPorTipo(textoBuscar: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part?modelType=${textoBuscar}`)
  }
  buscarRepuestosPorAnio(textoBuscar: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}spare-part?modelTypeYear=${textoBuscar}`)
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActualizarComponentService {

  constructor() { }

  private actualizarHeaderSubject = new Subject<void>();
  actualizarHeader$ = this.actualizarHeaderSubject.asObservable();
  notificarHeader(): void {
    this.actualizarHeaderSubject.next()
  }

  private actualizarSearchSubject = new Subject<void>();
  actualizarSearch$ = this.actualizarSearchSubject.asObservable();
  notificarSearch(): void {
    this.actualizarSearchSubject.next()
  }

  private actualizarDetalleCarritoSubject = new Subject<void>();
  actualizarDetalleCarrito$ = this.actualizarDetalleCarritoSubject.asObservable();
  notificarDetalleCarrito(): void {
    this.actualizarDetalleCarritoSubject.next()
  }
}

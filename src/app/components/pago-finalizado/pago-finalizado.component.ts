import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Repuesto } from 'src/app/models/repuesto';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-pago-finalizado',
  templateUrl: './pago-finalizado.component.html',
  styleUrls: ['./pago-finalizado.component.css']
})
export class PagoFinalizadoComponent implements OnInit{
  public repuestosSeleccionadosParaCompra: Repuesto[] = []
  public foto: string = '';
  public cantidadRepuestosSeleccionadosParaComprar: number = 0;
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(private _errorService: ErrorService,
    private _actualizarComponentService: ActualizarComponentService,) {
    this._actualizarComponentService.actualizarDetalleCarrito$.subscribe({
      next: () => {
        this.ngOnInit()
      },
    });
    this._actualizarComponentService.actualizarHeader$.subscribe(() => {
      this.loadCarritoFromLocalStorage();
    });
  }

  private _cantidadRepuestosSubject = new BehaviorSubject<number>(0);
  public cantidadRepuestosSeleccionadosParaComprar$: Observable<number> = this._cantidadRepuestosSubject.asObservable();
private loadCarritoFromLocalStorage(): void {
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson) {
      try {
        this.repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson);
        this.cantidadRepuestosSeleccionadosParaComprar = this.repuestosSeleccionadosParaCompra.length;
        this._cantidadRepuestosSubject.next(this.cantidadRepuestosSeleccionadosParaComprar);
      } catch (error) {
        console.error('Error al analizar los datos del localStorage:', error);
        this.repuestosSeleccionadosParaCompra = [];
        this.cantidadRepuestosSeleccionadosParaComprar = 0;
        this._cantidadRepuestosSubject.next(0);
      }
    } else {
      this.repuestosSeleccionadosParaCompra = [];
      this.cantidadRepuestosSeleccionadosParaComprar = 0;
      this._cantidadRepuestosSubject.next(0);
    }
  }
  ngOnInit(): void {
    localStorage.removeItem('repuestosSeleccionadosParaCompra');
    this.loadCarritoFromLocalStorage();
    this._actualizarComponentService.notificarDetalleCarrito();
    this._actualizarComponentService.notificarHeader();
  }
}

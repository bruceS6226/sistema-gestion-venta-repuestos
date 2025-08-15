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

  }

  ngOnInit(): void {
    localStorage.removeItem('repuestosSeleccionadosParaCompra');
  }
}

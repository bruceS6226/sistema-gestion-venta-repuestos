import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Repuesto } from 'src/app/models/repuesto';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { ErrorService } from 'src/app/services/error.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-detalle-repuesto',
  templateUrl: './detalle-repuesto.component.html',
  styleUrls: ['./detalle-repuesto.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DetalleRepuestoComponent implements OnInit {

  public repuesto: Repuesto;
  public code: string = '';
  public apiUrl = environment.apiUrl;
  public fotoAmpliada: string = '';
  public isAdded: boolean = false;
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(private _repuestoService: RepuestoService, private route: ActivatedRoute, private _errorService: ErrorService,
    private _actualizarComponentService: ActualizarComponentService,) {
    this.route.params.subscribe(params => this.code = params['_id']);
    this.repuesto = new Repuesto({ images: [] });
  }

  ngOnInit(): void {
    this.obtenerRepuesto();
  }
  seleccionarFotoSecundaria(foto: string) {
    this.fotoAmpliada = foto;
  }
  obtenerRepuesto() {
    if (this.code) {
      this._repuestoService.obtenerRepuesto(this.code).subscribe({
        next: (value) => {
          this.repuesto = value;
          this.fotoAmpliada = this.repuesto.images![0];
          console.log(this.repuesto)
        },
      });
    } else {

    }
  }

  agregarAlCarrito(repuesto: Repuesto) {
    var repuestosSeleccionadosParaCompra: Repuesto[] = [];
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra')
    if (repuestosJson) {
      repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson) as Repuesto[];
    }
    const existeEnCarrito = repuestosSeleccionadosParaCompra.some(
      (r) => r.code === repuesto.code
    );

    if (!existeEnCarrito) {
      repuestosSeleccionadosParaCompra.push(repuesto);
      const promesas = repuestosSeleccionadosParaCompra.map(repuesto => {
        return new Promise<void>((resolve) => {
          this.repuestoCantidades.set(repuesto.code!, 1);
          resolve();
        });
      });

      Promise.all(promesas).then(() => {
        const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
        localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
        localStorage.setItem('repuestosSeleccionadosParaCompra', JSON.stringify(repuestosSeleccionadosParaCompra));
      });
      this._actualizarComponentService.notificarHeader();
      this.isAdded = true;
      setTimeout(() => {
        this.isAdded = false;
      }, 2000);
    } else {
      this._errorService.msjError("El repuesto ya está en el carrito.")
    }
  }

  retornar(): void {
    window.history.back();
  }
}

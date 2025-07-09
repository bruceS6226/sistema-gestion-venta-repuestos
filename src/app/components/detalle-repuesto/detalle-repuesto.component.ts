import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  public repuesto: Repuesto | undefined;
  public code: string = '';
  public apiUrl = environment.apiUrl;
  public fotoAmpliada: string = '';
  public isAdded: boolean = false;
  public isAddingToCart: boolean = false;
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(
    private _repuestoService: RepuestoService,
    private route: ActivatedRoute,
    private router: Router,
    private _errorService: ErrorService,
    private _actualizarComponentService: ActualizarComponentService,
    private cdr: ChangeDetectorRef, // Inyectar ChangeDetectorRef
  ) {
    this.repuesto = undefined;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.code = params['_id'];
      this.obtenerRepuesto();
    });
  }

  seleccionarFotoSecundaria(foto: string) {
    this.fotoAmpliada = foto;
  }

  obtenerRepuesto() {
    if (this.code) {
      this._repuestoService.obtenerRepuesto(this.code).subscribe({
        next: (value: Repuesto) => {
          this.repuesto = value;
          this.fotoAmpliada = this.repuesto.images && this.repuesto.images.length > 0
                              ? this.repuesto.images[0]
                              : 'assets/placeholder.jpg';
          this.checkIfAddedToCart();
          this.cdr.detectChanges(); // Forzar la detección de cambios después de obtener el repuesto
        },
        error: (err: any) => {
          this._errorService.msjError('Error al obtener los detalles del repuesto.');
          this.router.navigate(['/catalogo-repuestos']);
        }
      });
    } else {
      this._errorService.msjError('Código de repuesto no especificado.');
      this.router.navigate(['/catalogo-repuestos']);
    }
  }

  agregarAlCarrito(repuesto: Repuesto) {
    if (!repuesto || this.isAdded || this.isAddingToCart || (repuesto.stock !== undefined && repuesto.stock <= 0)) {
      return;
    }

    this.isAddingToCart = true;

    let repuestosSeleccionadosParaCompra: Repuesto[] = [];
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');

    if (repuestosJson) {
      repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson) as Repuesto[];
    }

    const existeEnCarrito = repuestosSeleccionadosParaCompra.some(
      (r: Repuesto) => r.code === repuesto.code
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

      this.isAdded = true;
      this.isAddingToCart = false;

    } else {
      this._errorService.msjError("El repuesto ya está en el carrito.");
      this.isAddingToCart = false;
    }
  }

  private checkIfAddedToCart(): void {
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson && this.repuesto && this.repuesto.code) {
      const repuestosEnCarrito: Repuesto[] = JSON.parse(repuestosJson);
      this.isAdded = repuestosEnCarrito.some((r: Repuesto) => r.code === this.repuesto?.code);
    } else {
      this.isAdded = false;
    }
    // No es estrictamente necesario aquí si `obtenerRepuesto` ya lo hace, pero no perjudica.
    // this.cdr.detectChanges();
  }

  retornar(): void {
    window.history.back();
  }
}
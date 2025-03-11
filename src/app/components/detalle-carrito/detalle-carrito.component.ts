import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Repuesto } from 'src/app/models/repuesto';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { ErrorService } from 'src/app/services/error.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-detalle-carrito',
  templateUrl: './detalle-carrito.component.html',
  styleUrls: ['./detalle-carrito.component.css']
})

export class DetalleCarritoComponent implements OnInit {
  public apiUrl = environment.apiUrl;
  public repuestosSeleccionadosParaCompra: Repuesto[] = []
  public foto: string = '';
  public cantidadRepuestosSeleccionadosParaComprar: number = 0;
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(private _repuestoService: RepuestoService, private route: ActivatedRoute, private _errorService: ErrorService,
    private _actualizarComponentService: ActualizarComponentService, private router: Router, private dialog: MatDialog,) {
    this._actualizarComponentService.actualizarDetalleCarrito$.subscribe({
      next: () => {
        this.ngOnInit()
      },
    })
  }
  ngOnInit(): void {
    this.obtenerRepuestosSeleccionadosParaComprar();
  }
  async obtenerRepuestosSeleccionadosParaComprar() {
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    const repuestoCantidadesJson = localStorage.getItem('repuestoCantidades');
    if (repuestosJson) {
      try {
        this.repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson)
        this.cantidadRepuestosSeleccionadosParaComprar = this.repuestosSeleccionadosParaCompra.length
        if (repuestoCantidadesJson) {
          const repuestoCantidadesArray = JSON.parse(repuestoCantidadesJson)
          this.repuestoCantidades = new Map(repuestoCantidadesArray);
        } else {
          const promesas = this.repuestosSeleccionadosParaCompra.map(repuesto => {
            return new Promise<void>((resolve) => {
              this.repuestoCantidades.set(repuesto.code!, 1);
              resolve(); // Resolvemos la promesa después de la operación
            });
          });

          Promise.all(promesas).then(() => {
            const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
            localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
          });
        }
      } catch (error) {
        console.error('Error al analizar los datos del localStorage:', error);
      }
    } else {
      this.repuestosSeleccionadosParaCompra = [];
      this.cantidadRepuestosSeleccionadosParaComprar = this.repuestosSeleccionadosParaCompra.length
    }
  }

  aumentarCantidad(code: string): void {
    const cantidadActual = this.repuestoCantidades.get(code);
    if (cantidadActual) {
      this.repuestoCantidades.set(code, cantidadActual + 1);
      const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
      localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
    }
  }

  disminuirCantidad(code: string): void {
    const cantidadActual = this.repuestoCantidades.get(code);
    if (cantidadActual && cantidadActual > 1) {
      this.repuestoCantidades.set(code, cantidadActual - 1);
      const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
      localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
    }
  }

  eliminarDelCarrito(repuesto: Repuesto) {
    let repuestosSeleccionadosParaCompra = [];
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson) {
      repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson);
      const index = repuestosSeleccionadosParaCompra.findIndex((item: Repuesto) => item.code === repuesto.code);
      if (index !== -1) {
        repuestosSeleccionadosParaCompra.splice(index, 1);
        this.repuestoCantidades.delete(repuesto.code!);
        localStorage.setItem('repuestosSeleccionadosParaCompra', JSON.stringify(repuestosSeleccionadosParaCompra));
        const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
        localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
        this.ngOnInit();
        this._actualizarComponentService.notificarHeader();
      }
    }
  }

  continuarPago() {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/payment-detail']);
    } else {
      const dialogRef = this.dialog.open(ContenidoDialogoIniciarSesion, {
        width: '40%',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'login') {
          window.location.href = `/login`;
        }
      });
    }
  }

  retornar(): void {
    window.history.back();
  }

}

@Component({
  selector: 'dialog-content',
  template: `
    <h1 mat-dialog-title>Inicio de sesión requerido</h1>
    <mat-dialog-content class="mat-typography">
    Debe iniciar sesión para poder continuar con el pago
    </mat-dialog-content>
    <mat-dialog-actions class="" align="end">
      <button mat-raised-button mat-dialog-close>Cancelar</button>
      <button routerLink="/login" color="primary" mat-dialog-close="login" mat-raised-button cdkFocusInitial>Iniciar sesión</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ContenidoDialogoIniciarSesion { }
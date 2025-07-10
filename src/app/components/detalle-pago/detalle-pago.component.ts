import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Form, NgForm } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Repuesto } from 'src/app/models/repuesto';
import { DetallesUsuario, Items, OrdenCompra, Pago } from 'src/app/models/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-detalle-pago',
  templateUrl: './detalle-pago.component.html',
  styleUrls: ['./detalle-pago.component.css']
})
export class DetallePagoComponent implements OnInit {

  public detallesUsuario: DetallesUsuario;
  public ciudades: string[] = [];
  public repuestosSeleccionadosParaCompra: Repuesto[] = []
  public cantidadRepuestosSeleccionadosParaComprar: number = 0;
  public repuestoCantidades: Map<string, number> = new Map<string, number>();
  public items: Items[] = [];
  @ViewChild('detalleUsuarioForm', { static: false }) detalleUsuarioForm!: NgForm;

  provincias: string[] = ['Pichincha', 'Guayas', 'Azuay', 'Manabí', 'Tungurahua'];

  constructor(
    private _usuarioService: UsuarioService, private _errorService: ErrorService,
    private _exitoService: ExitoService, private dialog: MatDialog,) {
    this.detallesUsuario = new DetallesUsuario({ identityDocumentType: '', province: '', city: '' });
  }
  ngOnInit(): void {
    this.mostrarDetallePedido = false;
    this.obtenerRepuestosSeleccionadosParaComprar();
    this.obtenerDetallesUsuario();
  }


  obtenerDetallesUsuario() {
    this._usuarioService.obtenerDetallesUsuario().subscribe({
      next: (value) => {
        if (value.length > 0) {
          const dialogRef = this.dialog.open(ContenidoDialogoSeleccionarDetalles, {
            data: value
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.detallesUsuario = result;
              this.onProvinceChange(this.detallesUsuario.province)
              this.mostrarDetallePedido = true;
            }
          });
        }
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    })
  }

  obtenerRepuestosSeleccionadosParaComprar() {
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    const repuestoCantidadesJson = localStorage.getItem('repuestoCantidades');
    if (repuestosJson) {
      try {
        this.repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson)
        this.cantidadRepuestosSeleccionadosParaComprar = this.repuestosSeleccionadosParaCompra.length
        if (repuestoCantidadesJson) {
          const repuestoCantidadesArray = JSON.parse(repuestoCantidadesJson)
          this.repuestoCantidades = new Map(repuestoCantidadesArray);
          this.repuestoCantidades.forEach((quantity, code) => {
            this.items.push({ code, quantity });
          });
        } else {
          const promesas = this.repuestosSeleccionadosParaCompra.map(repuesto => {
            return new Promise<void>((resolve) => {
              this.repuestoCantidades.set(repuesto.code!, 1);
              resolve();
            });
          });

          Promise.all(promesas).then(() => {
            const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
            localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
            this.repuestoCantidades.forEach((quantity, code) => {
              this.items.push({ code, quantity });
            });
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

  ciudadesPorProvincia: { [key: string]: string[] } = {
    'Pichincha': ['Quito', 'Cayambe', 'Rumiñahui'],
    'Guayas': ['Guayaquil', 'Samborondón', 'Daule'],
    'Azuay': ['Cuenca', 'Gualaceo', 'Chordeleg'],
    'Manabí': ['Portoviejo', 'Manta', 'Chone'],
    'Tungurahua': ['Ambato', 'Baños', 'Pelileo']
  };

  onProvinceChange(event: any | string) {
    if (typeof event === 'string') {
      // event es un string
      const selectedProvince = event as string;
      this.ciudades = this.ciudadesPorProvincia[selectedProvince] || [];
    } else {
      const selectedProvince = event.target.value as keyof typeof this.ciudadesPorProvincia;
      this.ciudades = this.ciudadesPorProvincia[selectedProvince] || [];
    }
  }
  verificarFormulario(form: NgForm) {
    for (const controlName in form.controls) {
      if (form.controls.hasOwnProperty(controlName)) {
        const control = form.controls[controlName];
        if (control.invalid || control.errors?.['required']) {
          this.detalleUsuarioForm.control.markAllAsTouched();
          return false;
        }
      }
    }
    return true;
  }


  public appUrl = environment.appUrl;
  realizarPago(form: NgForm, btn: MatButton) {
    if (this.verificarFormulario(form)) {
      const ordenCompra: OrdenCompra = new OrdenCompra({ userDetailID: this.detallesUsuario._id, items: this.items })
      this._usuarioService.guardarOrdenCompra(ordenCompra).subscribe({
        next: (value) => {
          this._exitoService.mostrarExito(`Pronto será redirigido al link para pago`);
          const pago: Pago = new Pago({
            orderID: value.orderID,
            successURL: `${this.appUrl}/payment-correct`,
            cancelURL: `${this.appUrl}/payment-detail`,
            tax: 0.15
          })
          btn.disabled = false;
          setTimeout(() => {
            this._usuarioService.guardarPago(pago).subscribe({
              next: (value) => {
                console.log(value)
                window.location.href = value.url;
              },
              error: (e: HttpErrorResponse) => {
                btn.disabled = false;
                this._errorService.msjError(e);
              }
            })
          }, 3000);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      })
    } else {
      btn.disabled = false;
    }
  }
  guardarDetalleUsuario(form: NgForm, btn: MatButton) {
    if (this.verificarFormulario(form)) {
      this._usuarioService.guardarDetallesUsuario(this.detallesUsuario).subscribe({
        next: (value) => {
          this._exitoService.mostrarExito(`¡Eso es todo! Ahora puedes continuar con el pago de tu/s producto/s`);
          this.mostrarDetallePedido = true; // <-- Mostrar el detalle de pedido
          this.detallesUsuario = value; // <-- Asegura que tienes el _id actualizado
          btn.disabled = false;
        },
        error: (e: HttpErrorResponse) => {
          btn.disabled = false;
          this._errorService.msjError(e);
        }
      })
    } else {
      btn.disabled = false;
    }
  }

  calcularTotal(): number {
    let total = 0.0;
    for (const repuesto of this.repuestosSeleccionadosParaCompra) {
      const cantidadActual = this.repuestoCantidades.get(repuesto.code!);
      if (cantidadActual && repuesto.price) {
        total += repuesto.price * cantidadActual;
      } else if (repuesto.price) {
        total += repuesto.price;
      }
    }
    total = total * 1.15
    const aux = total.toFixed(2);
    total = Number(aux)
    return total;
  }

  calcularSubTotal(): number {
    let total = 0.0;
    for (const repuesto of this.repuestosSeleccionadosParaCompra) {
      const cantidadActual = this.repuestoCantidades.get(repuesto.code!);
      if (cantidadActual && repuesto.price) {
        total += repuesto.price * cantidadActual;
      } else if (repuesto.price) {
        total += repuesto.price;
      }
    }
    total = total
    const aux = total.toFixed(2);
    total = Number(aux)
    return total;
  }

  calcularIVA(indice: number): number {
    let total = 0.0;
    for (const repuesto of this.repuestosSeleccionadosParaCompra) {
      const cantidadActual = this.repuestoCantidades.get(repuesto.code!);
      if (cantidadActual && repuesto.price) {
        total += repuesto.price * cantidadActual;
      } else if (repuesto.price) {
        total += repuesto.price;
      }
    }
    total = total * (indice - 1)
    const aux = total.toFixed(2);
    total = Number(aux)
    return total;
  }
  retornar(): void {
    window.history.back();
  }

  public mostrarDetallePedido: boolean = false;

}

import { CommonModule } from '@angular/common';
import { environment } from 'src/environment/environment';
@Component({
  selector: 'dialog-content',
  template: `
    <h1 mat-dialog-title>¿Desea seleccionar detalles de un cliente que ha usado con anterioridad?</h1>
    <mat-dialog-content class="mat-typography">
    Si es asi, seleccione con cual desea seguir con el proceso de pago:
      <mat-chip-listbox class="mat-mdc-chip-set-stacked mt-2" aria-label="Detalles de Usuario">
        <mat-chip-option *ngFor="let detalle of data"
                         [selected]="detalle === selectedDetalle"
                         (selectionChange)="onSelectionChange(detalle, $event)">
          {{detalle.firstName}} {{detalle.lastName}}
        </mat-chip-option>
      </mat-chip-listbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close>Cancelar</button>
      <button color="primary" [mat-dialog-close]="selectedDetalle" mat-raised-button cdkFocusInitial>Seleccionar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    CommonModule,
  ],
})
export class ContenidoDialogoSeleccionarDetalles {
  selectedDetalle: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  onSelectionChange(detalle: any, event: MatChipSelectionChange) {
    if (event.selected) {
      this.selectedDetalle = detalle;
    }
  }
}
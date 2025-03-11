import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarComponent } from 'src/app/dialogs/confirmar/confirmar.component';
import { Repuesto } from 'src/app/models/repuesto';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { RepuestoService } from 'src/app/services/repuesto.service';

@Component({
  selector: 'app-repuestos',
  templateUrl: './repuestos.component.html',
  styleUrls: ['./repuestos.component.css']
})
export class RepuestosComponent {
  public repuestos: Repuesto[] = [];

  constructor(private dialog: MatDialog, private _repuestoService: RepuestoService, private _errorService: ErrorService,
    private _exitoService: ExitoService) {
  }

  ngOnInit() {
    this.obtenerRepuestos();
  }
  obtenerRepuestos() {
    this._repuestoService.obtenerRepuestos().subscribe({
      next: (value) => {
        this.repuestos = value.results;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }
  abrirDialogEliminar(code?: string, nombre?: string): void {
    const titulo = `¿Está seguro de que desea eliminar el repuesto ${nombre}?`;
    const contenido = 'Esta acción eliminará permanentemente el repuesto y todos los elementos asociados.';
    const dialogRef = this.dialog.open(ConfirmarComponent, {
      width: '40%',
      data: { titulo, contenido },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) { this.eliminarRepuesto(code) }
    });
  }
  comprobarStock(code?: string, stock?: number, nombre?: string): void {
    if (stock !== 0) {
      this._errorService.msjError('No se puede eliminar un repuesto que tiene un stock mayor que 0');
    } else {
      const titulo = `¿Está seguro de que desea eliminar el repuesto ${nombre}?`;
      const contenido = 'Esta acción eliminará permanentemente el repuesto y todos los elementos asociados.';
      const dialogRef = this.dialog.open(ConfirmarComponent, {
        width: '40%',
        data: { titulo, contenido },
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) { this.eliminarRepuesto(code) }
      });
    }
  }
  eliminarRepuesto(code?: string) {
    this._repuestoService.eliminarRepuesto(code!).subscribe({
      next: () => {
        this._exitoService.mostrarExito();
        this.obtenerRepuestos();
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
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
  public cantidadRepuestos: number = 0;
  public repuestosPorPagina: Repuesto[] = []

  constructor(private dialog: MatDialog, private _repuestoService: RepuestoService, private _errorService: ErrorService,
    private _exitoService: ExitoService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.obtenerRepuestos();
  }
  obtenerRepuestos() {
    this._repuestoService.obtenerRepuestos().subscribe({
      next: (value) => {
        this.repuestos = value.results;
        this.cantidadRepuestos = this.repuestos.length;
        this.repuestosPorPagina = this.repuestos.slice(0, this.tamanioPagina);
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

  
  public tamanioPagina: number = 10;
    volverArriba() {
    const container = document.querySelector('.repuestos') as HTMLElement;
    var posicion = container.offsetTop - 110;
    if (this.route.firstChild) {
      posicion = 0;
    }
    console.log(posicion)
    window.scroll({
      top: posicion,
      left: 0,
      behavior: 'smooth'
    });
  }

cambiarPagina(event: PageEvent) {

  const inicio = event.pageIndex * event.pageSize;
  const fin = inicio + event.pageSize;

  this.repuestosPorPagina = this.repuestos.slice(inicio, fin);
}

}

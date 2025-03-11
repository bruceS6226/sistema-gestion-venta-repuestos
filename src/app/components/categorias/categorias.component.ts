import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarComponent } from 'src/app/dialogs/confirmar/confirmar.component';
import { Categoria } from 'src/app/models/categoria';
import { CategoriaService } from 'src/app/services/categoria.service';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  public categorias: Categoria[] = [];

  constructor(private dialog: MatDialog, private _categoriaService: CategoriaService, private _errorService: ErrorService,
    private _exitoService: ExitoService) {
  }

  ngOnInit() {
    this.obtenerCategorias();
  }
  obtenerCategorias() {
    this._categoriaService.obtenerCategorias().subscribe({
      next: (value) => {
        this.categorias = value;
        console.log(value);
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }
  abrirDialogEliminar(_id?: string, nombre?: string): void {
    this._categoriaService.buscarRepuestosPorCategoria(nombre!).subscribe({
      next: (value) => {
        if (value.length > 0) {
          this._errorService.msjError(`No se puede eliminar la categoría "${nombre}" porque tiene tiene repuesto/s relacionados.`);
        } else {
          const titulo = `¿Está seguro de que desea eliminar la categoría ${nombre}?`;
          const contenido = 'Esta acción eliminará permanentemente la categoría.';
          const dialogRef = this.dialog.open(ConfirmarComponent, {
            width: '40%',
            data: { titulo, contenido },
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) { this.eliminarCategoria(_id) }
          });
        }
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }
  eliminarCategoria(_id?: string) {
    this._categoriaService.eliminarCategoria(_id!).subscribe({
      next: () =>{
        this._exitoService.mostrarExito();
        this.obtenerCategorias();
      },
      error: (err) => {
        this._errorService.msjError(err);
      },
    })
  }
}


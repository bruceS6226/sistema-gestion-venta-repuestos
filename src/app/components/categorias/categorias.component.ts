import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarComponent } from 'src/app/dialogs/confirmar/confirmar.component'; // Asegúrate de que esta ruta sea correcta
import { Categoria } from 'src/app/models/categoria'; // Asegúrate de que esta ruta sea correcta
import { CategoriaService } from 'src/app/services/categoria.service';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { Subject, firstValueFrom } from 'rxjs'; // Añadir firstValueFrom y Subject
import { takeUntil } from 'rxjs/operators'; // Añadir takeUntil

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit, OnDestroy {
  public categorias: Categoria[] = [];
  public newCategoryName: string = '';
  public existeNuevoNombre: boolean = false;
  public isLoading: boolean = false;
  public editandoId: string | null = null;
  public editedName: string = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private _categoriaService: CategoriaService,
    private _errorService: ErrorService,
    private _exitoService: ExitoService
  ) { }

  ngOnInit() {
    this.obtenerCategorias();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  obtenerCategorias() {
    this._categoriaService.obtenerCategorias().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (value) => {
        this.categorias = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    });
  }

  comprobarNuevoNombre() {
    this.existeNuevoNombre = false;
    if (this.newCategoryName.trim() === '') {
      return;
    }
    const normalizedNewName = this.newCategoryName.trim().toLowerCase();
    this.existeNuevoNombre = this.categorias.some(c => c.name!.toLowerCase() === normalizedNewName);
  }

  async crearNuevaCategoria() {
    if (this.newCategoryName.trim() === '') {
      this._errorService.msjError('El nombre de la categoría es obligatorio.');
      return;
    }
    if (this.existeNuevoNombre) {
      this._errorService.msjError('Esta categoría ya existe.');
      return;
    }

    const nuevaCategoria: Categoria = { name: this.newCategoryName.trim(), title: this.newCategoryName.trim() };

    try {
      const response = await firstValueFrom(this._categoriaService.crearCategoria(nuevaCategoria));
      this._exitoService.mostrarExito('Categoría creada exitosamente!');
      this.newCategoryName = ''; // Limpiar el input
      this.existeNuevoNombre = false; // Resetear el estado de existencia
      this.obtenerCategorias(); // Volver a cargar la lista
    } catch (err: any) {
      this._errorService.msjError(err);
    } finally {
      this.isLoading = false; // Deshabilitar spinner siempre al finalizar
    }
  }

  clearNewCategoryInput() {
    this.newCategoryName = '';
    this.existeNuevoNombre = false;
  }

  abrirDialogEliminar(_id?: string, nombre?: string): void {
    this._categoriaService.buscarRepuestosPorCategoria(nombre!).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (value) => {
        if (value.results.length > 0) {
          this._errorService.msjError(`No se puede eliminar la categoría "${nombre}" porque tiene repuesto/s relacionado/s.`);
        } else {
          const titulo = `¿Está seguro de que desea eliminar la categoría ${nombre}?`;
          const contenido = 'Esta acción eliminará permanentemente la categoría.';
          const dialogRef = this.dialog.open(ConfirmarComponent, {
            data: { titulo, contenido },
          });
          dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
            if (result) { this.eliminarCategoria(_id); }
          });
        }
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    });
  }

  eliminarCategoria(_id?: string) {
    this._categoriaService.eliminarCategoria(_id!).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        this._exitoService.mostrarExito('Categoría eliminada exitosamente!');
        this.obtenerCategorias();
      },
      error: (err) => {
        this._errorService.msjError(err);
      },
    });
  }

  @ViewChild('editInput') editInputRef!: ElementRef;
  activarEdicion(categoria: Categoria) {
    this.editandoId = categoria._id!;
    this.editedName = categoria.name!;

    setTimeout(() => {
      this.editInputRef?.nativeElement?.focus();
    }, 0);
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.editedName = '';
  }


  guardarEdicion(categoria: Categoria) {
    const nuevoNombre = this.editedName.trim();
    if (nuevoNombre === '') {
      this._errorService.msjError('El nombre no puede estar vacío.');
      return;
    }
    if (nuevoNombre.toLowerCase() === categoria.name!.toLowerCase()) {
      this.cancelarEdicion();
      return;
    }
    const existe = this.categorias.some(cat =>
      cat.name!.toLowerCase() === nuevoNombre.toLowerCase() &&
      cat._id !== categoria._id
    );

    if (existe) {
      this._errorService.msjError('Ya existe una categoría con ese nombre.');
      return;
    }

    const actualizada: Categoria = { name: nuevoNombre, title: nuevoNombre };
    console.log(actualizada)
    this._categoriaService.actualizarCategoria(categoria._id!, actualizada).subscribe({
      next: () => {
        this._exitoService.mostrarExito('Categoría actualizada correctamente.');
        this.editandoId = null;
        this.editedName = '';
        this.obtenerCategorias();
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    });
  }

}
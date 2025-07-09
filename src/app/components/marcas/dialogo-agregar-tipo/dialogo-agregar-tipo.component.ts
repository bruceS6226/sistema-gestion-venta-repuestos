import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarcaService } from 'src/app/services/marca.service';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';

@Component({
  selector: 'app-dialogo-agregar-tipo',
  templateUrl: './dialogo-agregar-tipo.component.html',
  styleUrls: ['./dialogo-agregar-tipo.component.css']
})
export class DialogoAgregarTipoComponent implements OnInit {
  tipoForm: FormGroup;
  cargando = false;
  tipos: any[] = [];
  tipoExistente = false;
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private _marcaService: MarcaService,
    private _errorService: ErrorService,
    private _exitoService: ExitoService,
    public dialogRef: MatDialogRef<DialogoAgregarTipoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { modelId: string, modeloName: string, tipoId?: string }
  ) {
    this.tipoForm = this.fb.group({
      name: ['', [Validators.required]],
    });
    this.modoEdicion = !!data.tipoId;
  }

  ngOnInit(): void {
    this._marcaService.obtenerTipos(this.data.modeloName).subscribe({
      next: (tipos: any[]) => {
        this.tipos = tipos;

        if (this.modoEdicion && this.data.tipoId) {
          const tipoEditar = this.tipos.find(t => t._id === this.data.tipoId);
          if (tipoEditar) {
            this.tipoForm.patchValue({ name: tipoEditar.name });
          }
        }

        this.tipoForm.get('name')?.valueChanges.subscribe((valor: string) => {
          const nombre = valor.trim().toLowerCase();
          this.tipoExistente = this.tipos.some(t =>
            t.name.toLowerCase() === nombre &&
            (!this.modoEdicion || t._id !== this.data.tipoId)
          );
        });
      },
      error: (err) => this._errorService.msjError(err)
    });
  }

  onSubmit() {
    if (this.tipoForm.invalid) return;

    const tipoName = this.tipoForm.value.name.trim();
    this.tipoExistente = false;
    this.cargando = true;

    const existe = this.tipos.some(t =>
      t.name.toLowerCase() === tipoName.toLowerCase() &&
      (!this.modoEdicion || t._id !== this.data.tipoId)
    );
    if (existe) {
      this.tipoExistente = true;
      this.cargando = false;
      return;
    }

    if (this.modoEdicion && this.data.tipoId) {
      const tipoActualizado = { name: tipoName };
      this._marcaService.actualizarTipo(this.data.tipoId, tipoActualizado).subscribe({
        next: () => {
          this._exitoService.mostrarExito('El tipo se ha editado con éxito.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this._errorService.msjError(err);
          this.cargando = false;
        }
      });
    } else {
      const nuevoTipo = {
        modelId: this.data.modelId,
        name: tipoName
      };
      this._marcaService.crearTipo(nuevoTipo).subscribe({
        next: () => {
          this._exitoService.mostrarExito('El tipo se ha agregado con éxito.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this._errorService.msjError(err);
          this.cargando = false;
        }
      });
    }
  }

  onCancel() {
    this.tipoForm.reset();
    Object.keys(this.tipoForm.controls).forEach(controlName => {
      const control = this.tipoForm.get(controlName);
      if (control) {
        control.markAsPristine();
        control.markAsUntouched();
      }
    });
    this.tipoExistente = false;
    this.dialogRef.close();
  }
}

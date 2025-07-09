import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarcaService } from 'src/app/services/marca.service';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';

@Component({
  selector: 'app-dialogo-agregar-modelo',
  templateUrl: './dialogo-agregar-modelo.component.html',
  styleUrls: ['./dialogo-agregar-modelo.component.css']
})
export class DialogoAgregarModeloComponent implements OnInit {
  modeloForm: FormGroup;
  cargando = false;
  modelos: any[] = [];
  modeloExistente = false;
  modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private _marcaService: MarcaService,
    private _errorService: ErrorService,
    private _exitoService: ExitoService,
    public dialogRef: MatDialogRef<DialogoAgregarModeloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { marcaId: string, marcaName: string, modelId?: string }
  ) {
    this.modeloForm = this.fb.group({
      name: ['', [Validators.required]],
    });
    this.modoEdicion = !!data.modelId;
  }

  ngOnInit(): void {
    this._marcaService.obtenerModelos(this.data.marcaName).subscribe({
      next: (modelos: any[]) => {
        this.modelos = modelos;

        if (this.modoEdicion && this.data.modelId) {
          const modeloEditar = this.modelos.find(m => m._id === this.data.modelId);
          if (modeloEditar) {
            this.modeloForm.patchValue({ name: modeloEditar.name });
          }
        }

        this.modeloForm.get('name')?.valueChanges.subscribe((valor: string) => {
          const nombre = valor?.trim().toLowerCase();
          this.modeloExistente = this.modelos.some(m =>
            m.name.toLowerCase() === nombre &&
            (!this.modoEdicion || m._id !== this.data.modelId)
          );
        });

      },
      error: (err) => this._errorService.msjError(err)
    });
  }

onSubmit() {
  if (this.modeloForm.invalid) return;

  const nombreModelo = this.modeloForm.value.name.trim();
  this.modeloExistente = false; // Corregir nombre de variable
  this.cargando = true;

  const existe = this.modelos.some(modelo =>
    modelo.name.toLowerCase() === nombreModelo.toLowerCase() &&
    (!this.modoEdicion || modelo._id !== this.data.modelId)
  );

  if (existe) {
    this.cargando = false;
    this.modeloExistente = true; // Corregir nombre de variable
    return;
  }

    if (this.modoEdicion && this.data.modelId) {
      const modeloActualizado = { name: nombreModelo };
      this._marcaService.actualizarModelo(this.data.modelId, modeloActualizado).subscribe({
        next: () => {
          this._exitoService.mostrarExito('El modelo se ha editado con éxito.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this._errorService.msjError(err);
          this.cargando = false;
        }
      });
    } else {
      const nuevoModelo = {
        brandId: this.data.marcaId,
        name: nombreModelo
      };

      this._marcaService.crearModelo(nuevoModelo).subscribe({
        next: () => {
          this._exitoService.mostrarExito('El modelo se ha agregado con éxito.');
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
    this.modeloForm.reset();

    Object.keys(this.modeloForm.controls).forEach(controlName => {
      const control = this.modeloForm.get(controlName);
      if (control) {
        control.markAsPristine();
        control.markAsUntouched();
      }
    });

    this.modeloExistente = false;
    this.dialogRef.close();
  }
}

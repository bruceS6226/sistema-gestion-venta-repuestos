import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Injectable } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private dialog: MatDialog) { }

  msjError(e: HttpErrorResponse | string) {
    if (typeof e === 'string') {
      this.mostrarDialogoError(e);
    } else {
      if (e.error) {
        if (e.error.message) {
        this.mostrarDialogoError(`${e.error.message}`);
        }else if(e.error.error.message){
          console.log(e.error.error.message);
          this.mostrarDialogoError(`${e.error.error.message}`);
        }
      } else {
        this.mostrarDialogoError(`Ha ocurrido un error, comuníquese con el administrador`);
      }
    }
  }
  private mostrarDialogoError(mensaje: string) {
    const dialogRef = this.dialog.open(ContenidoDialogoError, { width: '40%', data: mensaje });
  }
}

@Component({
  selector: 'dialog-content',
  template: `
    <h1 mat-dialog-title>¡Atención!</h1>
    <mat-dialog-content class="mat-typography">
      {{data}}
    </mat-dialog-content>
    <mat-dialog-actions class="" align="end">
      <button color="warn" mat-raised-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ContenidoDialogoError {
  constructor(
    public dialogRef: MatDialogRef<ContenidoDialogoError>,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) { }
}

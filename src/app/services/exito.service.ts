import { Component, Inject, Injectable } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
interface RespuestaExitosa {
  msg: string;
}
@Injectable({
  providedIn: 'root'
})
export class ExitoService {

  constructor(private dialog: MatDialog, private router: Router) { }

  mostrarExito(mensaje?: string | { msg: string }) {
    if (typeof mensaje === 'string') {
      this.mostrarDialogoExito(mensaje);
    } else {
      if (mensaje && mensaje.msg) {
        this.mostrarDialogoExito(mensaje.msg);
      } else {
        console.log(mensaje);
        this.mostrarDialogoExito('Los cambios se han guardado correctamente.');
      }
    }
  }
  private mostrarDialogoExito(mensaje: string) {
    const dialogRef = this.dialog.open(ContenidoDialogoExito, { width: '40%', data: mensaje });
  }
}

@Component({
  selector: 'dialog-content',
  template: `
    <h1 mat-dialog-title>¡Operación exitosa!</h1>
    <mat-dialog-content class="mat-typography">
      {{ data }}
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button color="primary" mat-raised-button mat-dialog-close cdkFocusInitial>Cerrar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ContenidoDialogoExito {
  constructor(public dialogRef: MatDialogRef<ContenidoDialogoExito>,
  @Inject(MAT_DIALOG_DATA) public data: string) { }
}
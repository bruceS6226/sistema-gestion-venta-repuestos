import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private snackBar: MatSnackBar) { }

  msjError(e: HttpErrorResponse | string) {
    let mensaje = 'Ha ocurrido un error, comuníquese con el administrador';

    if (typeof e === 'string') {
      mensaje = e;
    } else if (e.error) {
      if (e.error.message) {
        mensaje = e.error.message;
      } else if (e.error.error?.message) {
        console.log(e.error.error.message);
        mensaje = e.error.error.message;
      }
    }

    this.mostrarSnackbarError(mensaje);
  }

  private mostrarSnackbarError(mensaje: string) {
    const config: MatSnackBarConfig = {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    };

    this.snackBar.open(mensaje, undefined, config);
  }
}

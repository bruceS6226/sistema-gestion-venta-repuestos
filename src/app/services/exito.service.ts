import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ExitoService {

  constructor(private snackBar: MatSnackBar) { }

  mostrarExito(mensaje?: string | { msg: string }) {
    let texto = 'Los cambios se han guardado correctamente.';

    if (typeof mensaje === 'string') {
      texto = mensaje;
    } else if (mensaje && mensaje.msg) {
      texto = mensaje.msg;
    } else {
      console.log(mensaje);
    }

    this.mostrarSnackbarExito(texto);
  }

  private mostrarSnackbarExito(mensaje: string) {
    const config: MatSnackBarConfig = {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-exito']
    };

    this.snackBar.open(mensaje, undefined, config);
  }
}

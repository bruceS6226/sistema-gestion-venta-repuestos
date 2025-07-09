import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmarComponent } from 'src/app/dialogs/confirmar/confirmar.component';
import { Usuario } from 'src/app/models/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  public usuarios: Usuario[] = [];
  public roles = [
    { value: 'user', label: 'Usuario' },
    { value: 'employee', label: 'Empleado' }
  ];

  constructor(private dialog: MatDialog, private _usuarioService: UsuarioService, private _errorService: ErrorService,
    private _exitoService: ExitoService) {
  }

  ngOnInit() {
    this.obtenerUsuarios();
  }
  obtenerUsuarios() {
    this._usuarioService.obtenerUsuarios().subscribe({
      next: (value) => {
        this.usuarios = value;
        console.log(value);
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }
  getLabelsRoles(valores?: string[]): string {
  if (!valores || valores.length === 0) return 'Sin roles';
  return valores.map(v => {
    const rol = this.roles.find(r => r.value === v);
    return rol ? rol.label : v;
  }).join(', ');
}

  abrirDialogoEsActivo(_id: string, nombre: string, isActive: boolean) {
    let accion
    if (isActive) {
      accion = "desactivar"
    } else {
      accion = "activar"
    }
    const titulo = `¿Está seguro de que desea ${accion} a ${nombre}?`;
    const contenido = 'Esta acción cambiará el estado del usuario.';
    const dialogRef = this.dialog.open(ConfirmarComponent, {
      data: { titulo, contenido },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._usuarioService.cambiarEsActivo(_id, !isActive).subscribe({
          next: () => {
            this._exitoService.mostrarExito();
            this.obtenerUsuarios();
          },
          error: (err) => {
            this._errorService.msjError(err);
          }
        })
      } else {
        this.obtenerUsuarios();
      }
    });
  }

  cambiarRolUsuario(_id: string, roles: string[]) {
    const dialogRef = this.dialog.open(ContenidoDialogoSeleccionarDetalles, {
      data: roles
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._usuarioService.actualizarRolUsuario(_id, result).subscribe({
          next: () => {
            this._exitoService.mostrarExito();
            this.obtenerUsuarios();
          },
          error: (err) => {
            this._errorService.msjError(err);
          }
        })
      }
    });
  }
}


import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
@Component({
  selector: 'dialog-content',
  template: `
    <h1 mat-dialog-title>¿Desea cambiar el rol del usuario?</h1>
    <mat-dialog-content class="mat-typography">
      Si es así, seleccione el rol que desea asignar:
      <mat-chip-listbox class="mat-mdc-chip-set-stacked mt-2" aria-label="Roles de usuario">
        <mat-chip-option *ngFor="let rol of todosRoles"
                         [selected]="data[0] === rol.value"
                         (selectionChange)="onSelectionChange(rol.value, $event)">
          {{ rol.label }}
        </mat-chip-option>
      </mat-chip-listbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button mat-dialog-close>Cancelar</button>
      <button color="primary" [mat-dialog-close]="selectedRol" mat-raised-button cdkFocusInitial>
        Seleccionar
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    CommonModule,
  ],
})
export class ContenidoDialogoSeleccionarDetalles {
  selectedRol: any;
  todosRoles = [
    { value: 'user', label: 'Usuario' },
    { value: 'employee', label: 'Empleado' }
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  onSelectionChange(valor: string, event: MatChipSelectionChange) {
    if (event.selected) {
      this.selectedRol = valor;
    }
  }
}

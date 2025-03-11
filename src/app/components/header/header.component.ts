import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import * as jwt from 'jwt-decode';
import { Usuario } from 'src/app/models/usuario';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { Store } from '@ngrx/store';
import { selectEmail, selectRoles, selectToken } from 'src/app/store/login.selectors.selectors';
import { logout } from 'src/app/store/login.actions.action';
import { Repuesto } from 'src/app/models/repuesto';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { HttpErrorResponse } from '@angular/common/http';
interface RepuestoFilters {
  search?: string;
}
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  public token: string | null = '';
  public email: string = '';
  public roles: string[] = [];
  public usuario: Usuario;
  public textoBuscar: string = '';
  public repuestos: Repuesto[] = [];
  public repuestosFitradosNombre: Repuesto[] = [];
  public categorias: any[] = [];
  public repuestosSeleccionadosParaCompra: Repuesto[] = []
  public cantidadRepuestosSeleccionadosParaComprar: number = 0;

  constructor(private _errorService: ErrorService, private _exitoService: ExitoService, private router: Router,
    private _actualizarComponentService: ActualizarComponentService, private store: Store, private _repuestoService: RepuestoService) {
    this.usuario = new Usuario({ userName: '', roles: [''] });
    this._actualizarComponentService.actualizarHeader$.subscribe({
      next: () => {
        this.usuario = new Usuario({ userName: '', roles: [''] });
        this.ngOnInit()
      },
    })
  }

  ngOnInit() {
    this.obtenerInformacionToken();
    this.obtenerTodosRepuestos();
    this.obtenerRepuestosSeleccionadosParaComprar();
  }
  obtenerRepuestosSeleccionadosParaComprar() {
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson) {
      try {
        this.repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson)
        this.cantidadRepuestosSeleccionadosParaComprar = this.repuestosSeleccionadosParaCompra.length
      } catch (error) {
        console.error('Error al analizar los datos del localStorage:', error);
      }
    } else {
      this.repuestosSeleccionadosParaCompra = [];
      this.cantidadRepuestosSeleccionadosParaComprar = this.repuestosSeleccionadosParaCompra.length
    }
  }
  obtenerInformacionToken() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.usuario = jwt.jwtDecode(this.token!) as Usuario;
    }
  }
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('repuestoCantidades');
    localStorage.removeItem('repuestosSeleccionadosParaCompra');
    this.router.navigateByUrl('/acceso')
    this._exitoService.mostrarExito('SESIÓN CERRADA, esperamos tenerte de nuevo aquí, nos vemos pronto');
    this._actualizarComponentService.notificarHeader();
    //this.store.dispatch(logout());
  }

  obtenerTodosRepuestos() {
    this._repuestoService.obtenerRepuestos().subscribe({
      next: (value) => {
        this.repuestos = value.results;
        this.repuestos.forEach(repuesto => this.nombresMap.set(repuesto.name!, repuesto));
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    })
  }
  private timer: any;
  onInputChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      if (this.textoBuscar) {
        this.filterRepuestos(this.textoBuscar);
      } else {
        this.repuestos = [];
        this.repuestosFitradosNombre = [];
      }
    }, 400);
  }
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const repuesto = this.repuestosFitradosNombre.find(r => r.name === event.option.value);
    if (repuesto) {
      window.location.href = `/repuesto/${repuesto.code}`;
    }
  }
  public nombresMap = new Map<string, Repuesto>();
  filterRepuestos(value: string) {
    this.repuestos.forEach(repuesto => this.nombresMap.set(repuesto.name!, repuesto));
    const filters: RepuestoFilters = {};
    filters['search'] = this.textoBuscar;
    this._repuestoService.buscarRepuestos(filters).subscribe({
      next: (value) => {
        this.repuestosFitradosNombre = value.results;
        if (this.repuestosFitradosNombre.length === 0) {
          this._repuestoService.obtenerRepuesto(this.textoBuscar).subscribe({
            next: (value) => {
              if (value) {
                this.repuestosFitradosNombre[0] = value;
              }
            }
          });
        }
      },
    })
  }

  @ViewChild('input', { read: MatAutocompleteTrigger }) autoTrigger!: MatAutocompleteTrigger;
  buscar(textoBuscar: string) {
    //this.autoTrigger.closePanel();
    //this.router.navigateByUrl(`/search?s=${textoBuscar}`)
    window.location.href = `/spare-part?search=${this.textoBuscar}`;
  }


  calcularTotal(): number {
    let total = 0.0;
    for (const repuesto of this.repuestosSeleccionadosParaCompra) {
      total += Number(repuesto.price);
    }
    return total;
  }
  borrarRepuestosSeleccionadosParaCompra() {
    localStorage.removeItem('repuestosSeleccionadosParaCompra');
    this.ngOnInit()
    this._actualizarComponentService.notificarDetalleCarrito();
  }

  eliminarDelCarrito(repuesto: Repuesto) {
    let repuestosSeleccionadosParaCompra = [];
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson) {
      repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson);
      const index = repuestosSeleccionadosParaCompra.findIndex((item: Repuesto) => item.code === repuesto.code);
      if (index !== -1) {
        repuestosSeleccionadosParaCompra.splice(index, 1);
        localStorage.setItem('repuestosSeleccionadosParaCompra', JSON.stringify(repuestosSeleccionadosParaCompra));
        this.ngOnInit();
        this._actualizarComponentService.notificarDetalleCarrito();
      }
    }
  }


}

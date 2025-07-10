import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import * as jwt from 'jwt-decode';
import { Usuario } from 'src/app/models/usuario';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { Repuesto } from 'src/app/models/repuesto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

interface RepuestoFilters {
  search?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  public token: string | null = '';
  public usuario: Usuario;
  public textoBuscar: string = '';
  public repuestosFitradosNombre: Repuesto[] = [];
  public repuestosSeleccionadosParaCompra: Repuesto[] = [];
  public cantidadRepuestosSeleccionadosParaComprar: number = 0;
  public isAuthenticated: boolean = false;
  searchForm: FormGroup;
  mostrarBuscador = false;

  private _cantidadRepuestosSubject = new BehaviorSubject<number>(0);
  public cantidadRepuestosSeleccionadosParaComprar$: Observable<number> = this._cantidadRepuestosSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private _errorService: ErrorService,
    private _exitoService: ExitoService,
    private router: Router,
    private _actualizarComponentService: ActualizarComponentService,
    private _repuestoService: RepuestoService
  ) {
    this.usuario = { userName: '', roles: [] };
    this.searchForm = this.fb.group({
      searchText: ['']
    });
    this._actualizarComponentService.actualizarHeader$.subscribe(() => {
      this.obtenerInformacionToken();
      this.loadCarritoFromLocalStorage();
    });
  }

  ngOnInit() {
    this.obtenerInformacionToken();
    this.loadCarritoFromLocalStorage();
  }

  private loadCarritoFromLocalStorage(): void {
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson) {
      try {
        this.repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson);
        this.cantidadRepuestosSeleccionadosParaComprar = this.repuestosSeleccionadosParaCompra.length;
        this._cantidadRepuestosSubject.next(this.cantidadRepuestosSeleccionadosParaComprar);
      } catch (error) {
        console.error('Error al analizar los datos del localStorage:', error);
        this.repuestosSeleccionadosParaCompra = [];
        this.cantidadRepuestosSeleccionadosParaComprar = 0;
        this._cantidadRepuestosSubject.next(0);
      }
    } else {
      this.repuestosSeleccionadosParaCompra = [];
      this.cantidadRepuestosSeleccionadosParaComprar = 0;
      this._cantidadRepuestosSubject.next(0);
    }
  }

  obtenerInformacionToken(): void {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.usuario = jwt.jwtDecode(this.token!) as Usuario;
      this.isAuthenticated = true;
    } else {
      this.usuario = { userName: '', roles: [] };
      this.isAuthenticated = false;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('repuestoCantidades');
    localStorage.removeItem('repuestosSeleccionadosParaCompra');
    this.router.navigateByUrl('/acceso');
    this._exitoService.mostrarExito('SESIÓN CERRADA, esperamos tenerte de nuevo aquí, nos vemos pronto');
    this._actualizarComponentService.notificarHeader();
  }

  private timer: any;
  onInputChange(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      if (this.textoBuscar && this.textoBuscar.length > 2) {
        this.filterRepuestos(this.textoBuscar);
      } else {
        this.repuestosFitradosNombre = [];
      }
    }, 400);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedRepuestoName = event.option.value;
    const repuesto = this.repuestosFitradosNombre.find(r => r.name === selectedRepuestoName);
    if (repuesto) {
      this.router.navigate(['/repuesto', repuesto.code]);
      this.textoBuscar = '';
    }
  }

  private hayRepuestoPorCodigo: Boolean = false;
  filterRepuestos(value: string): void {
    const filters: RepuestoFilters = { search: value };
    this._repuestoService.buscarRepuestos(filters).subscribe({
      next: (res) => {
        this.repuestosFitradosNombre = res.results;
        this.hayRepuestoPorCodigo = false;
        if (this.repuestosFitradosNombre.length === 0) {
          this._repuestoService.obtenerRepuesto(value).subscribe({
            next: (repuesto) => {
              if (repuesto) {
                this.repuestosFitradosNombre = [repuesto];
                this.hayRepuestoPorCodigo = true;
              }
            }
          });
        }
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
        this.repuestosFitradosNombre = [];
      }
    });
  }


  buscar(textoBuscar: string): void {
    if (this.hayRepuestoPorCodigo) {
      this.router.navigate([`/repuesto/${this.repuestosFitradosNombre[0].code}`]);
    } else {
      if (textoBuscar) {
        this.router.navigate(['/spare-part'], { queryParams: { search: textoBuscar } });
        this.textoBuscar = '';
      } else {
        this.router.navigate(['/spare-part']);
      }
    }
  }

  calcularTotal(): number {
    return this.repuestosSeleccionadosParaCompra.reduce((sum, repuesto) => sum + (repuesto.price || 0), 0);
  }

  borrarRepuestosSeleccionadosParaCompra(): void {
    localStorage.removeItem('repuestosSeleccionadosParaCompra');
    this.loadCarritoFromLocalStorage();
    this._actualizarComponentService.notificarDetalleCarrito();
  }

  eliminarDelCarrito(repuesto: Repuesto): void {
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson) {
      let repuestosSeleccionadosParaCompraParsed: Repuesto[] = JSON.parse(repuestosJson);
      const index = repuestosSeleccionadosParaCompraParsed.findIndex(item => item.code === repuesto.code);
      if (index !== -1) {
        repuestosSeleccionadosParaCompraParsed.splice(index, 1);
        localStorage.setItem('repuestosSeleccionadosParaCompra', JSON.stringify(repuestosSeleccionadosParaCompraParsed));
        this.loadCarritoFromLocalStorage();
        this._actualizarComponentService.notificarDetalleCarrito();
      }
    }
  }

}
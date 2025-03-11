import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Repuesto } from 'src/app/models/repuesto';
import { ActualizarComponentService } from 'src/app/services/actualizar.component.service';
import { ErrorService } from 'src/app/services/error.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { environment } from 'src/environment/environment';
interface RepuestoFilters {
  search?: string;
  category?: string;
  brand?: string;
  brandModel?: string;
  modelType?: string;
  modelTypeYear?: string;
}

@Component({
  selector: 'app-catalogo-repuestos',
  templateUrl: './catalogo-repuestos.component.html',
  styleUrls: ['./catalogo-repuestos.component.css']
})
export class CatalogoRepuestosComponent implements OnInit {
  public apiUrl = environment.apiUrl;
  public cantidadRepuestos: number = 0;
  public tamanioPagina: number = 6;
  public repuestos: Repuesto[] = [];
  public repuestosPorPagina: Repuesto[] = []
  public cargando: boolean = true;
  public timer: any;
  public marcas: any[] = [];
  public isAdded: boolean[] = Array(this.repuestosPorPagina.length).fill(false);
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(private _repuestoService: RepuestoService, private route: ActivatedRoute, private router: Router,
    private _actualizarComponentService: ActualizarComponentService, private _errorService: ErrorService) {
  }

  ngOnInit(): void {
    this.obtenerMarcas();
    this.spinnerCargando()
    if (this.route.firstChild) {
      this.route.firstChild.url.subscribe(segments => {
        if (segments.length > 0) {
        } else {
          this.obtenerRepuestos();
        }
        //buscador
      });
      this.volverArriba();
    } else {
      this.obtenerRepuestos();
    }

  }
  obtenerMarcas() {
    this._repuestoService.obtenerMarcas().subscribe({
      next: (value) => {
        this.marcas = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }

  cambiarPagina(event: any) {
    this.spinnerCargando();
    const inicio = event.pageIndex * event.pageSize;
    const fin = inicio + event.pageSize;
    this.repuestosPorPagina = this.repuestos.slice(inicio, fin);
  }
  spinnerCargando() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    if (!this.cargando) {
      this.cargando = true;
      this.volverArriba();
    }
    this.timer = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false
      }
    }, 900)
  }
  volverArriba() {
    const container = document.querySelector('.repuestos') as HTMLElement;
    var posicion = container.offsetTop - 110;
    if (this.route.firstChild) {
      posicion = 0;
    }
    console.log(posicion)
    window.scroll({
      top: posicion,
      left: 0,
      behavior: 'smooth'
    });
  }
  obtenerRepuestos() {
    this._repuestoService.obtenerRepuestos().subscribe({
      next: (value) => {
        this.repuestos = value.results;
        this.cantidadRepuestos = this.repuestos.length;
        this.repuestosPorPagina = this.repuestos.slice(0, this.tamanioPagina);
      },
    });
  }

  agregarAlCarrito(repuesto: Repuesto, index: number) {
    var repuestosSeleccionadosParaCompra: Repuesto[] = [];
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra')
    if (repuestosJson) {
      repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson) as Repuesto[];
    }
    const existeEnCarrito = repuestosSeleccionadosParaCompra.some(
      (r) => r.code === repuesto.code
    );

    if (!existeEnCarrito) {
      repuestosSeleccionadosParaCompra.push(repuesto);
      const promesas = repuestosSeleccionadosParaCompra.map(repuesto => {
        return new Promise<void>((resolve) => {
          this.repuestoCantidades.set(repuesto.code!, 1);
          resolve();
        });
      });

      Promise.all(promesas).then(() => {
        const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
        localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
        localStorage.setItem('repuestosSeleccionadosParaCompra', JSON.stringify(repuestosSeleccionadosParaCompra));
      });
      this._actualizarComponentService.notificarHeader();
      this.isAdded[index] = true;

      setTimeout(() => {
        this.isAdded[index] = false;
      }, 2000);
    }  else {
      this._errorService.msjError("El repuesto ya está en el carrito.")
    }
  }
}
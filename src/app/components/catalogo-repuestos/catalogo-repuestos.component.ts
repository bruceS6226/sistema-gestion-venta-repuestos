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
  public tamanioPagina: number = 8;
  public repuestos: Repuesto[] = [];
  public repuestosPorPagina: Repuesto[] = [];
  public cargando: boolean = true;
  public timer: any;
  public marcas: any[] = [];
  public isAdded: boolean[] = []; // Inicializado como array vacío, se llenará después de cargar repuestos
  public isAddingToCart: boolean[] = []; // NUEVO: Para controlar el estado de carga del botón
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(
    private _repuestoService: RepuestoService,
    private route: ActivatedRoute,
    private router: Router,
    private _actualizarComponentService: ActualizarComponentService,
    private _errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.obtenerMarcas();
    this.spinnerCargando(false);
    if (this.route.firstChild) {
      this.route.firstChild.url.subscribe(segments => {
        if (segments.length > 0) {
        } else {
          this.obtenerRepuestos();
        }
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
    });
  }

  cambiarPagina(event: any) {
    this.spinnerCargando(true);
    const inicio = event.pageIndex * event.pageSize;
    const fin = inicio + event.pageSize;
    this.repuestosPorPagina = this.repuestos.slice(inicio, fin);
    // Reiniciar los estados de isAdded y isAddingToCart para la nueva página
    this.isAdded = Array(this.repuestosPorPagina.length).fill(false);
    this.isAddingToCart = Array(this.repuestosPorPagina.length).fill(false);
  }

spinnerCargando(shouldScroll: boolean = false) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (!this.cargando) {
      this.cargando = true;
    }
    this.timer = setTimeout(() => {
      this.cargando = false;
      if (shouldScroll) {
        
        this.volverArriba();
      }
    }, 900); 
  }

  volverArriba() {
    const container = document.querySelector('.card') as HTMLElement;
    let posicion =  container.offsetTop + 110;
    

    console.log("Scroll a posición:", posicion);
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

        // Inicializar isAdded y isAddingToCart después de que los repuestos se hayan cargado
        this.isAdded = Array(this.repuestosPorPagina.length).fill(false);
        this.isAddingToCart = Array(this.repuestosPorPagina.length).fill(false);
      },
      error: (err) => {
        this._errorService.msjError(err);
        this.cargando = false; // Asegurarse de que el spinner se oculte en caso de error
      }
    });
  }

  agregarAlCarrito(repuesto: Repuesto, index: number) {
    if (this.isAdded[index] || this.isAddingToCart[index]) {
      return;
    }

    this.isAddingToCart[index] = true;

    var repuestosSeleccionadosParaCompra: Repuesto[] = [];
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');

    if (repuestosJson) {
      repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson) as Repuesto[];
    }

    const existeEnCarrito = repuestosSeleccionadosParaCompra.some(
      (r) => r.code === repuesto.code
    );

    if (!existeEnCarrito) {
      repuestosSeleccionadosParaCompra.push(repuesto);

      const promesas = repuestosSeleccionadosParaCompra.map(item => { // Cambiado 'repuesto' a 'item' para evitar conflicto de nombres
        return new Promise<void>((resolve) => {
          // Asegúrate de que repuesto.code no sea undefined
          if (item.code) {
            this.repuestoCantidades.set(item.code, 1);
          }
          resolve();
        });
      });

      Promise.all(promesas).then(() => {
        const repuestoCantidadesArray = Array.from(this.repuestoCantidades.entries());
        localStorage.setItem('repuestoCantidades', JSON.stringify(repuestoCantidadesArray));
        localStorage.setItem('repuestosSeleccionadosParaCompra', JSON.stringify(repuestosSeleccionadosParaCompra));
        this._actualizarComponentService.notificarHeader();

        // 3. Marcar como añadido y ocultar spinner
        this.isAdded[index] = true;
        this.isAddingToCart[index] = false;

        // 4. Resetear el estado 'isAdded' después de un tiempo
        setTimeout(() => {
          this.isAdded[index] = false;
        }, 2000); // El botón vuelve a su estado original después de 2 segundos
      }).catch(error => {
        // Manejar errores si la promesa falla
        console.error("Error al guardar en localStorage:", error);
        this._errorService.msjError("Error al agregar el repuesto al carrito.");
        this.isAddingToCart[index] = false; // Ocultar spinner en caso de error
      });
    } else {
      // Si ya existe en el carrito
      this._errorService.msjError("El repuesto ya está en el carrito.");
      this.isAddingToCart[index] = false; // Ocultar spinner inmediatamente si ya está en el carrito
    }
  }
}
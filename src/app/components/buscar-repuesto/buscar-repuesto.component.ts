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
  selector: 'app-buscar-repuesto',
  templateUrl: './buscar-repuesto.component.html',
  styleUrls: ['./buscar-repuesto.component.css']
})
export class BuscarRepuestoComponent implements OnInit {
  public apiUrl = environment.apiUrl;
  public cantidadRepuestos: number = 0;
  public tamanioPagina: number = 12;
  public repuestos: Repuesto[] = [];
  public repuestosPorPagina: Repuesto[] = [];
  public cargando: boolean = true;
  public timer: any;

  public textoBuscar: string = '';

  public categorias: any[] = [];
  public marcas: any[] = [];
  public modelos: any[] = [];
  public tipos: any[] = [];
  public anios: any[] = [];

  public selectedCategory: string = '';
  public selectedBrand: string = '';
  public selectedModel: string = '';
  public selectedModelType: string = '';
  public selectedYear: string = '';

  public isAdded: boolean[] = [];
  public isAddingToCart: boolean[] = [];
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(
    private _repuestoService: RepuestoService,
    private route: ActivatedRoute,
    private router: Router,
    private _errorService: ErrorService,
    private _actualizarComponentService: ActualizarComponentService
  ) {
    this._actualizarComponentService.actualizarSearch$.subscribe({
      next: () => {
        this.resetAndLoadFilters();
      },
    });
  }

  ngOnInit(): void {
    this.obtenerCategorias();
    this.obtenerMarcas();

    this.route.queryParams.subscribe(params => {
      this.spinnerCargando(true);

      let filters: RepuestoFilters = {};

      if (params['search']) {
        filters['search'] = params['search'];
        this.textoBuscar = params['search'];
      }
      if (params['category']) {
        filters['category'] = params['category'];
        this.selectedCategory = params['category'];
      } else {
        this.selectedCategory = '';
      }
      if (params['brand']) {
        filters['brand'] = params['brand'];
        this.selectedBrand = params['brand'];
        if (this.modelos.length === 0 || this.selectedBrand !== (this.marcas.find(m => m.name === this.selectedBrand)?.name || '')) {
          this.obtenerModelos(this.selectedBrand);
        }
      } else {
        this.selectedBrand = '';
        this.modelos = [];
      }
      if (params['brandModel']) {
        filters['brandModel'] = params['brandModel'];
        this.selectedModel = params['brandModel'];
        if (this.tipos.length === 0 || this.selectedModel !== (this.modelos.find(mod => mod.name === this.selectedModel)?.name || '')) {
          this.obtenerTipos(this.selectedModel);
        }
      } else {
        this.selectedModel = '';
        this.tipos = [];
      }
      if (params['modelType']) {
        filters['modelType'] = params['modelType'];
        this.selectedModelType = params['modelType'];
        if (this.anios.length === 0) {
          this.loadHardcodedYears();
        }
      } else {
        this.selectedModelType = '';
        this.anios = [];
      }
      if (params['modelTypeYear']) {
        filters['modelTypeYear'] = params['modelTypeYear'];
        this.selectedYear = params['modelTypeYear'];
      } else {
        this.selectedYear = '';
      }

      this.buscarRepuestos(filters);
    });
  }

  cambiarPagina(event: any) {
    this.spinnerCargando(true);

    const inicio = event.pageIndex * event.pageSize;
    const fin = inicio + event.pageSize;
    this.repuestosPorPagina = this.repuestos.slice(inicio, fin);

    this.initializeButtonStates();

    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.cargando = false;
    }, 300);
  }

  spinnerCargando(shouldScroll: boolean = false) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.cargando = true;

    if (shouldScroll) {
      setTimeout(() => {
        this.volverArriba();
      }, 50);
    }
  }

  volverArriba() {
    const container = document.querySelector('.results-section') as HTMLElement;
    let posicion = 0;

    if (container) {
      posicion = container.offsetTop - 110;
    } else {
      posicion = 0;
    }

    window.scroll({
      top: posicion,
      left: 0,
      behavior: 'smooth'
    });
  }

  buscarRepuestos(filters: RepuestoFilters) {
    this._repuestoService.buscarRepuestos(filters).subscribe({
      next: (value) => {
        this.repuestos = value.results;
        this.cantidadRepuestos = this.repuestos.length;
        this.repuestosPorPagina = this.repuestos.slice(0, this.tamanioPagina);

        this.initializeButtonStates();

        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.cargando = false;
        }, 900);
      },
      error: (err) => {
        this._errorService.msjError(err);
        this.cargando = false;
      }
    });
  }

  retornar(): void {
    window.history.back();
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

  obtenerCategorias() {
    this._repuestoService.obtenerCategorias().subscribe({
      next: (value) => {
        this.categorias = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    });
  }

  obtenerModelos(marca: string) {
    this._repuestoService.obtenerModelos(marca).subscribe({
      next: (value) => {
        this.modelos = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    });
  }

  obtenerTipos(modelo: string) {
    this._repuestoService.obtenerTipos(modelo).subscribe({
      next: (value) => {
        this.tipos = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    });
  }

  private loadHardcodedYears(): void {
    this.anios = [
      "2015", "2016", "2017", "2018", "2019", "2020",
      "2021", "2022", "2023", "2024", "2025"
    ];
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  cambiarCategoria(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };
    if (selectedValue) {
      queryParams['category'] = selectedValue;
    } else {
      delete queryParams['category'];
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  cambiarMarca(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };

    delete queryParams['brandModel'];
    delete queryParams['modelType'];
    delete queryParams['modelTypeYear'];
    this.selectedModel = '';
    this.selectedModelType = '';
    this.selectedYear = '';
    this.modelos = [];
    this.tipos = [];
    this.anios = [];

    if (selectedValue) {
      queryParams['brand'] = selectedValue;
      this.obtenerModelos(selectedValue);
    } else {
      delete queryParams['brand'];
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  cambiarModelo(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };

    delete queryParams['modelType'];
    delete queryParams['modelTypeYear'];
    this.selectedModelType = '';
    this.selectedYear = '';
    this.tipos = [];
    this.anios = [];

    if (selectedValue) {
      queryParams['brandModel'] = selectedValue;
      this.obtenerTipos(selectedValue);
    } else {
      delete queryParams['brandModel'];
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  cambiarTipo(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };
    delete queryParams['modelTypeYear'];

    if (selectedValue) {
      queryParams['modelType'] = selectedValue;
      this.loadHardcodedYears();
    } else {
      delete queryParams['modelType'];
      this.anios = [];
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  cambiarAnio(anio: any): void {
    const year = Number(anio);

    if (isNaN(year)) {
      return;
    }
    if (year <= 1900 || year >= 2026) {
      return;
    }

    let queryParams = { ...this.route.snapshot.queryParams };
    if (year) {
      queryParams['modelTypeYear'] = year;
    } else {
      delete queryParams['modelTypeYear'];
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }



  private resetAndLoadFilters(): void {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.selectedModel = '';
    this.selectedModelType = '';
    this.selectedYear = '';
    this.modelos = [];
    this.tipos = [];
    this.anios = [];
    this.router.navigate(['/spare-part'], { queryParams: {} });
  }

  private initializeButtonStates(): void {
    this.isAdded = Array(this.repuestosPorPagina.length).fill(false);
    this.isAddingToCart = Array(this.repuestosPorPagina.length).fill(false);

    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');
    if (repuestosJson) {
      const repuestosEnCarrito: Repuesto[] = JSON.parse(repuestosJson);
      this.repuestosPorPagina.forEach((repuesto, index) => {
        if (repuestosEnCarrito.some(r => r.code === repuesto.code)) {
          this.isAdded[index] = true;
        }
      });
    }
  }

  agregarAlCarrito(repuesto: Repuesto, index: number) {
    if (this.isAdded[index] || this.isAddingToCart[index]) return;

    this.isAddingToCart[index] = true;
    let repuestosSeleccionadosParaCompra: Repuesto[] = [];
    const repuestosJson = localStorage.getItem('repuestosSeleccionadosParaCompra');

    if (repuestosJson) repuestosSeleccionadosParaCompra = JSON.parse(repuestosJson) as Repuesto[];

    const existeEnCarrito = repuestosSeleccionadosParaCompra.some(
      (r) => r.code === repuesto.code
    );

    if (!existeEnCarrito) {
      repuestosSeleccionadosParaCompra.push(repuesto);
      const promesas = repuestosSeleccionadosParaCompra.map(item => {
        return new Promise<void>((resolve) => {
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

        this.isAdded[index] = true;
        this.isAddingToCart[index] = false;

      }).catch(error => {
        console.error("Error al guardar en localStorage:", error);
        this._errorService.msjError("Error al agregar el repuesto al carrito.");
        this.isAddingToCart[index] = false;
      });
    } else {
      this._errorService.msjError("El repuesto ya está en el carrito.");
      this.isAddingToCart[index] = false;
    }
  }
}


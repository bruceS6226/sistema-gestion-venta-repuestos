import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Marca } from 'src/app/models/marca';
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
  public tamanioPagina: number = 6;
  public repuestos: Repuesto[] = [];
  public repuestosPorPagina: Repuesto[] = []
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
  public isAdded: boolean[] = Array(this.repuestosPorPagina.length).fill(false);
  public repuestoCantidades: Map<string, number> = new Map<string, number>();

  constructor(private _repuestoService: RepuestoService, private route: ActivatedRoute, private router: Router,
    private _errorService: ErrorService, private _actualizarComponentService: ActualizarComponentService) {
    this._actualizarComponentService.actualizarSearch$.subscribe({
      next: () => {
        this.ngOnInit()
      },
    })
  }
  ngOnInit(): void {
    this.obtenerCategorias();
    this.obtenerMarcas();
    this.spinnerCargando();
    this.route.queryParams.subscribe(params => {
      let filters: RepuestoFilters = {};
      if (params['search']) {
        filters['search'] = params['search'];
      }
      if (params['category']) {
        filters['category'] = params['category'];
        this.selectedCategory = params['category'];
      }
      if (params['brand']) {
        filters['brand'] = params['brand'];
        this.selectedBrand = params['brand'];
        if (this.modelos.length === 0) {
          this.obtenerModelos(this.selectedBrand);
        }
      }
      if (params['brandModel']) {
        filters['brandModel'] = params['brandModel'];
        this.selectedModel = params['brandModel'];
        if (this.tipos.length === 0) {
          this.obtenerTipos(this.selectedModel);
        }
      }
      if (params['modelType']) {
        filters['modelType'] = params['modelType'];
        this.selectedModelType = params['modelType'];
        if (this.anios.length === 0) {
          this.anios = [
            "2015",
            "2016",
            "2017",
            "2018",
            "2019",
            "2020",
            "2021",
            "2022",
            "2023",
            "2024",
          ];
        }
      }
      if (params['modelTypeYear']) {
        filters['modelTypeYear'] = params['modelTypeYear'];
        this.selectedYear = params['modelTypeYear'];
      }
      this.buscarRepuestos(filters);
    });

    this.volverArriba();
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
    const container = document.querySelector('.container') as HTMLElement;
    var posicion = container.offsetTop - 78;
    if (this.route.firstChild) {
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
        console.log(this.repuestos)
        this.cantidadRepuestos = this.repuestos.length;
        this.repuestosPorPagina = this.repuestos.slice(0, this.tamanioPagina);
      },
    })
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
    })
  }

  obtenerCategorias() {
    this._repuestoService.obtenerCategorias().subscribe({
      next: (value) => {
        this.categorias = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }

  obtenerModelos(marca: string) {
    this._repuestoService.obtenerModelos(marca).subscribe({
      next: (value) => {
        this.modelos = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }
  obtenerTipos(modelo: string) {
    this._repuestoService.obtenerTipos(modelo).subscribe({
      next: (value) => {
        this.tipos = value;
      },
      error: (err) => {
        this._errorService.msjError(err);
      }
    })
  }
  cambiarCategoria(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };
    if (selectedValue) {
      queryParams['category'] = selectedValue;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      });

    } else {
      delete queryParams['category'];
      this.router.navigate(['/spare-part'], {
        queryParams: queryParams
      });
    }
  }
  cambiarMarca(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };
    delete queryParams['brandModel'];
    delete queryParams['modelType'];
    delete queryParams['modelTypeYear'];
    this.modelos = [];
    this.tipos = [];
    this.anios = [];
    if (selectedValue) {
      queryParams['brand'] = selectedValue;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
      });
      this.obtenerModelos(selectedValue);
    } else {
      delete queryParams['brand'];
      this.router.navigate(['/spare-part'], {
        queryParams: queryParams
      });
    }
  }
  cambiarModelo(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };
    delete queryParams['modelType'];
    delete queryParams['modelTypeYear'];
    this.tipos = [];
    this.anios = [];
    if (selectedValue) {
      queryParams['brandModel'] = selectedValue;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
      });
      this.obtenerTipos(selectedValue);
    } else {
      delete queryParams['brandModel'];
      this.router.navigate(['/spare-part'], {
        queryParams: queryParams
      });
    }
  }
  cambiarTipo(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };
    if (selectedValue) {
      queryParams['modelType'] = selectedValue;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      });
      this.anios = [
        "2015",
        "2016",
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
      ]
    } else {
      delete queryParams['modelType'];
      this.router.navigate(['/spare-part'], {
        queryParams: queryParams
      });
      this.anios = []
    }
  }
  cambiarAnio(event: any) {
    const selectedValue = event.target.value;
    let queryParams = { ...this.route.snapshot.queryParams };
    if (selectedValue) {
      queryParams['modelTypeYear'] = selectedValue;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge'
      });
    } else {
      delete queryParams['modelTypeYear'];
      this.router.navigate(['/spare-part'], {
        queryParams: queryParams
      });
    }
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
        this._actualizarComponentService.notificarHeader();
        this.isAdded[index] = true;
      });
      setTimeout(() => {
        this.isAdded[index] = false;
      }, 2000);
    }  else { this._errorService.msjError("El repuesto ya está en el carrito.")}
  }
}


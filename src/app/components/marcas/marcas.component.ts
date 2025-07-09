import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { Marca, Modelo, Tipo } from 'src/app/models/marca';
import { MarcaService } from 'src/app/services/marca.service';
import { ErrorService } from 'src/app/services/error.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarComponent } from 'src/app/dialogs/confirmar/confirmar.component';
import { ExitoService } from 'src/app/services/exito.service';
import { DialogoAgregarModeloComponent } from './dialogo-agregar-modelo/dialogo-agregar-modelo.component';
import { DialogoAgregarTipoComponent } from './dialogo-agregar-tipo/dialogo-agregar-tipo.component';

interface TreeNode {
  _id: string;
  name: string;
  children?: TreeNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  _id: string;
  name: string;
  level: number;
}

/**
 * @title Tree with flat nodes
 */
@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css'],
})
export class MarcasComponent implements OnInit {

  public nodoSeleccionado: number | null = null;
  public marca: Marca = new Marca({});
  public modelo: Modelo = new Modelo({});
  public tipo: Tipo = new Tipo({});

  private _transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      _id: node._id,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private _marcaService: MarcaService, private _errorService: ErrorService, private dialog: MatDialog,
    private _exitoService: ExitoService) {
    this.marca = new Marca({});
  }

  ngOnInit() {
    this.obtenerMarcasConModelosYTipos();
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  obtenerMarcasConModelosYTipos() {
    this._marcaService.obtenerMarcas().subscribe({
      next: (marcas: Marca[]) => {
        const marcasNodes: TreeNode[] = [];

        // Cargar modelos y tipos para cada marca
        const marcaRequests = marcas.map((marca) => {
          const marcaNode: TreeNode = {
            _id: marca._id!,
            name: marca.name!,
            children: [],
          };
          marcasNodes.push(marcaNode);

          // Obtener modelos para cada marca
          return this._marcaService.obtenerModelos(marca.name!).toPromise().then((modelos: Modelo[]) => {
            const modeloRequests = modelos.map((modelo) => {
              const modeloNode: TreeNode = {
                _id: modelo._id!,
                name: modelo.name!,
                children: [],
              };
              marcaNode.children!.push(modeloNode);

              // Obtener tipos para cada modelo
              return this._marcaService.obtenerTipos(modelo.name!).toPromise().then((tipos: Tipo[]) => {
                console.log(tipos)
                modeloNode.children = tipos.map((tipo) => ({
                  _id: tipo._id!,
                  name: tipo.name!,
                }));
              });
            });

            return Promise.all(modeloRequests);
          });
        });

        Promise.all(marcaRequests).then(() => {
          this.dataSource.data = marcasNodes;
        });
      },
      error: (err) => this._errorService.msjError(err),
    });
  }

alAbrirMenu(level: number, _id: string, name: string, event?: any) {
  this.nodoSeleccionado = level;

  if (level === 0) {
    this._marcaService.obtenerMarca(_id).subscribe({
      next: (value) => {
        this.marca = value;
        this.modelo = new Modelo({});
        this.tipo = new Tipo({});
      },
      error: (err) => this._errorService.msjError(err)
    });
  } else if (level === 1) {
    this.modelo = new Modelo({ _id, name });
    this.tipo = new Tipo({});
    this.marca.name = this.getParentNodeName(this.treeControl.dataNodes.find(n => n._id === _id)!);
  } else if (level === 2) {
    this.tipo = new Tipo({ _id, name });
    this.modelo.name = this.getParentNodeName(this.treeControl.dataNodes.find(n => n._id === _id)!);
  }
}

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  isMobile = false;

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  abrirDialogoEliminar(_id: string, nombre: string, level: number) {
    let titulo: string;
    const contenido = 'Esta acción no será reversible. Si tiene repuestos asociados no se podrá eliminar.';

    // Cambiar el título según el nivel
    switch (level) {
      case 0:
        titulo = `¿Está seguro de que desea eliminar la marca ${nombre}?`;
        break;
      case 1:
        titulo = `¿Está seguro de que desea eliminar el modelo ${nombre}?`;
        break;
      case 2:
        titulo = `¿Está seguro de que desea eliminar el tipo ${nombre}?`;
        break;
      default:
        titulo = `¿Está seguro de que desea eliminar ${nombre}?`;
        break;
    }

    const dialogRef = this.dialog.open(ConfirmarComponent, {
      data: { titulo, contenido },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Llamada al servicio dependiendo del nivel
        switch (level) {
          case 0:
            this._marcaService.eliminarMarca(_id).subscribe({
              next: () => {
                this._exitoService.mostrarExito();
                this.obtenerMarcasConModelosYTipos();
              },
              error: (err) => {
                this._errorService.msjError(err);
              }
            });
            break;
          case 1:
            this._marcaService.eliminarModelo(_id).subscribe({
              next: () => {
                this._exitoService.mostrarExito();
                this.obtenerMarcasConModelosYTipos();
              },
              error: (err) => {
                this._errorService.msjError(err);
              }
            });
            break;
          case 2:
            this._marcaService.eliminarTipo(_id).subscribe({
              next: () => {
                this._exitoService.mostrarExito();
                this.obtenerMarcasConModelosYTipos();
              },
              error: (err) => {
                this._errorService.msjError(err);
              }
            });
            break;
          default:
            // Si no se maneja el nivel por defecto
            break;
        }
      }
    });
  }


  abrirDialogoAgregarModelo(marcaId: string, marcaName: string): void {
    const dialogRef = this.dialog.open(DialogoAgregarModeloComponent, {
      width: '500px',
      data: { marcaId, marcaName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerMarcasConModelosYTipos();
      }
    });
  }

  abrirDialogoAgregarTipo(modelId: string, modeloName: string, tipo?: any): void {
    const dialogRef = this.dialog.open(DialogoAgregarTipoComponent, {
      width: '500px',
      data: { modelId, modeloName, tipo }  // tipo es opcional
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerMarcasConModelosYTipos();
      }
    });
  }

  abrirDialogoEditarTipo(modelId: string, modeloName: string, tipoId?: string): void {
    console.log(modeloName)
    const dialogRef = this.dialog.open(DialogoAgregarTipoComponent, {
      width: '500px',
      data: { modelId, modeloName, tipoId }  // tipo es opcional
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerMarcasConModelosYTipos();
      }
    });
  }
abrirDialogoEditarModelo(marcaId: string, marcaName: string, modelId: string) {
  const dialogRef = this.dialog.open(DialogoAgregarModeloComponent, {
    width: '500px',
    data: { marcaId, marcaName, modelId }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
        this.obtenerMarcasConModelosYTipos();
    }
  });
}
  getParentNodeName(node: ExampleFlatNode): string {
    if (node.level === 0) {
      return 'Raíz';
    }

    const nodeIndex = this.treeControl.dataNodes.indexOf(node);

    if (nodeIndex <= 0) return 'Desconocido';

    for (let i = nodeIndex - 1; i >= 0; i--) {
      const potentialParent = this.treeControl.dataNodes[i];
      if (potentialParent.level < node.level) {
        return potentialParent.name;
      }
    }

    return 'Desconocido';
  }

}

import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { Marca, Modelo, Tipo } from 'src/app/models/marca';
import { MarcaService } from 'src/app/services/marca.service';
import { ErrorService } from 'src/app/services/error.service';

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
  public marca: Marca;

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

  constructor(private _marcaService: MarcaService, private _errorService: ErrorService) {
    this.marca = new Marca({});
  }

  ngOnInit() {
    this.obtenerMarcasConModelosYTipos();
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
                _id: marca._id!,
                name: modelo.name!,
                children: [],
              };
              marcaNode.children!.push(modeloNode);
              console.log("Modelos:", modelos)

              // Obtener tipos para cada modelo
              return this._marcaService.obtenerTipos(modelo.name!).toPromise().then((tipos: Tipo[]) => {
                modeloNode.children = tipos.map((tipo) => ({
                  _id: marca._id!,
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

  alAbrirMenu(level: number, _id: string) {
    this.nodoSeleccionado = level;
    this._marcaService.obtenerMarca(_id).subscribe({
      next: (value) => {
        if (value) {
          this.marca = value;
        }
      },
      error: (err) => this._errorService.msjError(err),
    })
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}

import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Repuesto } from 'src/app/models/repuesto';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { firstValueFrom } from 'rxjs';
import { CategoriaService } from 'src/app/services/categoria.service';
import { Categoria } from 'src/app/models/categoria';

@Component({
  selector: 'app-create-categoria',
  templateUrl: './create-categoria.component.html',
  styleUrls: ['./create-categoria.component.css']
})
export class CreateCategoriaComponent implements OnInit {
  public categoria: Categoria;
  public _id: string = '0';
  public buttonName: string = 'REGISTRAR';
  public existeName: boolean = false;
  public isID: boolean = false;
  public titulo: string = 'NUEVA CATEGORÍA';

  constructor(private fb: FormBuilder, private _errorService: ErrorService, private route: ActivatedRoute,
    private _categoriaService: CategoriaService, private _exitoService: ExitoService, private router: Router) {
    this.categoria = new Categoria({});
    this.route.params.subscribe(params => this._id = params['_id'])
  }

  ngOnInit(): void {
    if (this._id !== undefined) {
      this.isID = true;
      this.buttonName = 'ACTUALIZAR';
      this.titulo = 'EDICION DE LA CATEGORÍA';
      this._categoriaService.obtenerCategoria(this._id!).subscribe({
        next: (value) => {
          if (value) {
            this.categoria = value;
          }
        },
        error: (err) => {
          this.existeName = false;
        }
      });
    }
  }
  onSubmit(form: NgForm) {
    if (this.mostrarMensajeErrorCamposVacios(form)) {
      this.categoria.title = this.categoria.name;
      if (this._id) {
        const _id = this.categoria._id;
        delete this.categoria._id;
        console.log(this.categoria);
        this._categoriaService.actualizarCategoria(_id!, this.categoria).subscribe({
          next: () => {
            this._exitoService.mostrarExito();
            this.router.navigate(['/dashboard'], { fragment: 'categorias' });
          },
          error: (err) => {
            this._errorService.msjError(err);
          },
        });
      } else {
          this._categoriaService.crearCategoria(this.categoria).subscribe({
            next: () => {
              this._exitoService.mostrarExito();
              this.router.navigate(['/dashboard'], { fragment: 'categorias' });
            },
            error: (err) => {
              this._errorService.msjError(err);
            },
          })
      }
    }
  }

  mostrarMensajeErrorCamposVacios(form: NgForm) {
    for (const controlName in form.controls) {
      if (form.controls.hasOwnProperty(controlName)) {
        const control = form.controls[controlName];
        if (control.invalid || control.errors?.['required'] || control.value === 0 || control.value === "") {
          const inputElement = document.getElementById(controlName);
          var placeholder = inputElement?.getAttribute('placeholder');
          if (control.value === 0) {
            const inputElement = document.querySelector(`label[for="${controlName}"]`);
            placeholder = inputElement?.textContent;
          }
          return this._errorService.msjError(`El campo "${placeholder}" está vacío o es incorrecto`);
        }
      }
    }
    return true;
  }

  private temporizador: any = null;
  comprobarNombre() {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this._categoriaService.obtenerCategoria(this.categoria._id!).subscribe({
        next: (value) => {
          if (value) {
            this.existeName = true;
          }
        },
        error: (err) => {
          this.existeName = false;
        }
      });
    }, 800);
  }

  retornar(): void {
    window.history.back();
  }
}
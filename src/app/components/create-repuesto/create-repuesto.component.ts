import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Repuesto } from 'src/app/models/repuesto';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-repuesto',
  templateUrl: './create-repuesto.component.html',
  styleUrls: ['./create-repuesto.component.css']
})
export class CreateRepuestoComponent implements OnInit {
  private repuestoForm: FormGroup = this.fb.group({
    images: this.fb.array([this.createImageGroup()])
  });
  public repuesto: Repuesto;
  public code: string = '0';
  public buttonName: string = 'REGISTRAR';
  public existeCode: boolean = false;
  public isCode: boolean = false;
  public imagenes: string[] = [];
  public titulo: string = 'NUEVO REPUESTO';
  public marcas: any[] = [];
  public modelos: any[] = [];
  public tipos: any[] = [];

  constructor(private fb: FormBuilder, private _errorService: ErrorService, private route: ActivatedRoute,
    private _repuestoService: RepuestoService, private _exitoService: ExitoService, private router: Router) {
    this.repuesto = new Repuesto({});
    this.route.params.subscribe(params => this.code = params['code'])
  }

  ngOnInit(): void {
    this.obtenerMarcas();
    if (this.code !== undefined) {
      this.isCode = true;
      this.buttonName = 'ACTUALIZAR';
      this.titulo = 'EDICION DEL REPUESTO';
      this._repuestoService.obtenerRepuesto(this.code!).subscribe({
        next: (value) => {
          if (value) {
            this.repuesto = value;
            this.obtenerModelos(this.repuesto.brand!);
            this.obtenerTipos(this.repuesto.brandModel!);
            if (this.repuesto.images) {
              this.imagenes = this.repuesto.images;
              this.imagenes.forEach(url => {
                this.images.push(this.createImageGroup(null, url));
              });
            }
          }
        },
        error: (err) => {
          this.existeCode = false;
        }
      });
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
  cambiarMarca(event: any){
    const selectedValue = event.target.value;
    this.obtenerModelos(selectedValue);
  }
  cambiarModelo(event: any){
    const selectedValue = event.target.value;
    this.obtenerTipos(selectedValue);
  }
  async onSubmit(form: NgForm) {
    if (this.mostrarMensajeErrorCamposVacios(form)) {
      if (this.code) {
        const _id = this.repuesto._id;
        delete this.repuesto._id;
        delete this.repuesto.code;
        delete this.repuesto.createdAt;
        delete this.repuesto.updatedAt;
        delete this.repuesto.createdBy;
        console.log(this.repuesto);
        this._repuestoService.actualizarRepuesto(_id!, this.repuesto).subscribe({
          next: () => {
            this._exitoService.mostrarExito();
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this._errorService.msjError(err);
          },
        });
      } else {
        try {
          const imagenPromises = this.images.controls.map((control, index) => {
            const file = control.get('file')!.value;
            if (file) {
              const formData: FormData = new FormData();
              const filename = file.name;
              formData.append('file', file, filename);
              return firstValueFrom(this._repuestoService.agregarImagen(formData));
            }
            return null;
          }).filter(promise => promise !== null);
  
          const resultados = await Promise.all(imagenPromises);
  
          this.imagenes = resultados.map(result => result.fileUrl);
          this.repuesto.images = this.imagenes;
  
          const respuesta = await firstValueFrom(this._repuestoService.crearRepuesto(this.repuesto));
          this.router.navigate(['/dashboard']);
          this._exitoService.mostrarExito(respuesta);
        } catch (err: any) {
          this._errorService.msjError(err);
          console.log(err);
        }
      }
    }
  }
  
  mostrarMensajeErrorCamposVacios(form: NgForm) {
    for (const controlName in form.controls) {
      if (form.controls.hasOwnProperty(controlName)) {
        const control = form.controls[controlName];
        if (control.invalid || control.errors?.['required'] || control.value === 0 || control.value === "") {
          return this._errorService.msjError(`El campo "${controlName}" está vacío o es incorrecto`);
        }
      }
    }
    return true;
  }

  private temporizador: any = null;
  comprobarCodigo() {
    if (!this.code) {
      clearTimeout(this.temporizador);
      this.temporizador = setTimeout(() => {
        this._repuestoService.obtenerRepuesto(this.repuesto.code!).subscribe({
          next: (value) => {
            if (value) {
              this.existeCode = true;
            }
          },
          error: (err) => {
            this.existeCode = false;
          }
        });
      }, 800);

    }
  }
  get images(): FormArray {
    return this.repuestoForm.get('images') as FormArray;
  }
  addImage(): void {
    if (this.images.length < 5) {
      this.images.push(this.createImageGroup());
    }
  }
  createImageGroup(file: File | null = null, previewUrl: string = ''): FormGroup {
    return this.fb.group({
      file: [file, Validators.required],
      previewUrl: [previewUrl]
    });
  }
  removeImage(index: number): void {
    if (this.images.length > 1) {
      this.images.removeAt(index);
    }
  }

  onFileChange(event: Event, index: number): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.images.at(index).get('previewUrl')!.setValue(e.target.result);
      };
      reader.readAsDataURL(file);
      this.images.at(index).get('file')!.setValue(file);
    }
  }
  allImagesSelected(): boolean {
    return this.images.controls.every(control => control.get('file')!.value !== null);
  }

  retornar(): void {
    window.history.back();
  }
}

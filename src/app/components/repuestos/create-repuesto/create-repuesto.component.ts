import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Repuesto } from 'src/app/models/repuesto';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { firstValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-create-repuesto',
  templateUrl: './create-repuesto.component.html',
  styleUrls: ['./create-repuesto.component.css']
})
export class CreateRepuestoComponent implements OnInit, OnDestroy {

  public repuesto: Repuesto;
  public code: string = '0'; // Valor por defecto para creación
  public buttonName: string = 'REGISTRAR';
  public existeCode: boolean = false;
  public isCode: boolean = false; // <-- Inicializar a false por defecto
  public imagenes: string[] = [];
  public titulo: string = 'NUEVO REPUESTO';
  public categorias: any[] = [];
  public marcas: any[] = [];
  public modelos: any[] = [];
  public tipos: any[] = [];

  stepperOrientation: StepperOrientation = 'horizontal';
  private unsubscribe$ = new Subject<void>();
  isLoading: boolean = false;

  images: FormArray;

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  constructor(
    private fb: FormBuilder,
    private _errorService: ErrorService,
    private route: ActivatedRoute,
    private _repuestoService: RepuestoService,
    private _exitoService: ExitoService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.repuesto = new Repuesto({});
    this.images = this.fb.array([]);
    this.route.params.subscribe(params => {
      this.code = params['code'] || '0';
      this.isCode = (this.code !== '0');
    });
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        if (result.matches) {
          this.stepperOrientation = 'vertical';
        } else {
          this.stepperOrientation = 'horizontal';
        }
      });
  }

  ngOnInit(): void {
    this.obtenerCategorias();
    this.obtenerMarcas();

    if (this.isCode) {
      this.buttonName = 'ACTUALIZAR';
      this.titulo = 'EDICION DEL REPUESTO';
      this._repuestoService.obtenerRepuesto(this.code!).subscribe({
        next: (value) => {
          if (value) {
            this.repuesto = value;
            this.obtenerModelos(this.repuesto.brand!);
            this.obtenerTipos(this.repuesto.brandModel!);

            // Limpiar y poblar imágenes solo si estamos editando
            while (this.images.length !== 0) {
              this.images.removeAt(0);
            }

            if (this.repuesto.images && this.repuesto.images.length > 0) {
              this.repuesto.images.forEach(url => {
                this.images.push(this.createImageGroup(null, url));
              });
            } else {
              this.addImage(); // Si el repuesto no tiene imágenes, añadir un campo vacío
            }
          }
        },
        error: (err) => {
          this.existeCode = false;
          this._errorService.msjError(err);
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      this.buttonName = 'REGISTRAR';
      this.titulo = 'NUEVO REPUESTO';
      if (this.images.length === 0) {
        this.addImage();
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  cambiarMarca(event: any) {
    const selectedValue = event.target.value;
    this.obtenerModelos(selectedValue);
    this.repuesto.brandModel = ""; // Limpiar modelo al cambiar marca
    this.repuesto.modelType = "";  // Limpiar tipo al cambiar marca
  }
  cambiarModelo(event: any) {
    const selectedValue = event.target.value;
    this.obtenerTipos(selectedValue);
    this.repuesto.modelType = ""; // Limpiar tipo al cambiar modelo
  }


  async onSubmit(form: NgForm) { // Ya no recibe 'submitButton'
    this.isLoading = true; // <--- Habilitar spinner y deshabilitar botón al inicio del envío

    if (form.valid && !this.existeCode) {
      if (this.code !== '0') {
        const _id = this.repuesto._id;
        const repuestoToUpdate = { ...this.repuesto };

        delete (repuestoToUpdate as any)._id;
        delete (repuestoToUpdate as any).code;
        delete (repuestoToUpdate as any).createdAt;
        delete (repuestoToUpdate as any).updatedAt;
        delete (repuestoToUpdate as any).createdBy;

        const currentImageUrls: string[] = [];
        const newImageFiles: File[] = [];

        this.images.controls.forEach(control => {
          const file = control.get('file')!.value;
          const previewUrl = control.get('previewUrl')!.value;

          if (file instanceof File) {
            newImageFiles.push(file);
          } else if (previewUrl) {
            currentImageUrls.push(previewUrl);
          }
        });

        const newImagePromises = newImageFiles.map(file => {
          const formData: FormData = new FormData();
          formData.append('file', file, file.name);
          return firstValueFrom(this._repuestoService.agregarImagen(formData));
        });

        try { // Añadir try-catch para manejar errores de promesas aquí también
          const newImageResults = await Promise.all(newImagePromises);
          const uploadedNewUrls = newImageResults.map(result => result.fileUrl);
          repuestoToUpdate.images = [...currentImageUrls, ...uploadedNewUrls];

          this._repuestoService.actualizarRepuesto(_id!, repuestoToUpdate).subscribe({
            next: () => {
              this._exitoService.mostrarExito('Repuesto actualizado exitosamente!');
              this.router.navigate(['/dashboard']);
              this.isLoading = false; // <--- Deshabilitar spinner en éxito
            },
            error: (err) => {
              this._errorService.msjError(err);
              this.isLoading = false; // <--- Deshabilitar spinner en error
            },
          });
        } catch (imageUploadError: any) {
          this._errorService.msjError(imageUploadError);
          console.error("Error al subir nuevas imágenes:", imageUploadError);
          this.isLoading = false; // <--- Deshabilitar spinner si falla la carga de imágenes
        }

      } else { // Si estamos creando un nuevo repuesto
        try {
          const imagenPromises = this.images.controls.map((control) => {
            const file = control.get('file')!.value;
            if (file instanceof File) {
              const formData: FormData = new FormData();
              formData.append('file', file, file.name);
              return firstValueFrom(this._repuestoService.agregarImagen(formData));
            }
            return Promise.resolve(null);
          }).filter(promise => promise !== null);

          const resultados = await Promise.all(imagenPromises);
          this.imagenes = resultados.filter(result => result !== null).map(result => result.fileUrl);
          this.repuesto.images = this.imagenes;

          const respuesta = await firstValueFrom(this._repuestoService.crearRepuesto(this.repuesto));
          this.router.navigate(['/dashboard']);
          this._exitoService.mostrarExito(respuesta);
          this.isLoading = false; // <--- Deshabilitar spinner en éxito
        } catch (err: any) {
          this._errorService.msjError(err);
          console.log(err);
          this.isLoading = false; // <--- Deshabilitar spinner en error
        }
      }
    } else {
      console.log('Formulario inválido o código existente. No se puede enviar.');
      this._errorService.msjError('Por favor, complete todos los campos obligatorios y corrija los errores.');
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.images.controls.forEach(group => {
        if (group instanceof FormGroup) {
          Object.keys(group.controls).forEach(controlName => {
            group.get(controlName)?.markAsTouched();
          });
        }
      });
      this.isLoading = false; // <--- MUY IMPORTANTE: Deshabilitar spinner si la validación local falla
    }
  }


  mostrarMensajeErrorCamposVacios(form: NgForm): boolean {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.images.controls.forEach(group => {
        if (group instanceof FormGroup) {
          Object.keys(group.controls).forEach(controlName => {
            group.get(controlName)?.markAsTouched();
          });
        }
      });
      this._errorService.msjError('Por favor, complete todos los campos obligatorios.');
      return false;
    }
    if (this.existeCode) {
      this._errorService.msjError('El código del repuesto ya existe. Por favor, ingrese uno diferente.');
      return false;
    }
    return true;
  }

  private temporizador: any = null;
  comprobarCodigo() {
    if (this.repuesto.code && !this.isCode) {
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
    } else {
      if (!this.repuesto.code && !this.isCode) {
        this.existeCode = false;
      }
    }
  }

  addImage(): void {
    if (this.images.length < 5) {
      this.images.push(this.createImageGroup());
    }
  }

  createImageGroup(file: File | null = null, previewUrl: string | null = null): FormGroup {
    return this.fb.group({
      file: [file], // El validador 'required' podría ser condicional o no estar aquí si quieres campos opcionales
      previewUrl: [previewUrl]
    });
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
    if (this.images.length === 0) {
      this.addImage(); // Asegura que siempre haya al menos un campo de imagen
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
      this.images.at(index).get('file')!.setValue(file); // Establecer el objeto File
      // Si estamos en edición y se sube una nueva imagen, podría ser útil marcar el control como "sucio"
      this.images.at(index).markAsDirty();
    } else {
      // Si se cancela la selección, resetear el valor del input y del FormArray control
      this.images.at(index).get('file')!.setValue(null);
      this.images.at(index).get('previewUrl')!.setValue(null);
      this.images.at(index).markAsDirty(); // Marcar como sucio para reflejar el cambio
    }
  }

  allImagesSelected(): boolean {
    // Si estás en modo edición, las imágenes ya existentes (con previewUrl pero sin file) también cuentan
    return this.images.controls.every(control =>
      control.get('file')!.value !== null || control.get('previewUrl')!.value !== null
    );
  }

  retornar(): void {
    this.router.navigate(['/dashboard']); // Redirige a dashboard como en onSubmit
  }
}
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Repuesto } from 'src/app/models/repuesto';
import { ErrorService } from 'src/app/services/error.service';
import { ExitoService } from 'src/app/services/exito.service';
import { RepuestoService } from 'src/app/services/repuesto.service';
import { firstValueFrom } from 'rxjs';
import { Marca } from 'src/app/models/marca';
import { MarcaService } from 'src/app/services/marca.service';

@Component({
  selector: 'app-create-marca',
  templateUrl: './create-marca.component.html',
  styleUrls: ['./create-marca.component.css']
})
export class CreateMarcaComponent implements OnInit {
  @ViewChild('fileInput') fileInput: any;  // Aquí obtenemos la referencia al input

  private repuestoForm: FormGroup = this.fb.group({
    image: this.createImageGroup()
  });
  public marca: Marca;
  public code: string = '0';
  public iconButton: string = 'add';
  public buttonName: string = 'REGISTRAR';
  public existeCode: boolean = false;
  public isCode: boolean = false;
  public imagenes: string = '';
  public titulo: string = 'NUEVA MARCA';

  constructor(private fb: FormBuilder, private _errorService: ErrorService, private route: ActivatedRoute,
    private _marcaService: MarcaService, private _exitoService: ExitoService, private router: Router) {
    this.marca = new Marca({});
    this.route.params.subscribe(params => this.code = params['_id'])
  }

  ngOnInit(): void {
    if (this.code !== undefined) {
      this.isCode = true;
      this.iconButton = 'edit';
      this.buttonName = 'ACTUALIZAR';
      this.titulo = 'EDICION DE LA MARCA';
    }
    
    this._marcaService.obtenerMarca(this.code!).subscribe({
      next: (value) => {
        if (value) {
          this.marca = value;
          if (this.marca.image) {
            this.imagenes = this.marca.image;
            this.image.patchValue({
              file: null,
              previewUrl: this.marca.image
            });
          }
        }
      },
      error: (err) => {
        this.existeCode = false;
      }
    });
  }

  async onSubmit(form: NgForm) {
    if (this.mostrarMensajeErrorCamposVacios(form)) {
      if (this.code) {
        const _id = this.marca._id;
        delete this.marca._id;
        const file = this.image.get('file')!.value;
        if (file) {
          const formData: FormData = new FormData();
          const filename = file.name;
          formData.append('file', file, filename);
          const result = await firstValueFrom(this._marcaService.agregarImagen(formData));
          this.marca.image = result.fileUrl;
        }
        const respuesta = await firstValueFrom(this._marcaService.actualizarMarca(_id!, this.marca));
        this.router.navigate(['/dashboard'], { fragment: 'marcas' });
        this._exitoService.mostrarExito(respuesta);
      } else {
        try {
          const file = this.image.get('file')!.value;
          if (file) {
            const formData: FormData = new FormData();
            const filename = file.name;
            formData.append('file', file, filename);
            const result = await firstValueFrom(this._marcaService.agregarImagen(formData));
            this.marca.image = result.fileUrl;
          }
          const respuesta = await firstValueFrom(this._marcaService.crearMarca(this.marca));
          this.router.navigate(['/dashboard'], { fragment: 'marcas' });
          this._exitoService.mostrarExito(respuesta);
        } catch (err: any) {
          this._errorService.msjError(err);
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

  get image(): FormGroup {
    return this.repuestoForm.get('image') as FormGroup;
  }

  createImageGroup(file: File | null = null, previewUrl: string = ''): FormGroup {
    return this.fb.group({
      file: [file, Validators.required],
      previewUrl: [previewUrl]
    });
  }

  onFileChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.image.get('previewUrl')!.setValue(e.target.result);
      };

      reader.readAsDataURL(file);
      this.image.get('file')!.setValue(file);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();  // Dispara el evento de click en el input
  }

  retornar(): void {
    window.history.back();
  }
}

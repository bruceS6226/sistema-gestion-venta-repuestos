import { CUSTOM_ELEMENTS_SCHEMA, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxCaptchaModule } from 'ngx-captcha';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateRepuestoComponent } from './components/repuestos/create-repuesto/create-repuesto.component';
import { HeaderComponent } from './components/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatBadgeModule} from '@angular/material/badge';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FooterComponent } from './components/footer/footer.component';
import {MatTabsModule} from '@angular/material/tabs';
import { ConfirmarComponent } from './dialogs/confirmar/confirmar.component';
import {MatDialogModule} from '@angular/material/dialog';
import { HomeComponent } from './components/home/home.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RepuestosComponent } from './components/repuestos/repuestos.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { LoginComponent } from './components/login/login.component';
import { AccesoComponent } from './components/acceso/acceso.component';
import { AddTokenInterceptor } from './utils/add-token.interceptor';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { CatalogoRepuestosComponent } from './components/catalogo-repuestos/catalogo-repuestos.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { DetalleRepuestoComponent } from './components/detalle-repuesto/detalle-repuesto.component';
import { AuthGoogleComponent } from './components/auth-google/auth-google.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { loginReducer } from './store/login.reducer.reducer';
import { LoginEffects } from './store/login.effects.effects';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { BuscarRepuestoComponent } from './components/buscar-repuesto/buscar-repuesto.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { DetalleCarritoComponent } from './components/detalle-carrito/detalle-carrito.component';
import { DetallePagoComponent } from './components/detalle-pago/detalle-pago.component';
import {MatChipsModule} from '@angular/material/chips';
import { PagoFinalizadoComponent } from './components/pago-finalizado/pago-finalizado.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { MarcasComponent } from './components/marcas/marcas.component';
import { CreateCategoriaComponent } from './components/categorias/create-categoria/create-categoria.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTreeModule} from '@angular/material/tree';
import { CreateMarcaComponent } from './components/marcas/create-marca/create-marca.component';
import { AccesoDenegadoComponent } from './components/acceso-denegado/acceso-denegado.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatStepperModule} from '@angular/material/stepper';
import { DialogoAgregarModeloComponent } from './components/marcas/dialogo-agregar-modelo/dialogo-agregar-modelo.component';
import { DialogoAgregarTipoComponent } from './components/marcas/dialogo-agregar-tipo/dialogo-agregar-tipo.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    CreateRepuestoComponent,
    HeaderComponent,
    DashboardComponent,
    FooterComponent,
    ConfirmarComponent,
    HomeComponent,
    RepuestosComponent,
    UsuariosComponent,
    SignInComponent,
    LoginComponent,
    AccesoComponent,
    ChangePasswordComponent,
    CatalogoRepuestosComponent,
    DetalleRepuestoComponent,
    BuscarRepuestoComponent,
    DetalleCarritoComponent,
    DetallePagoComponent,
    PagoFinalizadoComponent,
    CategoriasComponent,
    MarcasComponent,
    CreateCategoriaComponent,
    CreateMarcaComponent,
    AccesoDenegadoComponent,
    DialogoAgregarModeloComponent,
    DialogoAgregarTipoComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatDialogModule,
    MatTooltipModule,
    NgxCaptchaModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    StoreModule.forRoot({ auth: loginReducer }),
    EffectsModule.forRoot([LoginEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    StoreRouterConnectingModule.forRoot(),
    NgxImageZoomModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTreeModule,
    MatSnackBarModule,
    MatStepperModule,
    ReactiveFormsModule,
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AddTokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


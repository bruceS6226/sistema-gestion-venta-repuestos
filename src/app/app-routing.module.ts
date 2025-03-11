import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRepuestoComponent } from './components/create-repuesto/create-repuesto.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AccesoComponent } from './components/acceso/acceso.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { RestrictionSignLoginGuard } from './utils/restriction-sign-login.guard';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ExistenciaToken } from './utils/existenciaToken';
import { DetalleRepuestoComponent } from './components/detalle-repuesto/detalle-repuesto.component';
import { AuthGoogleComponent } from './components/auth-google/auth-google.component';
import { BuscarRepuestoComponent } from './components/buscar-repuesto/buscar-repuesto.component';
import { DetalleCarritoComponent } from './components/detalle-carrito/detalle-carrito.component';
import { DetallePagoComponent } from './components/detalle-pago/detalle-pago.component';
import { PagoFinalizadoComponent } from './components/pago-finalizado/pago-finalizado.component';
import { CreateCategoriaComponent } from './components/categorias/create-categoria/create-categoria.component';
import { CreateMarcaComponent } from './components/marcas/create-marca/create-marca.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'create-repuesto', component: CreateRepuestoComponent, canActivate: [ExistenciaToken] },
  { path: 'edit-repuesto/:code', component: CreateRepuestoComponent, canActivate: [ExistenciaToken] },
  { path: 'repuesto/:_id', component: DetalleRepuestoComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [ExistenciaToken] },

  { path: 'create-categoria', component: CreateCategoriaComponent, canActivate: [ExistenciaToken] },
  { path: 'edit-categoria/:_id', component: CreateCategoriaComponent, canActivate: [ExistenciaToken] },
  
  { path: 'create-marca', component: CreateMarcaComponent, canActivate: [ExistenciaToken] },
  { path: 'edit-marca/:_id', component: CreateMarcaComponent, canActivate: [ExistenciaToken] },

  { path: 'login', component: LoginComponent, canActivate: [RestrictionSignLoginGuard] },
  { path: 'acceso', component: AccesoComponent, canActivate: [RestrictionSignLoginGuard] },
  { path: 'signin', component: SignInComponent, canActivate: [RestrictionSignLoginGuard] },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'auth-google', loadComponent: () => import('./components/auth-google/auth-google.component').then(m => m.AuthGoogleComponent)
  },
  { path: 'cart-detail', component: DetalleCarritoComponent },
  { path: 'spare-part', component: BuscarRepuestoComponent },
  { path: 'payment-detail', component: DetallePagoComponent, canActivate: [ExistenciaToken] },
  { path: 'payment-correct', component: PagoFinalizadoComponent, canActivate: [ExistenciaToken] },
  { path: 'signin', component: SignInComponent, canActivate: [RestrictionSignLoginGuard] },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedTabIndex: number = 0;
  isEmploy: boolean = false;
  tabs: string[] = ['repuestos', 'usuarios', 'categorias', 'marcas'];

  constructor(private route: ActivatedRoute, private router: Router, private _usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.obtenerRolesUsuario();
    
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        this.setTabByFragment(fragment);
      }
    });
  }

  async obtenerRolesUsuario(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRoles: string[] = payload.roles || [];
        this.isEmploy = userRoles.includes('employee');
      }
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }

    if (this.isEmploy) {
      this.tabs = this.tabs.filter(tab => tab !== 'usuarios');
    }

    const token = localStorage.getItem('token');
    if (!token || token === 'undefined') {
      this.tabs = this.tabs.filter(tab => tab !== 'usuarios');
      this.selectedTabIndex = 0;
    }
  }

  setTabByFragment(fragment: string): void {
    switch (fragment) {
      case 'usuarios':
        this.selectedTabIndex = this.tabs.indexOf('usuarios');
        break;
      case 'categorias':
        this.selectedTabIndex = this.tabs.indexOf('categorias');
        break;
      case 'marcas':
        this.selectedTabIndex = this.tabs.indexOf('marcas');
        break;
      default:
        this.selectedTabIndex = this.tabs.indexOf('repuestos');
        break;
    }
  }

  changeFragment(index: number): void {
    let fragment = this.tabs[index] || 'repuestos';
    this.router.navigate([], { fragment });
  }
}

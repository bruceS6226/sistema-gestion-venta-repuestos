import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements  OnInit {
  selectedTabIndex: number = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Escuchar el fragmento de la URL (el hash)
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        this.setTabByFragment(fragment);
      }
    });
  }
  setTabByFragment(fragment: string): void {
    switch (fragment) {
      case 'usuarios':
        this.selectedTabIndex = 1;
        break;
      case 'categorias':
        this.selectedTabIndex = 2;
        break;
      case 'marcas':
        this.selectedTabIndex = 3;
        break;
      default:
        this.selectedTabIndex = 0;
        break;
    }
  }

  changeFragment(index: number): void {
    let fragment = '';
    switch (index) {
      case 1:
        fragment = 'usuarios';
        break;
      case 2:
        fragment = 'categorias';
        break;
      case 3:
        fragment = 'marcas';
        break;
      default:
        fragment = 'repuestos';
        break;
    }

    this.router.navigate([], { fragment });
  }
}
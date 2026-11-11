import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ToastContainerComponent } from '../../components/toast-container/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <div class="d-flex min-vh-100">
      <app-sidebar
        [mobileOpen]="mobileSidebarOpen"
        [desktopCollapsed]="desktopCollapsed"
        (closeMobile)="mobileSidebarOpen = false">
      </app-sidebar>

      <div class="flex-grow-1 d-flex flex-column min-w-0">
        <app-header [title]="currentPageTitle" (toggleSidebar)="onToggleSidebar()"></app-header>

        <main class="flex-grow-1 p-3 p-md-4">
          <div class="container-fluid px-0" style="max-width: 1440px;">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
    <app-toast-container></app-toast-container>
  `
})
export class MainLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  mobileSidebarOpen = false;
  desktopCollapsed = false;
  currentPageTitle = 'Operations Dashboard';

  ngOnInit(): void {
    this.updateTitle();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());
  }

  onToggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      this.desktopCollapsed = !this.desktopCollapsed;
    }
  }

  private updateTitle(): void {
    let active = this.route;
    while (active.firstChild) {
      active = active.firstChild;
    }
    this.currentPageTitle = active.snapshot.data['title'] ?? 'Logistics Operations';
  }
}

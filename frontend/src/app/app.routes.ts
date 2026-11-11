import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { CustomerDetailComponent } from './pages/customers/customer-detail/customer-detail.component';
import { CustomerFormComponent } from './pages/customers/customer-form/customer-form.component';
import { CustomerListComponent } from './pages/customers/customer-list/customer-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DriverDetailComponent } from './pages/drivers/driver-detail/driver-detail.component';
import { DriverFormComponent } from './pages/drivers/driver-form/driver-form.component';
import { DriverListComponent } from './pages/drivers/driver-list/driver-list.component';
import { HubDetailComponent } from './pages/hubs/hub-detail/hub-detail.component';
import { HubFormComponent } from './pages/hubs/hub-form/hub-form.component';
import { HubListComponent } from './pages/hubs/hub-list/hub-list.component';
import { ShipmentDetailComponent } from './pages/shipments/shipment-detail/shipment-detail.component';
import { ShipmentFormComponent } from './pages/shipments/shipment-form/shipment-form.component';
import { ShipmentListComponent } from './pages/shipments/shipment-list/shipment-list.component';
import { TrackingSearchComponent } from './pages/tracking/tracking-search/tracking-search.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Operations Dashboard' }
      },
      {
        path: 'customers',
        component: CustomerListComponent,
        data: { title: 'Customer Management' }
      },
      {
        path: 'customers/new',
        component: CustomerFormComponent,
        data: { title: 'Add Customer' }
      },
      {
        path: 'customers/:id/edit',
        component: CustomerFormComponent,
        data: { title: 'Edit Customer' }
      },
      {
        path: 'customers/:id',
        component: CustomerDetailComponent,
        data: { title: 'Customer Details' }
      },
      {
        path: 'drivers',
        component: DriverListComponent,
        data: { title: 'Driver Fleet Management' }
      },
      {
        path: 'drivers/new',
        component: DriverFormComponent,
        data: { title: 'Add Driver' }
      },
      {
        path: 'drivers/:id/edit',
        component: DriverFormComponent,
        data: { title: 'Edit Driver' }
      },
      {
        path: 'drivers/:id',
        component: DriverDetailComponent,
        data: { title: 'Driver Profile' }
      },
      {
        path: 'hubs',
        component: HubListComponent,
        data: { title: 'Logistics Hub Directory' }
      },
      {
        path: 'hubs/new',
        component: HubFormComponent,
        data: { title: 'Add Hub' }
      },
      {
        path: 'hubs/:id/edit',
        component: HubFormComponent,
        data: { title: 'Edit Hub' }
      },
      {
        path: 'hubs/:id',
        component: HubDetailComponent,
        data: { title: 'Hub Details' }
      },
      {
        path: 'shipments',
        component: ShipmentListComponent,
        data: { title: 'Shipment Consignments' }
      },
      {
        path: 'shipments/new',
        component: ShipmentFormComponent,
        data: { title: 'Register Shipment' }
      },
      {
        path: 'shipments/:id/edit',
        component: ShipmentFormComponent,
        data: { title: 'Edit Shipment' }
      },
      {
        path: 'shipments/:id',
        component: ShipmentDetailComponent,
        data: { title: 'Shipment Details & Tracking' }
      },
      {
        path: 'tracking',
        component: TrackingSearchComponent,
        data: { title: 'Track & Timeline Lookup' }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];


import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent, LoadingSpinnerComponent } from '../../shared/shared-ui';
import { DashboardSummaryResponse } from '../../models/dashboard.model';
import { ShipmentStatus } from '../../models/shipment.model';
import { TrackingEventResponse } from '../../models/tracking-event.model';
import { DashboardService } from '../../services/dashboard.service';

interface DonutSegment {
  label: string;
  count: number;
  percentage: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    @if (errorMessage) {
      <div class="alert alert-danger d-flex align-items-center justify-content-between gap-2 mb-3">
        <div><i class="bi bi-exclamation-octagon-fill me-2"></i>{{ errorMessage }}</div>
        <button type="button" class="btn btn-outline-danger btn-sm" (click)="loadDashboard()">Retry</button>
      </div>
    }

    @if (loading) {
      <div class="ops-card">
        <app-loading-spinner message="Loading live logistics metrics from MySQL..."></app-loading-spinner>
      </div>
    } @else if (summary) {
      <!-- 1. Hero Banner -->
      <section class="hero-banner mb-3">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">Logistics Shipment<br />and Delivery Tracking System</h1>
          <p class="hero-subtitle">Smarter Logistics. Better Delivery.</p>
        </div>
      </section>

      <!-- 2. Six KPI Cards Row -->
      <section class="row g-3 mb-3">
        <div class="col-6 col-md-4 col-xl-2">
          <a routerLink="/shipments" class="stat-tile text-decoration-none">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon icon-blue">
                <i class="bi bi-box-seam-fill"></i>
              </div>
              <div class="min-w-0">
                <div class="stat-num tabular-nums">{{ summary.totalShipments }}</div>
                <div class="stat-label">Total Shipments</div>
              </div>
            </div>
            <div class="stat-foot text-success">
              <i class="bi bi-box-arrow-up me-1"></i>{{ summary.pickedUpShipments }} Picked Up
            </div>
          </a>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <a routerLink="/shipments" [queryParams]="{ status: 'PENDING' }" class="stat-tile text-decoration-none">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon icon-orange">
                <i class="bi bi-clock-fill"></i>
              </div>
              <div class="min-w-0">
                <div class="stat-num tabular-nums">{{ summary.pendingShipments }}</div>
                <div class="stat-label">Pending</div>
              </div>
            </div>
            <div class="stat-foot text-success">
              <i class="bi bi-pie-chart-fill me-1"></i>{{ pct(summary.pendingShipments) }}% share
            </div>
          </a>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <a routerLink="/shipments" [queryParams]="{ status: 'IN_TRANSIT' }" class="stat-tile text-decoration-none">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon icon-green">
                <i class="bi bi-truck"></i>
              </div>
              <div class="min-w-0">
                <div class="stat-num tabular-nums">{{ summary.inTransitShipments }}</div>
                <div class="stat-label">In Transit</div>
              </div>
            </div>
            <div class="stat-foot text-success">
              <i class="bi bi-arrow-up-short"></i>{{ pct(summary.inTransitShipments) }}% active
            </div>
          </a>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <a routerLink="/shipments" [queryParams]="{ status: 'OUT_FOR_DELIVERY' }" class="stat-tile text-decoration-none">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon icon-purple">
                <i class="bi bi-truck-flatbed"></i>
              </div>
              <div class="min-w-0">
                <div class="stat-num tabular-nums">{{ summary.outForDeliveryShipments }}</div>
                <div class="stat-label">Out for Delivery</div>
              </div>
            </div>
            <div class="stat-foot text-success">
              <i class="bi bi-geo-alt-fill me-1"></i>{{ pct(summary.outForDeliveryShipments) }}% final mile
            </div>
          </a>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <a routerLink="/shipments" [queryParams]="{ status: 'DELIVERED' }" class="stat-tile text-decoration-none">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon icon-emerald">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <div class="min-w-0">
                <div class="stat-num tabular-nums">{{ summary.deliveredShipments }}</div>
                <div class="stat-label">Delivered</div>
              </div>
            </div>
            <div class="stat-foot text-success">
              <i class="bi bi-check2-all me-1"></i>{{ pct(summary.deliveredShipments) }}% done
            </div>
          </a>
        </div>

        <div class="col-6 col-md-4 col-xl-2">
          <a routerLink="/shipments" [queryParams]="{ delayedOnly: 'true' }" class="stat-tile stat-tile-danger text-decoration-none">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon icon-red">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div class="min-w-0">
                <div class="stat-num tabular-nums">{{ summary.delayedShipmentsCount }}</div>
                <div class="stat-label">Delayed</div>
              </div>
            </div>
            <div class="stat-foot text-danger">
              <i class="bi bi-exclamation-circle me-1"></i>{{ pct(summary.delayedShipmentsCount) }}% overdue
            </div>
          </a>
        </div>
      </section>

      <!-- 3. Status Distribution + Recent Activity + Promo Card -->
      <section class="row g-3 mb-3">
        <!-- Shipment Status Distribution -->
        <div class="col-12 col-lg-5 col-xl-4">
          <div class="dash-card h-100">
            <div class="dash-card-header">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-bar-chart-fill text-primary"></i>
                <h6 class="mb-0 fw-bold">Shipment Status Distribution</h6>
              </div>
            </div>
            <div class="dash-card-body d-flex align-items-center justify-content-between gap-3 flex-wrap flex-sm-nowrap">
              @if (summary.totalShipments === 0) {
                <app-empty-state
                  icon="bi-pie-chart"
                  title="No shipment data"
                  description="Register a shipment to view distribution."
                  actionLabel="Register Shipment"
                  actionLink="/shipments/new">
                </app-empty-state>
              } @else {
                <div class="donut-container mx-auto mx-sm-0">
                  <svg viewBox="0 0 180 180" class="donut-svg" aria-label="Shipment Status Donut Chart">
                    <circle cx="90" cy="90" r="64" fill="transparent" stroke="#f1f5f9" stroke-width="26"></circle>
                    @for (seg of donutSegments; track seg.label) {
                      @if (seg.count > 0) {
                        <circle
                          cx="90"
                          cy="90"
                          r="64"
                          fill="transparent"
                          [attr.stroke]="seg.color"
                          stroke-width="26"
                          [attr.stroke-dasharray]="seg.dashArray"
                          [attr.stroke-dashoffset]="seg.dashOffset"
                          transform="rotate(-90 90 90)">
                        </circle>
                      }
                    }
                  </svg>
                  <div class="donut-center">
                    <div class="donut-total tabular-nums">{{ summary.totalShipments }}</div>
                    <div class="donut-sub">Total</div>
                  </div>
                </div>

                <div class="legend-list flex-grow-1 w-100">
                  @for (seg of donutSegments; track seg.label) {
                    <div class="legend-row">
                      <div class="d-flex align-items-center gap-2">
                        <span class="legend-dot" [style.backgroundColor]="seg.color"></span>
                        <span class="legend-name">{{ seg.label }}</span>
                      </div>
                      <span class="legend-val tabular-nums">
                        <strong>{{ seg.count }}</strong> ({{ seg.percentage }}%)
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-12 col-lg-7 col-xl-4">
          <div class="dash-card h-100">
            <div class="dash-card-header">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-clock text-secondary"></i>
                <h6 class="mb-0 fw-bold">Recent Activity</h6>
              </div>
              <a routerLink="/tracking" class="view-all-link">
                View All <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
            <div class="dash-card-body">
              @if (summary.recentTrackingEvents.length === 0) {
                <app-empty-state
                  icon="bi-clock-history"
                  title="No recent activity"
                  description="Tracking milestones recorded by staff will appear here.">
                </app-empty-state>
              } @else {
                <div class="activity-list">
                  @for (ev of summary.recentTrackingEvents.slice(0, 4); track ev.eventId; let last = $last) {
                    <div class="activity-row" [class.is-last]="last">
                      <div class="activity-rail">
                        <div class="activity-dot" [ngClass]="activityDotClass(ev.eventStatus)">
                          <i class="bi" [ngClass]="activityIcon(ev.eventStatus)"></i>
                        </div>
                        @if (!last) {
                          <div class="activity-line"></div>
                        }
                      </div>
                      <div class="activity-body">
                        <a [routerLink]="['/shipments', ev.shipmentId]" class="activity-title text-decoration-none">
                          {{ formatActivitySentence(ev) }}
                        </a>
                        <div class="activity-meta">
                          {{ relativeTime(ev.eventDateTime) }}
                          @if (ev.hubName) {
                            &bull; {{ ev.hubName }}
                          } @else {
                            &bull; by {{ ev.updatedBy }}
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Delivering Possibilities Every Day Feature Card -->
        <div class="col-12 col-xl-4">
          <div class="promo-card h-100">
            <div class="promo-overlay"></div>
            <div class="promo-content">
              <h4 class="promo-title">Delivering<br />Possibilities<br />Every Day</h4>
              <p class="promo-subtitle">Real-time tracking.<br />Complete visibility.</p>
              <a routerLink="/tracking" class="btn btn-primary promo-btn">
                Track a Shipment <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Quick Actions + Delayed Shipments Table -->
      <section class="row g-3">
        <!-- Quick Actions -->
        <div class="col-12 col-xl-6">
          <div class="dash-card h-100">
            <div class="dash-card-header">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-truck text-dark"></i>
                <h6 class="mb-0 fw-bold">Quick Actions</h6>
              </div>
              <span class="small text-muted">
                {{ summary.totalCustomers }} Customers &bull; {{ summary.availableDrivers }}/{{ summary.totalDrivers }} Drivers Free &bull; {{ summary.totalHubs }} Hubs
              </span>
            </div>
            <div class="dash-card-body">
              <div class="quick-actions-grid">
                <a routerLink="/shipments/new" class="qa-tile qa-blue text-decoration-none">
                  <i class="bi bi-box-seam-fill qa-icon"></i>
                  <span>Register<br />Shipment</span>
                </a>
                <a routerLink="/customers/new" class="qa-tile qa-green text-decoration-none">
                  <i class="bi bi-people-fill qa-icon"></i>
                  <span>Add<br />Customer</span>
                </a>
                <a routerLink="/drivers/new" class="qa-tile qa-purple text-decoration-none">
                  <i class="bi bi-person-badge-fill qa-icon"></i>
                  <span>Add<br />Driver</span>
                </a>
                <a routerLink="/hubs/new" class="qa-tile qa-orange text-decoration-none">
                  <i class="bi bi-geo-alt-fill qa-icon"></i>
                  <span>Add<br />Hub</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Delayed Shipments -->
        <div class="col-12 col-xl-6">
          <div class="dash-card h-100 overflow-hidden">
            <div class="dash-card-header">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill text-danger"></i>
                <h6 class="mb-0 fw-bold">Delayed Shipments</h6>
              </div>
              <a routerLink="/shipments" [queryParams]="{ delayedOnly: 'true' }" class="view-all-link">
                View All <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
            @if (summary.delayedShipments.length === 0) {
              <app-empty-state
                icon="bi-check-circle"
                title="No delayed shipments"
                description="All active consignments are within their expected delivery window.">
              </app-empty-state>
            } @else {
              <div class="table-responsive">
                <table class="table delayed-table mb-0">
                  <thead>
                    <tr>
                      <th>Tracking Number</th>
                      <th>Customer</th>
                      <th>Expected Date</th>
                      <th class="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (shipment of summary.delayedShipments.slice(0, 5); track shipment.shipmentId) {
                      <tr class="clickable-row" [routerLink]="['/shipments', shipment.shipmentId]">
                        <td class="fw-semibold text-dark tabular-nums">{{ shipment.trackingNumber }}</td>
                        <td class="text-secondary">{{ shipment.customerName }}</td>
                        <td class="text-secondary tabular-nums">{{ shipment.expectedDeliveryDate | date:'MMM dd, yyyy' }}</td>
                        <td class="text-end">
                          <span class="delayed-pill">Delayed</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    /* Hero Banner */
    .hero-banner {
      position: relative;
      border-radius: 0.9rem;
      overflow: hidden;
      min-height: 170px;
      display: flex;
      align-items: center;
      background-color: #0b2246;
      background-image: url('/assets/hero-truck-banner.jpg');
      background-size: cover;
      background-position: right 52%;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(10, 29, 61, 0.92) 0%, rgba(12, 38, 78, 0.65) 42%, rgba(12, 38, 78, 0.05) 100%);
    }
    .hero-content {
      position: relative;
      z-index: 1;
      padding: 1.75rem 2.25rem;
      color: #ffffff;
    }
    .hero-title {
      font-size: clamp(1.4rem, 2.5vw, 2rem);
      font-weight: 700;
      line-height: 1.18;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }
    .hero-subtitle {
      font-size: 0.98rem;
      color: #e2e8f0;
      margin: 0;
      font-weight: 400;
    }

    /* 6 KPI Cards */
    .stat-tile {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      background: #ffffff;
      border: 1px solid #e5e9f2;
      border-radius: 0.85rem;
      padding: 0.95rem 1rem;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .stat-tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
    }
    .stat-tile-danger {
      border-color: #fee2e2;
      background: #fffefe;
    }
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .icon-blue { background: #e0edff; color: #1d72f3; }
    .icon-orange { background: #ffedd5; color: #f97316; }
    .icon-green { background: #dcfce7; color: #16a34a; }
    .icon-purple { background: #f3e8ff; color: #7c3aed; }
    .icon-emerald { background: #dcfce7; color: #22c55e; }
    .icon-red { background: #fee2e2; color: #dc2626; }
    .stat-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.1;
    }
    .stat-label {
      font-size: 0.78rem;
      color: #475569;
      font-weight: 500;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stat-foot {
      font-size: 0.74rem;
      font-weight: 600;
      margin-top: 0.55rem;
      text-align: center;
    }

    /* Dashboard Panel Cards */
    .dash-card {
      background: #ffffff;
      border: 1px solid #e5e9f2;
      border-radius: 0.85rem;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
    }
    .dash-card-header {
      padding: 0.9rem 1.15rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .dash-card-body {
      padding: 1.1rem 1.15rem;
      flex: 1;
    }
    .view-all-link {
      font-size: 0.8rem;
      font-weight: 600;
      color: #1d72f3;
      text-decoration: none;
    }
    .view-all-link:hover {
      text-decoration: underline;
    }

    /* Donut Chart */
    .donut-container {
      position: relative;
      width: 158px;
      height: 158px;
      flex-shrink: 0;
    }
    .donut-svg {
      width: 100%;
      height: 100%;
    }
    .donut-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .donut-total {
      font-size: 1.65rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.05;
    }
    .donut-sub {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 500;
    }
    .legend-list {
      display: flex;
      flex-direction: column;
      gap: 0.52rem;
    }
    .legend-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.8rem;
    }
    .legend-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-name {
      color: #334155;
      font-weight: 500;
    }
    .legend-val {
      color: #475569;
    }

    /* Recent Activity */
    .activity-list {
      display: flex;
      flex-direction: column;
    }
    .activity-row {
      display: flex;
      gap: 0.8rem;
    }
    .activity-rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .activity-dot {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.82rem;
    }
    .act-delivered { background: #dcfce7; color: #16a34a; }
    .act-out { background: #dbeafe; color: #2563eb; }
    .act-transit { background: #ede9fe; color: #7c3aed; }
    .act-pickup { background: #cffafe; color: #0891b2; }
    .act-pending { background: #fef3c7; color: #d97706; }
    .activity-line {
      width: 2px;
      flex-grow: 1;
      background: #e2e8f0;
      margin: 3px 0;
      min-height: 16px;
    }
    .activity-body {
      padding-bottom: 0.85rem;
      min-width: 0;
    }
    .activity-row.is-last .activity-body {
      padding-bottom: 0;
    }
    .activity-title {
      display: block;
      font-size: 0.83rem;
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .activity-title:hover {
      color: #1d72f3;
    }
    .activity-meta {
      font-size: 0.74rem;
      color: #64748b;
      margin-top: 1px;
    }

    /* Promo Card */
    .promo-card {
      position: relative;
      border-radius: 0.85rem;
      overflow: hidden;
      min-height: 230px;
      display: flex;
      align-items: center;
      background-color: #061630;
      background-image: url('/assets/promo-globe-banner.jpg');
      background-size: cover;
      background-position: right center;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
    }
    .promo-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(6, 22, 48, 0.88) 0%, rgba(8, 30, 66, 0.55) 48%, rgba(8, 30, 66, 0.05) 100%);
    }
    .promo-content {
      position: relative;
      z-index: 1;
      padding: 1.5rem;
      color: #ffffff;
    }
    .promo-title {
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 0.6rem;
    }
    .promo-subtitle {
      font-size: 0.84rem;
      color: #cbd5e1;
      line-height: 1.4;
      margin-bottom: 1.15rem;
    }
    .promo-btn {
      border-radius: 9999px;
      padding: 0.5rem 1.15rem;
      font-size: 0.84rem;
      font-weight: 600;
      background: #1d72f3;
      border-color: #1d72f3;
      box-shadow: 0 4px 12px rgba(29, 114, 243, 0.4);
    }

    /* Quick Actions */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.85rem;
      height: 100%;
    }
    @media (max-width: 767.98px) {
      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .qa-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #ffffff;
      border-radius: 0.75rem;
      padding: 1.15rem 0.75rem;
      font-size: 0.86rem;
      font-weight: 600;
      line-height: 1.25;
      gap: 0.55rem;
      transition: transform 0.15s ease, filter 0.15s ease;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.08);
    }
    .qa-tile:hover {
      transform: translateY(-2px);
      filter: brightness(1.05);
      color: #ffffff;
    }
    .qa-icon {
      font-size: 1.55rem;
    }
    .qa-blue { background: linear-gradient(135deg, #2b7ef7, #1565e8); }
    .qa-green { background: linear-gradient(135deg, #2ecc71, #22b563); }
    .qa-purple { background: linear-gradient(135deg, #9867f5, #7e49e8); }
    .qa-orange { background: linear-gradient(135deg, #fb923c, #f97316); }

    /* Delayed Shipments Compact Table */
    .delayed-table thead th {
      background: #f8fafc;
      color: #334155;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.7rem 1rem;
      border-bottom: 1px solid #e5e9f2;
    }
    .delayed-table tbody td {
      padding: 0.72rem 1rem;
      font-size: 0.84rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .delayed-table tbody tr:last-child td {
      border-bottom: none;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background-color: #f8fafc;
    }
    .delayed-pill {
      display: inline-block;
      background-color: #fee2e2;
      color: #dc2626;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.22rem 0.65rem;
      border-radius: 9999px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  summary: DashboardSummaryResponse | null = null;
  donutSegments: DonutSegment[] = [];
  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = null;
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.buildDonutSegments(data);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load dashboard summary.';
        this.loading = false;
      }
    });
  }

  pct(count: number): number {
    const total = this.summary?.totalShipments ?? 0;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  formatActivitySentence(ev: TrackingEventResponse): string {
    switch (ev.eventStatus) {
      case 'DELIVERED':
        return `Shipment #${ev.trackingNumber} delivered`;
      case 'OUT_FOR_DELIVERY':
        return `Shipment #${ev.trackingNumber} is out for delivery`;
      case 'IN_TRANSIT':
        return `Shipment #${ev.trackingNumber} is in transit`;
      case 'PICKED_UP':
        return `Shipment #${ev.trackingNumber} picked up`;
      case 'CANCELLED':
        return `Shipment #${ev.trackingNumber} cancelled`;
      default:
        return `New shipment #${ev.trackingNumber} registered`;
    }
  }

  activityDotClass(status: ShipmentStatus): string {
    switch (status) {
      case 'DELIVERED': return 'act-delivered';
      case 'OUT_FOR_DELIVERY': return 'act-out';
      case 'IN_TRANSIT': return 'act-transit';
      case 'PICKED_UP': return 'act-pickup';
      default: return 'act-pending';
    }
  }

  activityIcon(status: ShipmentStatus): string {
    switch (status) {
      case 'DELIVERED': return 'bi-check-lg';
      case 'OUT_FOR_DELIVERY': return 'bi-truck';
      case 'IN_TRANSIT': return 'bi-truck-flatbed';
      case 'PICKED_UP': return 'bi-box-arrow-up';
      default: return 'bi-box-seam';
    }
  }

  relativeTime(dateTimeStr: string): string {
    const evDate = new Date(dateTimeStr);
    const diffMs = Date.now() - evDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min(s) ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day(s) ago`;
  }

  private buildDonutSegments(data: DashboardSummaryResponse): void {
    const total = data.totalShipments || 0;
    const radius = 64;
    const circumference = 2 * Math.PI * radius;

    const rawItems = [
      { label: 'Pending', count: data.pendingShipments, color: '#1d72f3' },
      { label: 'Picked Up', count: data.pickedUpShipments, color: '#06b6d4' },
      { label: 'In Transit', count: data.inTransitShipments, color: '#f59e0b' },
      { label: 'Out for Delivery', count: data.outForDeliveryShipments, color: '#8b5cf6' },
      { label: 'Delivered', count: data.deliveredShipments, color: '#22c55e' },
      { label: 'Delayed', count: data.delayedShipmentsCount, color: '#ef4444' }
    ];

    // Calculate donut arc proportions cleanly so segments fill 100% of ring
    const sliceSum = rawItems.reduce((sum, i) => sum + i.count, 0);
    let cumulative = 0;

    this.donutSegments = rawItems.map((item) => {
      const displayPct = total === 0 ? 0 : Math.round((item.count / total) * 100);
      const ringFraction = sliceSum === 0 ? 0 : item.count / sliceSum;
      const segLength = ringFraction * circumference;
      const offset = -cumulative;
      cumulative += segLength;

      return {
        label: item.label,
        count: item.count,
        percentage: displayPct,
        color: item.color,
        dashArray: `${segLength} ${circumference}`,
        dashOffset: offset
      };
    });
  }
}

package com.project.logistics.service.impl;

import com.project.logistics.dto.DashboardSummaryResponse;
import com.project.logistics.dto.DashboardSummaryResponse.StatusDistributionItem;
import com.project.logistics.dto.ShipmentResponse;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.AvailabilityStatus;
import com.project.logistics.entity.Shipment;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.repository.CustomerRepository;
import com.project.logistics.repository.DriverRepository;
import com.project.logistics.repository.HubRepository;
import com.project.logistics.repository.ShipmentRepository;
import com.project.logistics.repository.TrackingEventRepository;
import com.project.logistics.service.DashboardService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final ShipmentRepository shipmentRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final HubRepository hubRepository;
    private final TrackingEventRepository trackingEventRepository;

    public DashboardServiceImpl(ShipmentRepository shipmentRepository,
                                CustomerRepository customerRepository,
                                DriverRepository driverRepository,
                                HubRepository hubRepository,
                                TrackingEventRepository trackingEventRepository) {
        this.shipmentRepository = shipmentRepository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.hubRepository = hubRepository;
        this.trackingEventRepository = trackingEventRepository;
    }

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        DashboardSummaryResponse summary = new DashboardSummaryResponse();

        long total = shipmentRepository.count();
        long pending = shipmentRepository.countByShipmentStatus(ShipmentStatus.PENDING);
        long pickedUp = shipmentRepository.countByShipmentStatus(ShipmentStatus.PICKED_UP);
        long inTransit = shipmentRepository.countByShipmentStatus(ShipmentStatus.IN_TRANSIT);
        long outForDelivery = shipmentRepository.countByShipmentStatus(ShipmentStatus.OUT_FOR_DELIVERY);
        long delivered = shipmentRepository.countByShipmentStatus(ShipmentStatus.DELIVERED);
        long cancelled = shipmentRepository.countByShipmentStatus(ShipmentStatus.CANCELLED);

        List<Shipment> delayedEntities = shipmentRepository.findDelayedShipments(LocalDate.now());
        List<ShipmentResponse> delayedResponses = delayedEntities.stream()
                .map(s -> DtoMapper.toShipmentResponse(
                        s, trackingEventRepository.countByShipmentShipmentId(s.getShipmentId())))
                .toList();

        List<TrackingEventResponse> recentEvents = trackingEventRepository
                .findRecentEvents(PageRequest.of(0, 8))
                .stream()
                .map(DtoMapper::toTrackingEventResponse)
                .toList();

        List<StatusDistributionItem> distribution = new ArrayList<>();
        distribution.add(buildDistributionItem(ShipmentStatus.PENDING, pending, total));
        distribution.add(buildDistributionItem(ShipmentStatus.PICKED_UP, pickedUp, total));
        distribution.add(buildDistributionItem(ShipmentStatus.IN_TRANSIT, inTransit, total));
        distribution.add(buildDistributionItem(ShipmentStatus.OUT_FOR_DELIVERY, outForDelivery, total));
        distribution.add(buildDistributionItem(ShipmentStatus.DELIVERED, delivered, total));
        distribution.add(buildDistributionItem(ShipmentStatus.CANCELLED, cancelled, total));

        summary.setTotalShipments(total);
        summary.setPendingShipments(pending);
        summary.setPickedUpShipments(pickedUp);
        summary.setInTransitShipments(inTransit);
        summary.setOutForDeliveryShipments(outForDelivery);
        summary.setDeliveredShipments(delivered);
        summary.setCancelledShipments(cancelled);
        summary.setDelayedShipmentsCount(delayedResponses.size());

        summary.setTotalCustomers(customerRepository.count());
        summary.setTotalDrivers(driverRepository.count());
        summary.setAvailableDrivers(driverRepository.countByAvailabilityStatus(AvailabilityStatus.AVAILABLE));
        summary.setTotalHubs(hubRepository.count());

        summary.setStatusDistribution(distribution);
        summary.setDelayedShipments(delayedResponses);
        summary.setRecentTrackingEvents(recentEvents);

        return summary;
    }

    private StatusDistributionItem buildDistributionItem(ShipmentStatus status, long count, long total) {
        double pct = total == 0 ? 0.0 : Math.round(((double) count * 100.0 / total) * 10.0) / 10.0;
        return new StatusDistributionItem(status, count, pct);
    }
}


package com.project.logistics.service.impl;

import com.project.logistics.dto.AnalyticsResponse;
import com.project.logistics.dto.DashboardSummaryResponse;
import com.project.logistics.dto.NotificationsResponse;
import com.project.logistics.dto.DashboardSummaryResponse.StatusDistributionItem;
import com.project.logistics.dto.ShipmentResponse;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.AvailabilityStatus;
import com.project.logistics.entity.Shipment;
import com.project.logistics.entity.TrackingEvent;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.repository.CustomerRepository;
import com.project.logistics.repository.DriverRepository;
import com.project.logistics.repository.HubRepository;
import com.project.logistics.repository.ShipmentRepository;
import com.project.logistics.repository.TrackingEventRepository;
import com.project.logistics.service.DashboardService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    @Override
    public AnalyticsResponse getAnalytics() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(13);

        List<Shipment> recent = shipmentRepository.findByCreatedDateBetween(start, today);
        Map<LocalDate, Long> createdByDay = new LinkedHashMap<>();
        for (int i = 0; i < 14; i++) {
            createdByDay.put(start.plusDays(i), 0L);
        }
        for (Shipment s : recent) {
            createdByDay.merge(s.getCreatedDate(), 1L, Long::sum);
        }
        List<TrackingEvent> deliveredEvents = trackingEventRepository
                .findByEventStatusAndEventDateTimeBetween(ShipmentStatus.DELIVERED,
                        start.atStartOfDay(), today.plusDays(1).atStartOfDay());
        Map<LocalDate, Long> deliveredByDay = new LinkedHashMap<>();
        for (int i = 0; i < 14; i++) {
            deliveredByDay.put(start.plusDays(i), 0L);
        }
        for (TrackingEvent e : deliveredEvents) {
            deliveredByDay.merge(e.getEventDateTime().toLocalDate(), 1L, Long::sum);
        }
        List<AnalyticsResponse.DailyCount> daily = new ArrayList<>();
        for (int i = 0; i < 14; i++) {
            LocalDate d = start.plusDays(i);
            daily.add(new AnalyticsResponse.DailyCount(d, createdByDay.get(d), deliveredByDay.get(d)));
        }

        List<Shipment> delivered = shipmentRepository.findAll().stream()
                .filter(s -> s.getShipmentStatus() == ShipmentStatus.DELIVERED).toList();
        long onTime = 0;
        long totalDays = 0;
        int withPod = 0;
        for (Shipment s : delivered) {
            List<TrackingEvent> pods = trackingEventRepository
                    .findByShipmentShipmentIdAndEventStatusOrderByEventDateTimeDescEventIdDesc(
                            s.getShipmentId(), ShipmentStatus.DELIVERED);
            if (!pods.isEmpty()) {
                LocalDate deliveredDate = pods.get(0).getEventDateTime().toLocalDate();
                if (!deliveredDate.isAfter(s.getExpectedDeliveryDate())) {
                    onTime++;
                }
                totalDays += ChronoUnit.DAYS.between(s.getCreatedDate(), deliveredDate);
                withPod++;
            }
        }
        double onTimePct = delivered.isEmpty() ? 0.0
                : Math.round(((double) onTime * 100.0 / delivered.size()) * 10.0) / 10.0;
        double avgDays = withPod == 0 ? 0.0
                : Math.round(((double) totalDays / withPod) * 10.0) / 10.0;

        List<AnalyticsResponse.HubThroughput> hubs = shipmentRepository.hubThroughput().stream()
                .map(r -> new AnalyticsResponse.HubThroughput(
                        String.valueOf(r[0]), String.valueOf(r[1]), String.valueOf(r[2]),
                        ((Number) r[3]).longValue()))
                .toList();
        List<AnalyticsResponse.DriverLeaderboardEntry> drivers = shipmentRepository.deliveredCountByDriver().stream()
                .map(r -> {
                    String code = String.valueOf(r[0]);
                    long deliveredCount = ((Number) r[2]).longValue();
                    long total = driverRepository.findByDriverCodeIgnoreCase(code)
                            .map(d -> shipmentRepository.countByDriverDriverId(d.getDriverId())).orElse(0L);
                    return new AnalyticsResponse.DriverLeaderboardEntry(
                            code, String.valueOf(r[1]), deliveredCount, total);
                })
                .toList();

        long total = shipmentRepository.count();
        List<AnalyticsResponse.StatusMixEntry> mix = new ArrayList<>();
        for (ShipmentStatus st : ShipmentStatus.values()) {
            long c = shipmentRepository.countByShipmentStatus(st);
            double pct = total == 0 ? 0.0 : Math.round(((double) c * 100.0 / total) * 10.0) / 10.0;
            mix.add(new AnalyticsResponse.StatusMixEntry(st.name(), c, pct));
        }

        AnalyticsResponse res = new AnalyticsResponse();
        res.setDaily(daily);
        res.setOnTimePct(onTimePct);
        res.setAvgDeliveryDays(avgDays);
        res.setDeliveredCount(delivered.size());
        res.setHubThroughput(hubs);
        res.setDriverLeaderboard(drivers);
        res.setStatusMix(mix);
        return res;
    }

    @Override
    public NotificationsResponse getNotifications() {
        DashboardSummaryResponse summary = getDashboardSummary();
        NotificationsResponse res = new NotificationsResponse();
        res.setDelayedShipments(summary.getDelayedShipments());
        res.setRecentEvents(summary.getRecentTrackingEvents());
        res.setUnreadCount(summary.getDelayedShipmentsCount() + summary.getRecentTrackingEvents().size());
        return res;
    }

    private StatusDistributionItem buildDistributionItem(ShipmentStatus status, long count, long total) {
        double pct = total == 0 ? 0.0 : Math.round(((double) count * 100.0 / total) * 10.0) / 10.0;
        return new StatusDistributionItem(status, count, pct);
    }
}


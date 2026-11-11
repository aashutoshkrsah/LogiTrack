package com.project.logistics.service.impl;

import com.project.logistics.dto.TrackingEventRequest;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.Hub;
import com.project.logistics.entity.Shipment;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.entity.TrackingEvent;
import com.project.logistics.exception.BusinessRuleException;
import com.project.logistics.exception.ResourceNotFoundException;
import com.project.logistics.repository.HubRepository;
import com.project.logistics.repository.ShipmentRepository;
import com.project.logistics.repository.TrackingEventRepository;
import com.project.logistics.service.TrackingEventService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TrackingEventServiceImpl implements TrackingEventService {

    private final TrackingEventRepository trackingEventRepository;
    private final ShipmentRepository shipmentRepository;
    private final HubRepository hubRepository;

    public TrackingEventServiceImpl(TrackingEventRepository trackingEventRepository,
                                    ShipmentRepository shipmentRepository,
                                    HubRepository hubRepository) {
        this.trackingEventRepository = trackingEventRepository;
        this.shipmentRepository = shipmentRepository;
        this.hubRepository = hubRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackingEventResponse> getAllTrackingEvents(Long shipmentId,
                                                            String trackingNumber,
                                                            ShipmentStatus status) {
        String normalizedTracking = trackingNumber == null ? null : trackingNumber.trim();
        return trackingEventRepository.searchTrackingEvents(shipmentId, normalizedTracking, status)
                .stream()
                .map(DtoMapper::toTrackingEventResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TrackingEventResponse getTrackingEventById(Long id) {
        TrackingEvent event = findEventOrThrow(id);
        return DtoMapper.toTrackingEventResponse(event);
    }

    @Override
    public TrackingEventResponse createTrackingEvent(TrackingEventRequest request) {
        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Referenced shipment not found with ID: " + request.getShipmentId()));

        if (shipment.getShipmentStatus() == ShipmentStatus.CANCELLED) {
            throw new BusinessRuleException(
                    "Cannot record tracking events for a cancelled shipment.",
                    HttpStatus.CONFLICT
            );
        }

        Hub hub = resolveOptionalHub(request.getHubId());

        TrackingEvent event = new TrackingEvent();
        event.setShipment(shipment);
        event.setEventDateTime(request.getEventDateTime());
        event.setEventStatus(request.getEventStatus());
        event.setHub(hub);
        event.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);
        event.setUpdatedBy(request.getUpdatedBy().trim());

        TrackingEvent saved = trackingEventRepository.saveAndFlush(event);
        synchronizeShipmentStatus(shipment);

        return DtoMapper.toTrackingEventResponse(findEventOrThrow(saved.getEventId()));
    }

    @Override
    public TrackingEventResponse updateTrackingEvent(Long id, TrackingEventRequest request) {
        TrackingEvent existing = findEventOrThrow(id);

        if (request.getRemarks() == null || request.getRemarks().trim().isEmpty()) {
            throw new BusinessRuleException(
                    "Tracking events are append-only; correcting an existing event requires non-empty remarks explaining the correction.",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (!existing.getShipment().getShipmentId().equals(request.getShipmentId())) {
            throw new BusinessRuleException(
                    "Cannot reassign an existing tracking event to a different shipment.",
                    HttpStatus.BAD_REQUEST
            );
        }

        Hub hub = resolveOptionalHub(request.getHubId());

        existing.setEventDateTime(request.getEventDateTime());
        existing.setEventStatus(request.getEventStatus());
        existing.setHub(hub);
        existing.setRemarks(request.getRemarks().trim());
        existing.setUpdatedBy(request.getUpdatedBy().trim());

        TrackingEvent updated = trackingEventRepository.saveAndFlush(existing);
        synchronizeShipmentStatus(existing.getShipment());

        return DtoMapper.toTrackingEventResponse(findEventOrThrow(updated.getEventId()));
    }

    @Override
    public void deleteTrackingEvent(Long id) {
        TrackingEvent existing = findEventOrThrow(id);
        Shipment shipment = existing.getShipment();

        if (shipment.getShipmentStatus() == ShipmentStatus.DELIVERED) {
            throw new BusinessRuleException(
                    "Cannot delete tracking events of a delivered shipment.",
                    HttpStatus.CONFLICT
            );
        }

        TrackingEvent latest = trackingEventRepository
                .findTopByShipmentShipmentIdOrderByEventDateTimeDescEventIdDesc(shipment.getShipmentId())
                .orElse(null);

        if (latest != null && !latest.getEventId().equals(existing.getEventId())) {
            throw new BusinessRuleException(
                    "Only the latest tracking event can be removed. Use update with remarks to correct historical events.",
                    HttpStatus.CONFLICT
            );
        }

        trackingEventRepository.delete(existing);
        trackingEventRepository.flush();
        synchronizeShipmentStatus(shipment);
    }

    private TrackingEvent findEventOrThrow(Long id) {
        return trackingEventRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tracking event not found with ID: " + id));
    }

    private Hub resolveOptionalHub(Long hubId) {
        if (hubId == null) {
            return null;
        }
        return hubRepository.findById(hubId)
                .orElseThrow(() -> new ResourceNotFoundException("Referenced hub not found with ID: " + hubId));
    }

    private void synchronizeShipmentStatus(Shipment shipment) {
        ShipmentStatus nextStatus = trackingEventRepository
                .findTopByShipmentShipmentIdOrderByEventDateTimeDescEventIdDesc(shipment.getShipmentId())
                .map(TrackingEvent::getEventStatus)
                .orElse(ShipmentStatus.PENDING);
        shipment.setShipmentStatus(nextStatus);
        shipmentRepository.save(shipment);
    }
}


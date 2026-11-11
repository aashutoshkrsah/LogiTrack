package com.project.logistics.controller;

import com.project.logistics.dto.MessageResponse;
import com.project.logistics.dto.TrackingEventRequest;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.service.TrackingEventService;
import jakarta.validation.Valid;
import com.project.logistics.dto.PageResponse;
import com.project.logistics.util.PaginationUtil;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tracking-events")
public class TrackingEventController {

    private final TrackingEventService trackingEventService;

    public TrackingEventController(TrackingEventService trackingEventService) {
        this.trackingEventService = trackingEventService;
    }

    @GetMapping
    public ResponseEntity<?> getAllTrackingEvents(
            @RequestParam(required = false) Long shipmentId,
            @RequestParam(required = false) String trackingNumber,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {
        if (page != null) {
            PageResponse<TrackingEventResponse> paged = trackingEventService.getTrackingEventsPaged(
                    shipmentId, trackingNumber, status,
                    PaginationUtil.build(page, size, sort,
                            Set.of("eventId", "eventDateTime", "eventStatus"), "eventDateTime"));
            return ResponseEntity.ok(paged);
        }
        return ResponseEntity.ok(
                trackingEventService.getAllTrackingEvents(shipmentId, trackingNumber, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrackingEventResponse> getTrackingEventById(@PathVariable Long id) {
        return ResponseEntity.ok(trackingEventService.getTrackingEventById(id));
    }

    @PostMapping
    public ResponseEntity<TrackingEventResponse> createTrackingEvent(
            @Valid @RequestBody TrackingEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(trackingEventService.createTrackingEvent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackingEventResponse> updateTrackingEvent(
            @PathVariable Long id,
            @Valid @RequestBody TrackingEventRequest request) {
        return ResponseEntity.ok(trackingEventService.updateTrackingEvent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteTrackingEvent(@PathVariable Long id) {
        trackingEventService.deleteTrackingEvent(id);
        return ResponseEntity.ok(new MessageResponse("Tracking event deleted successfully."));
    }
}


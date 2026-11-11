package com.project.logistics.controller;

import com.project.logistics.dto.MessageResponse;
import com.project.logistics.dto.ShipmentRequest;
import com.project.logistics.dto.ShipmentResponse;
import com.project.logistics.dto.ShipmentTimelineResponse;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.service.ShipmentService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
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
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAllShipments(
            @RequestParam(required = false) String trackingNumber,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) Long originHubId,
            @RequestParam(required = false, defaultValue = "false") boolean delayedOnly) {
        return ResponseEntity.ok(
                shipmentService.getAllShipments(
                        trackingNumber, status, fromDate, toDate,
                        customerId, driverId, originHubId, delayedOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getShipmentById(id));
    }

    @PostMapping
    public ResponseEntity<ShipmentResponse> createShipment(@Valid @RequestBody ShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shipmentService.createShipment(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShipmentResponse> updateShipment(@PathVariable Long id,
                                                           @Valid @RequestBody ShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.updateShipment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.ok(new MessageResponse("Shipment deleted successfully."));
    }

    @GetMapping("/{trackingNumber}/timeline")
    public ResponseEntity<ShipmentTimelineResponse> getTimelineByTrackingNumber(
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getTimelineByTrackingNumber(trackingNumber));
    }
}


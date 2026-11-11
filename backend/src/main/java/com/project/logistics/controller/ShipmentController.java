package com.project.logistics.controller;

import com.project.logistics.dto.AssignDriverRequest;
import com.project.logistics.dto.CancelShipmentRequest;
import com.project.logistics.dto.DeliverShipmentRequest;
import com.project.logistics.dto.MessageResponse;
import com.project.logistics.dto.PageResponse;
import com.project.logistics.dto.ShipmentRequest;
import com.project.logistics.dto.ShipmentResponse;
import com.project.logistics.dto.ShipmentTimelineResponse;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.service.ShipmentService;
import jakarta.validation.Valid;
import com.project.logistics.util.CsvUtil;
import com.project.logistics.util.PaginationUtil;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
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
    public ResponseEntity<?> getAllShipments(
            @RequestParam(required = false) String trackingNumber,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) Long originHubId,
            @RequestParam(required = false, defaultValue = "false") boolean delayedOnly,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {
        if (page != null) {
            PageResponse<ShipmentResponse> paged = shipmentService.getShipmentsPaged(
                    trackingNumber, status, fromDate, toDate, customerId, driverId, originHubId, delayedOnly,
                    PaginationUtil.build(page, size, sort,
                            Set.of("shipmentId", "trackingNumber", "createdDate", "expectedDeliveryDate",
                                    "weight", "shipmentStatus"), "shipmentId"));
            return ResponseEntity.ok(paged);
        }
        return ResponseEntity.ok(
                shipmentService.getAllShipments(
                        trackingNumber, status, fromDate, toDate,
                        customerId, driverId, originHubId, delayedOnly));
    }

    @GetMapping("/export")
    public void exportShipments(
            @RequestParam(required = false) String trackingNumber,
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) Long originHubId,
            @RequestParam(required = false, defaultValue = "false") boolean delayedOnly,
            HttpServletResponse response) throws IOException {
        List<ShipmentResponse> rows = shipmentService.getAllShipments(
                trackingNumber, status, fromDate, toDate, customerId, driverId, originHubId, delayedOnly);
        String csv = CsvUtil.build(
                new String[]{"shipmentId", "trackingNumber", "customerName", "driverName", "originHubName",
                        "destinationCity", "createdDate", "expectedDeliveryDate", "shipmentStatus",
                        "weight", "delayed", "trackingEventCount"},
                rows.stream().map(s -> new String[]{
                        String.valueOf(s.getShipmentId()), s.getTrackingNumber(), s.getCustomerName(),
                        s.getDriverName() == null ? "" : s.getDriverName(), s.getOriginHubName(),
                        s.getDestinationCity(), String.valueOf(s.getCreatedDate()),
                        String.valueOf(s.getExpectedDeliveryDate()), s.getShipmentStatus().name(),
                        String.valueOf(s.getWeight()), String.valueOf(s.isDelayed()),
                        String.valueOf(s.getTrackingEventCount())}).toList());
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"shipments.csv\"");
        response.getOutputStream().write(csv.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping("/{id}/assign-driver")
    public ResponseEntity<ShipmentResponse> assignDriver(@PathVariable Long id,
                                                         @Valid @RequestBody AssignDriverRequest request) {
        return ResponseEntity.ok(shipmentService.assignDriver(id, request.getDriverId()));
    }

    @PostMapping("/{id}/advance")
    public ResponseEntity<ShipmentResponse> advance(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.advanceStatus(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ShipmentResponse> cancel(@PathVariable Long id,
                                                   @RequestBody(required = false) CancelShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.cancelShipment(id, request == null ? null : request.getReason()));
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<ShipmentResponse> deliver(@PathVariable Long id,
                                                    @Valid @RequestBody DeliverShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.deliverShipment(id, request.getReceivedBy(), request.getRemarks()));
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


package com.project.logistics.controller;

import com.project.logistics.dto.ShipmentTimelineResponse;
import com.project.logistics.service.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public tracking — no authentication. Returns only the shipment summary
 *  and its tracking timeline; no customer/driver contact details beyond
 *  what the timeline response already contains. */
@RestController
@RequestMapping("/api/public")
public class PublicTrackingController {

    private final ShipmentService shipmentService;

    public PublicTrackingController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentTimelineResponse> track(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getTimelineByTrackingNumber(trackingNumber));
    }
}

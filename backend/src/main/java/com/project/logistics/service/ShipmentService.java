package com.project.logistics.service;

import com.project.logistics.dto.PageResponse;
import com.project.logistics.dto.ShipmentRequest;
import com.project.logistics.dto.ShipmentResponse;
import com.project.logistics.dto.ShipmentTimelineResponse;
import com.project.logistics.entity.ShipmentStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface ShipmentService {

    List<ShipmentResponse> getAllShipments(String trackingNumber,
                                           ShipmentStatus status,
                                           LocalDate fromDate,
                                           LocalDate toDate,
                                           Long customerId,
                                           Long driverId,
                                           Long originHubId,
                                           boolean delayedOnly);

    ShipmentResponse getShipmentById(Long id);

    ShipmentResponse createShipment(ShipmentRequest request);

    ShipmentResponse updateShipment(Long id, ShipmentRequest request);

    void deleteShipment(Long id);

    ShipmentTimelineResponse getTimelineByTrackingNumber(String trackingNumber);

    PageResponse<ShipmentResponse> getShipmentsPaged(String trackingNumber,
                                                     ShipmentStatus status,
                                                     LocalDate fromDate,
                                                     LocalDate toDate,
                                                     Long customerId,
                                                     Long driverId,
                                                     Long originHubId,
                                                     boolean delayedOnly,
                                                     Pageable pageable);

    ShipmentResponse assignDriver(Long id, Long driverId);

    ShipmentResponse advanceStatus(Long id);

    ShipmentResponse cancelShipment(Long id, String reason);

    ShipmentResponse deliverShipment(Long id, String receivedBy, String remarks);
}


package com.project.logistics.service;

import com.project.logistics.dto.TrackingEventRequest;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.dto.PageResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface TrackingEventService {

    List<TrackingEventResponse> getAllTrackingEvents(Long shipmentId, String trackingNumber, ShipmentStatus status);

    PageResponse<TrackingEventResponse> getTrackingEventsPaged(Long shipmentId, String trackingNumber,
                                                               ShipmentStatus status, Pageable pageable);

    TrackingEventResponse getTrackingEventById(Long id);

    TrackingEventResponse createTrackingEvent(TrackingEventRequest request);

    TrackingEventResponse updateTrackingEvent(Long id, TrackingEventRequest request);

    void deleteTrackingEvent(Long id);
}


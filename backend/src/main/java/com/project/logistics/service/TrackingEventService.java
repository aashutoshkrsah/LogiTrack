package com.project.logistics.service;

import com.project.logistics.dto.TrackingEventRequest;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.ShipmentStatus;
import java.util.List;

public interface TrackingEventService {

    List<TrackingEventResponse> getAllTrackingEvents(Long shipmentId, String trackingNumber, ShipmentStatus status);

    TrackingEventResponse getTrackingEventById(Long id);

    TrackingEventResponse createTrackingEvent(TrackingEventRequest request);

    TrackingEventResponse updateTrackingEvent(Long id, TrackingEventRequest request);

    void deleteTrackingEvent(Long id);
}


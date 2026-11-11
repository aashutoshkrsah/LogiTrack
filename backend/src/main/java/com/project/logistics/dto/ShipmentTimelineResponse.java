package com.project.logistics.dto;

import java.util.List;

public class ShipmentTimelineResponse {

    private ShipmentResponse shipment;
    private List<TrackingEventResponse> events;

    public ShipmentTimelineResponse() {
    }

    public ShipmentTimelineResponse(ShipmentResponse shipment, List<TrackingEventResponse> events) {
        this.shipment = shipment;
        this.events = events;
    }

    public ShipmentResponse getShipment() {
        return shipment;
    }

    public void setShipment(ShipmentResponse shipment) {
        this.shipment = shipment;
    }

    public List<TrackingEventResponse> getEvents() {
        return events;
    }

    public void setEvents(List<TrackingEventResponse> events) {
        this.events = events;
    }
}


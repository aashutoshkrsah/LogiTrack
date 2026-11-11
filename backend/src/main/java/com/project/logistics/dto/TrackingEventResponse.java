package com.project.logistics.dto;

import com.project.logistics.entity.ShipmentStatus;
import java.time.LocalDateTime;

public class TrackingEventResponse {

    private Long eventId;
    private Long shipmentId;
    private String trackingNumber;
    private LocalDateTime eventDateTime;
    private ShipmentStatus eventStatus;
    private Long hubId;
    private String hubCode;
    private String hubName;
    private String hubCity;
    private String remarks;
    private String updatedBy;

    public TrackingEventResponse() {
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public LocalDateTime getEventDateTime() {
        return eventDateTime;
    }

    public void setEventDateTime(LocalDateTime eventDateTime) {
        this.eventDateTime = eventDateTime;
    }

    public ShipmentStatus getEventStatus() {
        return eventStatus;
    }

    public void setEventStatus(ShipmentStatus eventStatus) {
        this.eventStatus = eventStatus;
    }

    public Long getHubId() {
        return hubId;
    }

    public void setHubId(Long hubId) {
        this.hubId = hubId;
    }

    public String getHubCode() {
        return hubCode;
    }

    public void setHubCode(String hubCode) {
        this.hubCode = hubCode;
    }

    public String getHubName() {
        return hubName;
    }

    public void setHubName(String hubName) {
        this.hubName = hubName;
    }

    public String getHubCity() {
        return hubCity;
    }

    public void setHubCity(String hubCity) {
        this.hubCity = hubCity;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}


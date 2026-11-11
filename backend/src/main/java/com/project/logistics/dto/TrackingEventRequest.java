package com.project.logistics.dto;

import com.project.logistics.entity.ShipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class TrackingEventRequest {

    @NotNull(message = "Shipment ID is required")
    private Long shipmentId;

    @NotNull(message = "Event date and time is required")
    private LocalDateTime eventDateTime;

    @NotNull(message = "Event status is required")
    private ShipmentStatus eventStatus;

    private Long hubId;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;

    @NotBlank(message = "Updated by is required")
    @Size(min = 2, max = 100, message = "Updated by must be between 2 and 100 characters")
    private String updatedBy;

    public TrackingEventRequest() {
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
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


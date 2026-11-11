package com.project.logistics.dto;

import jakarta.validation.constraints.NotBlank;

public class DeliverShipmentRequest {

    @NotBlank(message = "receivedBy is required (name of the person who signed for delivery)")
    private String receivedBy;

    private String remarks;

    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

package com.project.logistics.dto;

import java.util.List;

public class NotificationsResponse {

    private List<ShipmentResponse> delayedShipments;
    private List<TrackingEventResponse> recentEvents;
    private long unreadCount;

    public List<ShipmentResponse> getDelayedShipments() { return delayedShipments; }
    public void setDelayedShipments(List<ShipmentResponse> delayedShipments) { this.delayedShipments = delayedShipments; }
    public List<TrackingEventResponse> getRecentEvents() { return recentEvents; }
    public void setRecentEvents(List<TrackingEventResponse> recentEvents) { this.recentEvents = recentEvents; }
    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
}

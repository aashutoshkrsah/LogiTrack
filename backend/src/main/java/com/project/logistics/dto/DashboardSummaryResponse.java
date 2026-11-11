package com.project.logistics.dto;

import com.project.logistics.entity.ShipmentStatus;
import java.util.List;

public class DashboardSummaryResponse {

    private long totalShipments;
    private long pendingShipments;
    private long pickedUpShipments;
    private long inTransitShipments;
    private long outForDeliveryShipments;
    private long deliveredShipments;
    private long cancelledShipments;
    private long delayedShipmentsCount;
    private long totalCustomers;
    private long totalDrivers;
    private long availableDrivers;
    private long totalHubs;
    private List<StatusDistributionItem> statusDistribution;
    private List<ShipmentResponse> delayedShipments;
    private List<TrackingEventResponse> recentTrackingEvents;

    public DashboardSummaryResponse() {
    }

    public static class StatusDistributionItem {
        private ShipmentStatus status;
        private long count;
        private double percentage;

        public StatusDistributionItem() {
        }

        public StatusDistributionItem(ShipmentStatus status, long count, double percentage) {
            this.status = status;
            this.count = count;
            this.percentage = percentage;
        }

        public ShipmentStatus getStatus() {
            return status;
        }

        public void setStatus(ShipmentStatus status) {
            this.status = status;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }

    public long getTotalShipments() {
        return totalShipments;
    }

    public void setTotalShipments(long totalShipments) {
        this.totalShipments = totalShipments;
    }

    public long getPendingShipments() {
        return pendingShipments;
    }

    public void setPendingShipments(long pendingShipments) {
        this.pendingShipments = pendingShipments;
    }

    public long getPickedUpShipments() {
        return pickedUpShipments;
    }

    public void setPickedUpShipments(long pickedUpShipments) {
        this.pickedUpShipments = pickedUpShipments;
    }

    public long getInTransitShipments() {
        return inTransitShipments;
    }

    public void setInTransitShipments(long inTransitShipments) {
        this.inTransitShipments = inTransitShipments;
    }

    public long getOutForDeliveryShipments() {
        return outForDeliveryShipments;
    }

    public void setOutForDeliveryShipments(long outForDeliveryShipments) {
        this.outForDeliveryShipments = outForDeliveryShipments;
    }

    public long getDeliveredShipments() {
        return deliveredShipments;
    }

    public void setDeliveredShipments(long deliveredShipments) {
        this.deliveredShipments = deliveredShipments;
    }

    public long getCancelledShipments() {
        return cancelledShipments;
    }

    public void setCancelledShipments(long cancelledShipments) {
        this.cancelledShipments = cancelledShipments;
    }

    public long getDelayedShipmentsCount() {
        return delayedShipmentsCount;
    }

    public void setDelayedShipmentsCount(long delayedShipmentsCount) {
        this.delayedShipmentsCount = delayedShipmentsCount;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalDrivers() {
        return totalDrivers;
    }

    public void setTotalDrivers(long totalDrivers) {
        this.totalDrivers = totalDrivers;
    }

    public long getAvailableDrivers() {
        return availableDrivers;
    }

    public void setAvailableDrivers(long availableDrivers) {
        this.availableDrivers = availableDrivers;
    }

    public long getTotalHubs() {
        return totalHubs;
    }

    public void setTotalHubs(long totalHubs) {
        this.totalHubs = totalHubs;
    }

    public List<StatusDistributionItem> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(List<StatusDistributionItem> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public List<ShipmentResponse> getDelayedShipments() {
        return delayedShipments;
    }

    public void setDelayedShipments(List<ShipmentResponse> delayedShipments) {
        this.delayedShipments = delayedShipments;
    }

    public List<TrackingEventResponse> getRecentTrackingEvents() {
        return recentTrackingEvents;
    }

    public void setRecentTrackingEvents(List<TrackingEventResponse> recentTrackingEvents) {
        this.recentTrackingEvents = recentTrackingEvents;
    }
}


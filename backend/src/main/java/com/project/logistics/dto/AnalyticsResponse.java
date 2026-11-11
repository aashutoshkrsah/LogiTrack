package com.project.logistics.dto;

import java.time.LocalDate;
import java.util.List;

public class AnalyticsResponse {

    private List<DailyCount> daily;
    private double onTimePct;
    private double avgDeliveryDays;
    private long deliveredCount;
    private List<HubThroughput> hubThroughput;
    private List<DriverLeaderboardEntry> driverLeaderboard;
    private List<StatusMixEntry> statusMix;

    public static class DailyCount {
        private LocalDate date;
        private long created;
        private long delivered;
        public DailyCount() {}
        public DailyCount(LocalDate date, long created, long delivered) {
            this.date = date; this.created = created; this.delivered = delivered;
        }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public long getCreated() { return created; }
        public void setCreated(long created) { this.created = created; }
        public long getDelivered() { return delivered; }
        public void setDelivered(long delivered) { this.delivered = delivered; }
    }

    public static class HubThroughput {
        private String hubCode;
        private String hubName;
        private String city;
        private long count;
        public HubThroughput() {}
        public HubThroughput(String hubCode, String hubName, String city, long count) {
            this.hubCode = hubCode; this.hubName = hubName; this.city = city; this.count = count;
        }
        public String getHubCode() { return hubCode; }
        public void setHubCode(String hubCode) { this.hubCode = hubCode; }
        public String getHubName() { return hubName; }
        public void setHubName(String hubName) { this.hubName = hubName; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class DriverLeaderboardEntry {
        private String driverCode;
        private String driverName;
        private long deliveredCount;
        private long totalCount;
        public DriverLeaderboardEntry() {}
        public DriverLeaderboardEntry(String driverCode, String driverName, long deliveredCount, long totalCount) {
            this.driverCode = driverCode; this.driverName = driverName;
            this.deliveredCount = deliveredCount; this.totalCount = totalCount;
        }
        public String getDriverCode() { return driverCode; }
        public void setDriverCode(String driverCode) { this.driverCode = driverCode; }
        public String getDriverName() { return driverName; }
        public void setDriverName(String driverName) { this.driverName = driverName; }
        public long getDeliveredCount() { return deliveredCount; }
        public void setDeliveredCount(long deliveredCount) { this.deliveredCount = deliveredCount; }
        public long getTotalCount() { return totalCount; }
        public void setTotalCount(long totalCount) { this.totalCount = totalCount; }
    }

    public static class StatusMixEntry {
        private String status;
        private long count;
        private double percentage;
        public StatusMixEntry() {}
        public StatusMixEntry(String status, long count, double percentage) {
            this.status = status; this.count = count; this.percentage = percentage;
        }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public List<DailyCount> getDaily() { return daily; }
    public void setDaily(List<DailyCount> daily) { this.daily = daily; }
    public double getOnTimePct() { return onTimePct; }
    public void setOnTimePct(double onTimePct) { this.onTimePct = onTimePct; }
    public double getAvgDeliveryDays() { return avgDeliveryDays; }
    public void setAvgDeliveryDays(double avgDeliveryDays) { this.avgDeliveryDays = avgDeliveryDays; }
    public long getDeliveredCount() { return deliveredCount; }
    public void setDeliveredCount(long deliveredCount) { this.deliveredCount = deliveredCount; }
    public List<HubThroughput> getHubThroughput() { return hubThroughput; }
    public void setHubThroughput(List<HubThroughput> hubThroughput) { this.hubThroughput = hubThroughput; }
    public List<DriverLeaderboardEntry> getDriverLeaderboard() { return driverLeaderboard; }
    public void setDriverLeaderboard(List<DriverLeaderboardEntry> driverLeaderboard) { this.driverLeaderboard = driverLeaderboard; }
    public List<StatusMixEntry> getStatusMix() { return statusMix; }
    public void setStatusMix(List<StatusMixEntry> statusMix) { this.statusMix = statusMix; }
}

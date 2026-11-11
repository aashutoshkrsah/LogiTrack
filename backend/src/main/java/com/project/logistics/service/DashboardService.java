package com.project.logistics.service;

import com.project.logistics.dto.AnalyticsResponse;
import com.project.logistics.dto.DashboardSummaryResponse;
import com.project.logistics.dto.NotificationsResponse;

public interface DashboardService {

    DashboardSummaryResponse getDashboardSummary();

    AnalyticsResponse getAnalytics();

    NotificationsResponse getNotifications();
}


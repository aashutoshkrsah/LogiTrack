package com.project.logistics.service;

import com.project.logistics.dto.HubRequest;
import com.project.logistics.dto.HubResponse;
import com.project.logistics.dto.PageResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface HubService {

    List<HubResponse> getAllHubs(String search, String city);

    PageResponse<HubResponse> getHubsPaged(String search, String city, Pageable pageable);

    HubResponse getHubById(Long id);

    HubResponse createHub(HubRequest request);

    HubResponse updateHub(Long id, HubRequest request);

    void deleteHub(Long id);
}


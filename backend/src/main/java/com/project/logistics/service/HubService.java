package com.project.logistics.service;

import com.project.logistics.dto.HubRequest;
import com.project.logistics.dto.HubResponse;
import java.util.List;

public interface HubService {

    List<HubResponse> getAllHubs(String search, String city);

    HubResponse getHubById(Long id);

    HubResponse createHub(HubRequest request);

    HubResponse updateHub(Long id, HubRequest request);

    void deleteHub(Long id);
}


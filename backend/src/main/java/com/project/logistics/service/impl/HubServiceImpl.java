package com.project.logistics.service.impl;

import com.project.logistics.dto.HubRequest;
import com.project.logistics.dto.HubResponse;
import com.project.logistics.entity.Hub;
import com.project.logistics.exception.BusinessRuleException;
import com.project.logistics.exception.DuplicateResourceException;
import com.project.logistics.exception.ResourceNotFoundException;
import com.project.logistics.repository.HubRepository;
import com.project.logistics.repository.ShipmentRepository;
import com.project.logistics.repository.TrackingEventRepository;
import com.project.logistics.service.HubService;
import com.project.logistics.dto.PageResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HubServiceImpl implements HubService {

    private final HubRepository hubRepository;
    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;

    public HubServiceImpl(HubRepository hubRepository,
                          ShipmentRepository shipmentRepository,
                          TrackingEventRepository trackingEventRepository) {
        this.hubRepository = hubRepository;
        this.shipmentRepository = shipmentRepository;
        this.trackingEventRepository = trackingEventRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HubResponse> getAllHubs(String search, String city) {
        String normalizedSearch = search == null ? null : search.trim();
        String normalizedCity = city == null ? null : city.trim();
        return hubRepository.searchHubs(normalizedSearch, normalizedCity)
                .stream()
                .map(h -> DtoMapper.toHubResponse(
                        h, shipmentRepository.countByOriginHubHubId(h.getHubId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HubResponse> getHubsPaged(String search, String city, Pageable pageable) {
        String normalizedSearch = search == null ? null : search.trim();
        org.springframework.data.domain.Page<com.project.logistics.entity.Hub> page =
                hubRepository.searchHubsPaged(normalizedSearch, city, pageable);
        java.util.List<HubResponse> content = page.getContent().stream()
                .map(h -> DtoMapper.toHubResponse(
                        h, shipmentRepository.countByOriginHubHubId(h.getHubId())))
                .toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public HubResponse getHubById(Long id) {
        Hub hub = findHubOrThrow(id);
        long shipmentCount = shipmentRepository.countByOriginHubHubId(hub.getHubId());
        return DtoMapper.toHubResponse(hub, shipmentCount);
    }

    @Override
    public HubResponse createHub(HubRequest request) {
        String code = request.getHubCode().trim().toUpperCase();
        if (hubRepository.existsByHubCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Hub code already exists: " + code);
        }

        Hub hub = new Hub();
        applyRequest(hub, request, code);
        Hub saved = hubRepository.save(hub);
        return DtoMapper.toHubResponse(saved, 0L);
    }

    @Override
    public HubResponse updateHub(Long id, HubRequest request) {
        Hub hub = findHubOrThrow(id);
        String code = request.getHubCode().trim().toUpperCase();
        if (hubRepository.existsByHubCodeIgnoreCaseAndHubIdNot(code, id)) {
            throw new DuplicateResourceException("Hub code already exists: " + code);
        }

        applyRequest(hub, request, code);
        Hub updated = hubRepository.save(hub);
        long shipmentCount = shipmentRepository.countByOriginHubHubId(updated.getHubId());
        return DtoMapper.toHubResponse(updated, shipmentCount);
    }

    @Override
    public void deleteHub(Long id) {
        Hub hub = findHubOrThrow(id);
        if (shipmentRepository.existsByOriginHubHubId(id)
                || trackingEventRepository.existsByHubHubId(id)) {
            throw new BusinessRuleException(
                    "Cannot delete hub '" + hub.getHubName() + "' because it is referenced by existing shipments or tracking events.",
                    HttpStatus.CONFLICT
            );
        }
        hubRepository.delete(hub);
    }

    private Hub findHubOrThrow(Long id) {
        return hubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hub not found with ID: " + id));
    }

    private void applyRequest(Hub hub, HubRequest request, String normalizedCode) {
        hub.setHubCode(normalizedCode);
        hub.setHubName(request.getHubName().trim());
        hub.setCity(request.getCity().trim());
        hub.setAddress(request.getAddress().trim());
        hub.setContactNumber(request.getContactNumber().trim());
    }
}


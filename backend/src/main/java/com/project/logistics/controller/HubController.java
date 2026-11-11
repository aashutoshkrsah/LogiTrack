package com.project.logistics.controller;

import com.project.logistics.dto.HubRequest;
import com.project.logistics.dto.HubResponse;
import com.project.logistics.dto.MessageResponse;
import com.project.logistics.service.HubService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hubs")
public class HubController {

    private final HubService hubService;

    public HubController(HubService hubService) {
        this.hubService = hubService;
    }

    @GetMapping
    public ResponseEntity<List<HubResponse>> getAllHubs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(hubService.getAllHubs(search, city));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HubResponse> getHubById(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.getHubById(id));
    }

    @PostMapping
    public ResponseEntity<HubResponse> createHub(@Valid @RequestBody HubRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hubService.createHub(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HubResponse> updateHub(@PathVariable Long id,
                                                 @Valid @RequestBody HubRequest request) {
        return ResponseEntity.ok(hubService.updateHub(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteHub(@PathVariable Long id) {
        hubService.deleteHub(id);
        return ResponseEntity.ok(new MessageResponse("Hub deleted successfully."));
    }
}


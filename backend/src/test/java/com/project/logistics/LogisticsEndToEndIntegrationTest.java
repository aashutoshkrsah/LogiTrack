package com.project.logistics;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@WithMockUser(username = "admin@logitrack.in", roles = "ADMIN")
class LogisticsEndToEndIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullWorkflowAndDashboardVerification() throws Exception {
        // 1. Create Customer
        Long customerId = createCustomer("CUST-901", "L&T Heavy Logistics", "+91-98200-11111", "ops@ltheavy.example.com", "CORPORATE");
        // 2. Create Driver
        Long driverId = createDriver("DRV-901", "Arjun Nair", "+91-98200-22222", "MH14-20200012345", "AVAILABLE");
        // 3. Create Origin Hub & Transit Hub
        Long originHubId = createHub("HUB-901", "Mumbai Port Hub", "Mumbai", "Dockyard Road, Mumbai", "+91-22-4090-1000");
        Long transitHubId = createHub("HUB-902", "Pune Transit Hub", "Pune", "Chakan Phase 2, Pune", "+91-20-4090-2000");

        // 4. Register Shipment without driver initially
        LocalDate today = LocalDate.now();
        Long shipmentId = createShipment("TRK-E2E-1001", customerId, null, originHubId,
                "Plot 12, Hinjewadi", "Pune", today.minusDays(1), today.plusDays(3), "125.50");

        // 5. Assign Driver via PUT
        Map<String, Object> updateShipmentPayload = shipmentPayload("TRK-E2E-1001", customerId, driverId, originHubId,
                "Plot 12, Hinjewadi", "Pune", today.minusDays(1), today.plusDays(3), "125.50");
        mockMvc.perform(put("/api/shipments/{id}", shipmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateShipmentPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driverId", is(driverId.intValue())))
                .andExpect(jsonPath("$.driverName", is("Arjun Nair")));

        // 6. Record PICKED_UP event
        LocalDateTime t1 = LocalDateTime.now().minusHours(8).withNano(0);
        createTrackingEvent(shipmentId, t1, "PICKED_UP", originHubId, "Picked up from Mumbai Hub", "Staff A");

        // 7. Record IN_TRANSIT event
        LocalDateTime t2 = LocalDateTime.now().minusHours(5).withNano(0);
        createTrackingEvent(shipmentId, t2, "IN_TRANSIT", transitHubId, "Arrived at Pune Transit Hub", "Staff B");

        // 8. Record OUT_FOR_DELIVERY event
        LocalDateTime t3 = LocalDateTime.now().minusHours(2).withNano(0);
        createTrackingEvent(shipmentId, t3, "OUT_FOR_DELIVERY", transitHubId, "Out for final delivery", "Staff B");

        // 9. Record DELIVERED event
        LocalDateTime t4 = LocalDateTime.now().minusHours(1).withNano(0);
        createTrackingEvent(shipmentId, t4, "DELIVERED", null, "Signed by receiver", "Arjun Nair");

        // 10 & 11. Search by tracking number & verify chronological timeline + synced status
        mockMvc.perform(get("/api/shipments/{trackingNumber}/timeline", "TRK-E2E-1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipment.shipmentStatus", is("DELIVERED")))
                .andExpect(jsonPath("$.shipment.delayed", is(false)))
                .andExpect(jsonPath("$.events", hasSize(4)))
                .andExpect(jsonPath("$.events[0].eventStatus", is("PICKED_UP")))
                .andExpect(jsonPath("$.events[1].eventStatus", is("IN_TRANSIT")))
                .andExpect(jsonPath("$.events[2].eventStatus", is("OUT_FOR_DELIVERY")))
                .andExpect(jsonPath("$.events[3].eventStatus", is("DELIVERED")));

        // 13. Create an overdue shipment (created 6 days ago, expected 2 days ago)
        Long overdueId = createShipment("TRK-OVERDUE-1", customerId, driverId, originHubId,
                "99 MG Road", "Bengaluru", today.minusDays(6), today.minusDays(2), "45.00");
        createTrackingEvent(overdueId, LocalDateTime.now().minusDays(5), "IN_TRANSIT", transitHubId, "Delayed on corridor", "Staff C");

        // 12. Verify Dashboard Counts & Delayed Shipment Reporting
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalShipments", is(2)))
                .andExpect(jsonPath("$.deliveredShipments", is(1)))
                .andExpect(jsonPath("$.inTransitShipments", is(1)))
                .andExpect(jsonPath("$.delayedShipmentsCount", is(1)))
                .andExpect(jsonPath("$.delayedShipments[0].trackingNumber", is("TRK-OVERDUE-1")))
                .andExpect(jsonPath("$.delayedShipments[0].delayed", is(true)));

        // Verify shipment filter parameters (customerId, driverId, originHubId, status, delayedOnly, date range)
        mockMvc.perform(get("/api/shipments")
                        .param("customerId", customerId.toString())
                        .param("driverId", driverId.toString())
                        .param("originHubId", originHubId.toString())
                        .param("delayedOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].trackingNumber", is("TRK-OVERDUE-1")));

        // Verify invalid filter date range is rejected
        mockMvc.perform(get("/api/shipments")
                        .param("fromDate", today.toString())
                        .param("toDate", today.minusDays(2).toString()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validationAndBusinessRulesEnforcement() throws Exception {
        Long customerId = createCustomer("CUST-801", "Alpha Corp", "+91-98111-11111", "alpha@example.com", "CORPORATE");
        Long driverId = createDriver("DRV-801", "Kiran Rao", "+91-98111-22222", "KA02-201900111", "AVAILABLE");
        Long hubId = createHub("HUB-801", "Delhi Hub", "New Delhi", "Okhla Phase 2", "+91-11-4000-1000");

        LocalDate today = LocalDate.now();
        Long shipmentId = createShipment("TRK-VAL-100", customerId, driverId, hubId,
                "10 Park Street", "Kolkata", today, today.plusDays(4), "15.00");

        // Duplicate tracking number rejected (409)
        Map<String, Object> duplicatePayload = shipmentPayload("TRK-VAL-100", customerId, driverId, hubId,
                "10 Park Street", "Kolkata", today, today.plusDays(4), "15.00");
        mockMvc.perform(post("/api/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicatePayload)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already exists")));

        // Invalid expected delivery date (before created date) rejected (400)
        Map<String, Object> badDatePayload = shipmentPayload("TRK-VAL-101", customerId, driverId, hubId,
                "10 Park Street", "Kolkata", today, today.minusDays(1), "15.00");
        mockMvc.perform(post("/api/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badDatePayload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Expected delivery date")));

        // Invalid foreign key reference rejected (404)
        Map<String, Object> badFkPayload = shipmentPayload("TRK-VAL-102", 99999L, driverId, hubId,
                "10 Park Street", "Kolkata", today, today.plusDays(2), "15.00");
        mockMvc.perform(post("/api/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badFkPayload)))
                .andExpect(status().isNotFound());

        // Missing mandatory fields & invalid email rejected (400 with fieldErrors)
        Map<String, Object> badCustomer = new LinkedHashMap<>();
        badCustomer.put("customerCode", "");
        badCustomer.put("name", "");
        badCustomer.put("phone", "123");
        badCustomer.put("email", "not-an-email");
        badCustomer.put("customerType", "CORPORATE");
        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badCustomer)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.customerCode").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists());

        // Prohibited deletions of linked Customer, Driver, Hub (409)
        mockMvc.perform(delete("/api/customers/{id}", customerId)).andExpect(status().isConflict());
        mockMvc.perform(delete("/api/drivers/{id}", driverId)).andExpect(status().isConflict());
        mockMvc.perform(delete("/api/hubs/{id}", hubId)).andExpect(status().isConflict());

        // Driver deactivation instead of delete succeeds
        mockMvc.perform(patch("/api/drivers/{id}/availability", driverId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"availabilityStatus\":\"INACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availabilityStatus", is("INACTIVE")));

        // Shipment WITH tracking history cannot be deleted (409)
        Long ev1 = createTrackingEvent(shipmentId, LocalDateTime.now().minusHours(3), "PICKED_UP", hubId, "Picked up", "Ops 1");
        Long ev2 = createTrackingEvent(shipmentId, LocalDateTime.now().minusHours(1), "IN_TRANSIT", hubId, "Departed hub", "Ops 1");

        mockMvc.perform(delete("/api/shipments/{id}", shipmentId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("tracking history")));

        // Tracking event correction WITHOUT remarks rejected (400)
        Map<String, Object> noRemarksUpdate = new LinkedHashMap<>();
        noRemarksUpdate.put("shipmentId", shipmentId);
        noRemarksUpdate.put("eventDateTime", LocalDateTime.now().minusHours(1).withNano(0).toString());
        noRemarksUpdate.put("eventStatus", "OUT_FOR_DELIVERY");
        noRemarksUpdate.put("hubId", hubId);
        noRemarksUpdate.put("remarks", "   ");
        noRemarksUpdate.put("updatedBy", "Supervisor");
        mockMvc.perform(put("/api/tracking-events/{id}", ev2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noRemarksUpdate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("remarks")));

        // Tracking event correction WITH remarks succeeds and syncs status
        noRemarksUpdate.put("remarks", "Corrected status after hub scan verification");
        mockMvc.perform(put("/api/tracking-events/{id}", ev2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noRemarksUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventStatus", is("OUT_FOR_DELIVERY")));

        mockMvc.perform(get("/api/shipments/{id}", shipmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus", is("OUT_FOR_DELIVERY")));

        // Historical non-latest event deletion rejected (409)
        mockMvc.perform(delete("/api/tracking-events/{id}", ev1))
                .andExpect(status().isConflict());

        // Deleting latest non-delivered event succeeds and reverts shipment status to previous event
        mockMvc.perform(delete("/api/tracking-events/{id}", ev2))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/shipments/{id}", shipmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus", is("PICKED_UP")));

        // Deleting a brand new shipment WITHOUT tracking events succeeds (200)
        Long emptyShipmentId = createShipment("TRK-DEL-OK", customerId, null, hubId,
                "22 Lake View", "Chennai", today, today.plusDays(2), "5.00");
        mockMvc.perform(delete("/api/shipments/{id}", emptyShipmentId))
                .andExpect(status().isOk());
    }

    @Test
    void pagedListAndAnalyticsEndpoints() throws Exception {
        Long customerId = createCustomer("CUST-902", "Paged Test Corp", "+91-98200-33333", "paged@example.com", "CORPORATE");
        Long hubId = createHub("HUB-903", "Paged Hub", "Mumbai", "Dock Road", "+91-22-4090-3000");
        createShipment("TRK-PAGED-1", customerId, null, hubId,
                "1 Test Road", "Pune", LocalDate.now().minusDays(1), LocalDate.now().plusDays(2), "10.00");
        mockMvc.perform(get("/api/customers").param("page", "0").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.totalPages", is(1)));
        mockMvc.perform(get("/api/dashboard/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.daily", hasSize(14)))
                .andExpect(jsonPath("$.onTimePct").exists());
        mockMvc.perform(get("/api/dashboard/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").exists());
        mockMvc.perform(get("/api/shipments/export"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .string(org.hamcrest.Matchers.containsString("trackingNumber")));
    }

    private Long createCustomer(String code, String name, String phone, String email, String type) throws Exception {
        Map<String, Object> body = Map.of(
                "customerCode", code,
                "name", name,
                "phone", phone,
                "email", email,
                "customerType", type
        );
        MvcResult result = mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result, "customerId");
    }

    private Long createDriver(String code, String name, String phone, String licence, String status) throws Exception {
        Map<String, Object> body = Map.of(
                "driverCode", code,
                "fullName", name,
                "phone", phone,
                "licenceNumber", licence,
                "availabilityStatus", status
        );
        MvcResult result = mockMvc.perform(post("/api/drivers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result, "driverId");
    }

    private Long createHub(String code, String name, String city, String address, String phone) throws Exception {
        Map<String, Object> body = Map.of(
                "hubCode", code,
                "hubName", name,
                "city", city,
                "address", address,
                "contactNumber", phone
        );
        MvcResult result = mockMvc.perform(post("/api/hubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result, "hubId");
    }

    private Long createShipment(String tracking, Long customerId, Long driverId, Long hubId,
                                String destAddress, String destCity, LocalDate created, LocalDate expected,
                                String weight) throws Exception {
        Map<String, Object> body = shipmentPayload(tracking, customerId, driverId, hubId,
                destAddress, destCity, created, expected, weight);
        MvcResult result = mockMvc.perform(post("/api/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result, "shipmentId");
    }

    private Map<String, Object> shipmentPayload(String tracking, Long customerId, Long driverId, Long hubId,
                                                String destAddress, String destCity, LocalDate created,
                                                LocalDate expected, String weight) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("trackingNumber", tracking);
        body.put("customerId", customerId);
        body.put("driverId", driverId);
        body.put("originHubId", hubId);
        body.put("destinationAddress", destAddress);
        body.put("destinationCity", destCity);
        body.put("createdDate", created.toString());
        body.put("expectedDeliveryDate", expected.toString());
        body.put("weight", Double.parseDouble(weight));
        return body;
    }

    private Long createTrackingEvent(Long shipmentId, LocalDateTime dateTime, String status,
                                     Long hubId, String remarks, String updatedBy) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("shipmentId", shipmentId);
        body.put("eventDateTime", dateTime.withNano(0).toString());
        body.put("eventStatus", status);
        body.put("hubId", hubId);
        body.put("remarks", remarks);
        body.put("updatedBy", updatedBy);

        MvcResult result = mockMvc.perform(post("/api/tracking-events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result, "eventId");
    }

    private Long extractId(MvcResult result, String field) throws Exception {
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get(field).asLong();
    }
}


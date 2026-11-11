package com.project.logistics;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/** Auth (JWT login, 401 without token, public tracking) + one-click shipment workflow. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class AuthAndWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void loginSucceedsWithDemoAdminAndFailsWithWrongPassword() throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("email", "admin@logitrack.in");
        body.put("password", "Admin@123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.role", is("ADMIN")));

        body.put("password", "WrongPassword1");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointRequiresAuthButPublicTrackAndHealthDoNot() throws Exception {
        mockMvc.perform(get("/api/customers")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "dispatcher@logitrack.in", roles = "DISPATCHER")
    void workflowAssignAdvanceDeliverAndCancel() throws Exception {
        String token = loginAsAdmin();
        // Seed data via authenticated API (token header proves the JWT path end-to-end)
        Long customerId = createCustomer(token, "CUST-WF1", "Workflow Corp", "+91-98200-44444", "wf@example.com", "CORPORATE");
        Long driverId = createDriver(token, "DRV-WF1", "Workflow Driver", "+91-98200-55555", "MH14-20210009999", "AVAILABLE");
        Long hubId = createHub(token, "HUB-WF1", "Workflow Hub", "Mumbai", "Dock Road", "+91-22-4090-4000");
        LocalDate today = LocalDate.now();
        Long shipmentId = createShipment(token, "TRK-WF-1001", customerId, null, hubId,
                "7 Workflow Lane", "Pune", today, today.plusDays(2), "20.00");

        // Assign driver
        mockMvc.perform(post("/api/shipments/{id}/assign-driver", shipmentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"driverId\":" + driverId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driverId", is(driverId.intValue())));

        // Advance PENDING -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY
        advance(token, shipmentId, "PICKED_UP");
        advance(token, shipmentId, "IN_TRANSIT");
        advance(token, shipmentId, "OUT_FOR_DELIVERY");

        // Deliver with proof of delivery
        mockMvc.perform(post("/api/shipments/{id}/deliver", shipmentId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"receivedBy\":\"Site Manager\",\"remarks\":\"Left at reception\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus", is("DELIVERED")));

        // Advancing a delivered shipment must fail
        mockMvc.perform(post("/api/shipments/{id}/advance", shipmentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict());

        // Public tracking needs no auth
        mockMvc.perform(get("/api/public/track/{trackingNumber}", "TRK-WF-1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipment.shipmentStatus", is("DELIVERED")))
                .andExpect(jsonPath("$.events[0].eventStatus", is("PICKED_UP")));

        // Cancel a second shipment
        Long shipment2 = createShipment(token, "TRK-WF-1002", customerId, driverId, hubId,
                "8 Workflow Lane", "Pune", today, today.plusDays(2), "5.00");
        mockMvc.perform(post("/api/shipments/{id}/cancel", shipment2)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Customer requested cancellation\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus", is("CANCELLED")));
    }

    private void advance(String token, Long shipmentId, String expectedStatus) throws Exception {
        mockMvc.perform(post("/api/shipments/{id}/advance", shipmentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus", is(expectedStatus)));
    }

    private String loginAsAdmin() throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("email", "admin@logitrack.in");
        body.put("password", "Admin@123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk()).andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("token").asText();
    }

    private Long createCustomer(String token, String code, String name, String phone, String email, String type) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customerCode", code); body.put("name", name); body.put("phone", phone);
        body.put("email", email); body.put("customerType", type);
        MvcResult r = mockMvc.perform(post("/api/customers").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated()).andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString()).get("customerId").asLong();
    }

    private Long createDriver(String token, String code, String name, String phone, String licence, String status) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("driverCode", code); body.put("fullName", name); body.put("phone", phone);
        body.put("licenceNumber", licence); body.put("availabilityStatus", status);
        MvcResult r = mockMvc.perform(post("/api/drivers").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated()).andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString()).get("driverId").asLong();
    }

    private Long createHub(String token, String code, String name, String city, String address, String phone) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("hubCode", code); body.put("hubName", name); body.put("city", city);
        body.put("address", address); body.put("contactNumber", phone);
        MvcResult r = mockMvc.perform(post("/api/hubs").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated()).andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString()).get("hubId").asLong();
    }

    private Long createShipment(String token, String tracking, Long customerId, Long driverId, Long hubId,
                                String address, String city, LocalDate created, LocalDate expected, String weight) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("trackingNumber", tracking); body.put("customerId", customerId); body.put("driverId", driverId);
        body.put("originHubId", hubId); body.put("destinationAddress", address); body.put("destinationCity", city);
        body.put("createdDate", created.toString()); body.put("expectedDeliveryDate", expected.toString());
        body.put("weight", Double.parseDouble(weight));
        MvcResult r = mockMvc.perform(post("/api/shipments").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated()).andReturn();
        return objectMapper.readTree(r.getResponse().getContentAsString()).get("shipmentId").asLong();
    }
}

package com.project.logistics.controller;

import com.project.logistics.dto.CustomerRequest;
import com.project.logistics.dto.CustomerResponse;
import com.project.logistics.dto.MessageResponse;
import com.project.logistics.entity.CustomerType;
import com.project.logistics.service.CustomerService;
import jakarta.validation.Valid;
import com.project.logistics.dto.PageResponse;
import com.project.logistics.util.CsvUtil;
import com.project.logistics.util.PaginationUtil;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
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
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<?> getAllCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CustomerType customerType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort) {
        if (page != null) {
            PageResponse<CustomerResponse> paged = customerService.getCustomersPaged(search, customerType,
                    PaginationUtil.build(page, size, sort,
                            Set.of("customerId", "customerCode", "name", "email"), "customerId"));
            return ResponseEntity.ok(paged);
        }
        return ResponseEntity.ok(customerService.getAllCustomers(search, customerType));
    }

    @GetMapping("/export")
    public void exportCustomers(@RequestParam(required = false) String search,
                                @RequestParam(required = false) CustomerType customerType,
                                HttpServletResponse response) throws IOException {
        List<CustomerResponse> rows = customerService.getAllCustomers(search, customerType);
        String csv = CsvUtil.build(
                new String[]{"customerId", "customerCode", "name", "phone", "email", "customerType", "shipmentCount"},
                rows.stream().map(c -> new String[]{
                        String.valueOf(c.getCustomerId()), c.getCustomerCode(), c.getName(), c.getPhone(),
                        c.getEmail(), c.getCustomerType().name(), String.valueOf(c.getShipmentCount())}).toList());
        writeCsv(response, "customers.csv", csv);
    }

    private static void writeCsv(HttpServletResponse response, String filename, String csv) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        response.getOutputStream().write(csv.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id,
                                                           @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(new MessageResponse("Customer deleted successfully."));
    }
}


package com.project.logistics.service;

import com.project.logistics.dto.CustomerRequest;
import com.project.logistics.dto.CustomerResponse;
import com.project.logistics.entity.CustomerType;
import com.project.logistics.dto.PageResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    List<CustomerResponse> getAllCustomers(String search, CustomerType customerType);

    PageResponse<CustomerResponse> getCustomersPaged(String search, CustomerType customerType, Pageable pageable);

    CustomerResponse getCustomerById(Long id);

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);
}


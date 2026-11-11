package com.project.logistics.service;

import com.project.logistics.dto.CustomerRequest;
import com.project.logistics.dto.CustomerResponse;
import com.project.logistics.entity.CustomerType;
import java.util.List;

public interface CustomerService {

    List<CustomerResponse> getAllCustomers(String search, CustomerType customerType);

    CustomerResponse getCustomerById(Long id);

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);
}


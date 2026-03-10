package com.campusbite2.campusbite2.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private Long userId;
    private BigDecimal totalAmount;
    private List<OrderItemRequest> items;
}

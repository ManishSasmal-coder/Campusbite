package com.campusbite2.campusbite2.dto;

import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private String status; // PLACED, PREPARING, READY, COLLECTED
    private Long chefId; // Used when a chef claims an order
}

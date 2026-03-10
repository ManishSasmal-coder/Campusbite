package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepo extends JpaRepository<OrderItem,Long> {
    List<OrderItem> findByMenuItem_MenuItemId(Long menuItemId);
}

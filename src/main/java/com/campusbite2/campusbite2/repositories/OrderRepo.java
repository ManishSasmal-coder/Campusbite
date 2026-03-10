package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepo extends JpaRepository<Order, Long> {
    List<Order> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByChef_ChefIdOrderByCreatedAtDesc(Long chefId);
    List<Order> findAllByOrderByCreatedAtDesc();
}

package com.campusbite2.campusbite2.controllers;

import com.campusbite2.campusbite2.dto.OrderItemRequest;
import com.campusbite2.campusbite2.dto.OrderRequest;
import com.campusbite2.campusbite2.dto.OrderStatusUpdateRequest;
import com.campusbite2.campusbite2.models.MenuItem;
import com.campusbite2.campusbite2.models.Order;
import com.campusbite2.campusbite2.models.OrderItem;
import com.campusbite2.campusbite2.models.Users;
import com.campusbite2.campusbite2.repositories.MenuItemRepo;
import com.campusbite2.campusbite2.repositories.OrderItemRepo;
import com.campusbite2.campusbite2.repositories.OrderRepo;
import com.campusbite2.campusbite2.repositories.UsersRepo;
import com.campusbite2.campusbite2.repositories.ChefRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin( origins = "*")
@Transactional
public class OrderController {
    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private UsersRepo usersRepo;

    @Autowired
    private MenuItemRepo menuItemRepo;
    
    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private ChefRepo chefRepo;

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {
        Optional<Users> optUser = usersRepo.findById(request.getUserId());
        if (!optUser.isPresent()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        Order order = new Order();
        order.setUser(optUser.get());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus("PLACED");
        
        Order savedOrder = orderRepo.save(order);
        
        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest reqItem : request.getItems()) {
            Optional<MenuItem> menuOpt = menuItemRepo.findById(reqItem.getMenuItemId());
            if (menuOpt.isPresent()) {
                MenuItem menuItem = menuOpt.get();
                OrderItem item = new OrderItem();
                item.setOrder(savedOrder);
                item.setMenuItem(menuItem);
                item.setItem_name(menuItem.getName());
                item.setPriceAtOrder(menuItem.getPrice());
                item.setQuantity(reqItem.getQuantity());
                items.add(orderItemRepo.save(item));
            }
        }
        savedOrder.setOrderItems(items);
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long id) {
        List<Order> orders = orderRepo.findByUser_UserIdOrderByCreatedAtDesc(id);
        List<Order> result = new ArrayList<>();
        for (Order o : orders) {
            if (o.getDeletedByUser() == null || !o.getDeletedByUser()) {
                result.add(o);
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/chef/{id}")
    public ResponseEntity<List<Order>> getChefOrders(@PathVariable Long id) {
        // Return active orders that are unassigned OR assigned to this exact chef
        List<Order> allOrders = orderRepo.findAllByOrderByCreatedAtDesc();
        List<Order> result = new ArrayList<>();
        for (Order o : allOrders) {
            if ("PLACED".equalsIgnoreCase(o.getStatus())) {
                result.add(o);
            } else if (o.getChef() != null && o.getChef().getChefId().equals(id)) {
                result.add(o);
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepo.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        Optional<Order> optOrder = orderRepo.findById(id);
        if (optOrder.isPresent()) {
            Order order = optOrder.get();
            // Optional check for cancelled
            if ("CANCELLED".equalsIgnoreCase(request.getStatus()) && !"PLACED".equals(order.getStatus())) {
                return ResponseEntity.badRequest().body("Cannot cancel after preparation started.");
            }
            String newStatus = request.getStatus().toUpperCase();
            order.setStatus(newStatus);
            
            if ("PREPARING".equals(newStatus)) {
                order.setPreparationStartedAt(java.time.LocalDateTime.now());
                int maxTime = 0;
                if (order.getOrderItems() != null) {
                    for (OrderItem item : order.getOrderItems()) {
                        if (item.getMenuItem() != null && item.getMenuItem().getPreparationTime() != null) {
                            maxTime = Math.max(maxTime, item.getMenuItem().getPreparationTime());
                        }
                    }
                }
                order.setTotalEstimatedTime(maxTime);
            }

            if (request.getChefId() != null) {
                chefRepo.findById(request.getChefId()).ifPresent(order::setChef);
            }
            orderRepo.save(order);
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}/user")
    public ResponseEntity<?> hideUserOrder(@PathVariable Long id) {
        Optional<Order> optOrder = orderRepo.findById(id);
        if (optOrder.isPresent()) {
            Order order = optOrder.get();
            order.setDeletedByUser(true);
            orderRepo.save(order);
            return ResponseEntity.ok().body("Deleted from user history");
        }
        return ResponseEntity.notFound().build();
    }
}

package com.campusbite2.campusbite2.controllers;

import com.campusbite2.campusbite2.models.MenuItem;
import com.campusbite2.campusbite2.models.OrderItem;
import com.campusbite2.campusbite2.repositories.MenuItemRepo;
import com.campusbite2.campusbite2.repositories.OrderItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin( origins = "*")
public class MenuItemController {
    @Autowired
    MenuItemRepo menuItemRepo;

    @Autowired
    OrderItemRepo orderItemRepo;

    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<MenuItem> addMenuItem(@RequestBody MenuItem menuItem) {
        if(menuItem.getImageUrl() == null || menuItem.getImageUrl().isEmpty()) {
            menuItem.setImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=2000&ixlib=rb-4.0.3"); // default food image
        }
        MenuItem saved = menuItemRepo.save(menuItem);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updatedItem) {
        return menuItemRepo.findById(id).map(existing -> {
            existing.setName(updatedItem.getName());
            existing.setDescription(updatedItem.getDescription());
            existing.setPrice(updatedItem.getPrice());
            existing.setType(updatedItem.getType());
            existing.setImageUrl(updatedItem.getImageUrl());
            existing.setPreparationTime(updatedItem.getPreparationTime());
            return ResponseEntity.ok(menuItemRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        if(menuItemRepo.existsById(id)) {
            List<OrderItem> orderItems = orderItemRepo.findByMenuItem_MenuItemId(id);
            for(OrderItem item : orderItems) {
                item.setMenuItem(null);
            }
            orderItemRepo.saveAll(orderItems);
            menuItemRepo.deleteById(id);
            return ResponseEntity.ok().body("Deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}

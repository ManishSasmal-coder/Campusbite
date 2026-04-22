package com.campusbite2.campusbite2.controllers;


import com.campusbite2.campusbite2.models.Chef;
import com.campusbite2.campusbite2.repositories.AdminRepo;
import com.campusbite2.campusbite2.repositories.ChefRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin( origins = "*")
public class AdminController {
    @Autowired
    AdminRepo adminRepo;

    @Autowired
    private ChefRepo chefRepo;

    @GetMapping("/chefs")
    public List<Chef> getAllChefs() {
        return chefRepo.findAll();
    }

    @PostMapping("/chefs")
    public ResponseEntity<Chef> addChef(@RequestBody Chef chef, @RequestParam(required = false) Long adminId) {
        chef.setCreatedAt(LocalDateTime.now());
        chef.setActive(true);
        if (adminId != null) {
            adminRepo.findById(adminId).ifPresent(chef::setAdmin);
        }
        Chef saved = chefRepo.save(chef);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/chefs/{id}")
    public ResponseEntity<Chef> updateChef(@PathVariable Long id, @RequestBody Chef updatedChef) {
        return chefRepo.findById(id).map(existing -> {
            existing.setUsername(updatedChef.getUsername());
            existing.setFullName(updatedChef.getFullName());
            if (updatedChef.getPassword() != null && !updatedChef.getPassword().isEmpty()) {
                existing.setPassword(updatedChef.getPassword());
            }
            return ResponseEntity.ok(chefRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/chefs/{id}")
    public ResponseEntity<?> deleteChef(@PathVariable Long id) {
        if(chefRepo.existsById(id)) {
            chefRepo.deleteById(id);
            return ResponseEntity.ok().body("Deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}

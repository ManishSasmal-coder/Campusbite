package com.campusbite2.campusbite2.controllers;

import com.campusbite2.campusbite2.dto.LoginRequest;
import com.campusbite2.campusbite2.dto.SignupRequest;
import com.campusbite2.campusbite2.models.Admin;
import com.campusbite2.campusbite2.models.Chef;
import com.campusbite2.campusbite2.models.Users;
import com.campusbite2.campusbite2.repositories.AdminRepo;
import com.campusbite2.campusbite2.repositories.ChefRepo;
import com.campusbite2.campusbite2.repositories.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UsersRepo usersRepo;

    @Autowired
    private ChefRepo chefRepo;

    @Autowired
    private AdminRepo adminRepo;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        // Only for student signup
        if (usersRepo.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        Users user = Users.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email_id(request.getEmail_id())
                .password(request.getPassword()) // plain text for testing, usually should hash
                .build();
        usersRepo.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", user.getUserId());
        response.put("role", "STUDENT");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";
        Map<String, Object> response = new HashMap<>();
        if ("ADMIN".equals(role)) {
            // Check Admin
            // for demo admin might not exist initially, let's let one through if none, or check
            Admin admin = adminRepo.findByUsername(request.getUsername());
            if (admin != null && admin.getPassword().equals(request.getPassword())) {
                response.put("userId", admin.getAdminId());
                response.put("role", "ADMIN");
                response.put("username", admin.getUsername());
                return ResponseEntity.ok(response);
            }
            // HACK for first admin if repo empty
            if (adminRepo.count() == 0 && "admin".equals(request.getUsername())) {
                Admin newAdmin = new Admin();
                newAdmin.setUsername("admin");
                newAdmin.setPassword(request.getPassword());
                newAdmin.setFullName("Super Admin");
                adminRepo.save(newAdmin);
                response.put("userId", newAdmin.getAdminId());
                response.put("role", "ADMIN");
                response.put("username", newAdmin.getUsername());
                return ResponseEntity.ok(response);
            }
        } else if ("CHEF".equals(role)) {
            Chef chef = chefRepo.findByUsername(request.getUsername());
            if (chef != null && chef.getPassword().equals(request.getPassword())) {
                response.put("userId", chef.getChefId());
                response.put("role", "CHEF");
                response.put("username", chef.getUsername());
                return ResponseEntity.ok(response);
            }
        } else {
            // "STUDENT"
            Optional<Users> optUser = usersRepo.findByUsername(request.getUsername());
            if (optUser.isPresent()) {
                Users user = optUser.get();
                if (user.getPassword().equals(request.getPassword())) {
                    response.put("userId", user.getUserId());
                    response.put("role", "STUDENT");
                    response.put("username", user.getUsername());
                    response.put("fullName", user.getFullName());
                    return ResponseEntity.ok(response);
                }
            }
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}

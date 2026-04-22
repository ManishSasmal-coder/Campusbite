package com.campusbite2.campusbite2.controllers;

import com.campusbite2.campusbite2.models.MenuItem;
import com.campusbite2.campusbite2.models.Review;
import com.campusbite2.campusbite2.models.Users;
import com.campusbite2.campusbite2.repositories.MenuItemRepo;
import com.campusbite2.campusbite2.repositories.ReviewRepo;
import com.campusbite2.campusbite2.repositories.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    ReviewRepo reviewRepo;

    @Autowired
    MenuItemRepo menuItemRepo;

    @Autowired
    UsersRepo usersRepo;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long menuItemId = Long.valueOf(payload.get("menuItemId").toString());
            Integer rating = Integer.valueOf(payload.get("rating").toString());
            String comment = payload.get("comment").toString();

            Users user = usersRepo.findById(userId).orElseThrow();
            MenuItem menuItem = menuItemRepo.findById(menuItemId).orElseThrow();

            Review review = new Review();
            review.setUser(user);
            review.setMenuItem(menuItem);
            review.setRating(rating);
            review.setComment(comment);

            Review saved = reviewRepo.save(review);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/item/{itemId}")
    public List<Review> getReviewsByItem(@PathVariable Long itemId) {
        return reviewRepo.findByMenuItemMenuItemId(itemId);
    }

    @GetMapping("/stats/{itemId}")
    public ResponseEntity<?> getReviewStats(@PathVariable Long itemId) {
        List<Review> reviews = reviewRepo.findByMenuItemMenuItemId(itemId);
        double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", average);
        stats.put("totalReviews", reviews.size());
        
        return ResponseEntity.ok(stats);
    }
}

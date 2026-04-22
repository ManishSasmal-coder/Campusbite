package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findByMenuItemMenuItemId(Long menuItemId);
}

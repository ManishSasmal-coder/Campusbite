package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.Chef;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChefRepo extends JpaRepository<Chef, Long> {
    Chef findByUsername(String username);
}

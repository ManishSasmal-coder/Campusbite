package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepo extends JpaRepository<Admin, Long> {
    Admin findByUsername(String username);
}

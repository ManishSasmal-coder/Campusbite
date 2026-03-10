package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepo extends JpaRepository<MenuItem, Long> {
}

package com.campusbite2.campusbite2.repositories;

import com.campusbite2.campusbite2.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersRepo extends JpaRepository<Users, Long> {
    Optional<Users> findByUsername(String username);
}

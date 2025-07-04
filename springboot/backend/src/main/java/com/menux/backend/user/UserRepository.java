package com.menux.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // JpaRepository provides basic CRUD operations for User entity
    // You can add custom query methods here if needed, e.g., findByEmail
}

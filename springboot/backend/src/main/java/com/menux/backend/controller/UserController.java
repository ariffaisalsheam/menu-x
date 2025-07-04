package com.menux.backend.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.menux.backend.user.User;
import com.menux.backend.user.UserPlan;
import com.menux.backend.user.UserRepository;
import com.menux.backend.user.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Endpoint to create or update user profile after Firebase login
    // Frontend will send Firebase ID Token in Authorization header
    @PostMapping("/profile")
    public ResponseEntity<User> createUserProfile(@RequestHeader("Authorization") String idToken) {
        if (idToken == null || !idToken.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String firebaseToken = idToken.substring(7); // Remove "Bearer " prefix

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(firebaseToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String displayName = decodedToken.getName();

            // Check if user already exists in our DB
            Optional<User> existingUser = userRepository.findById(uid);

            User user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update existing user details if necessary
                user.setEmail(email);
                user.setDisplayName(displayName);
                // Do not change role/plan automatically here; these are admin-managed
            } else {
                // Create new user with default role/plan
                user = new User(uid, email, displayName, UserRole.DINER, UserPlan.FREE);
            }

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint to get user profile by UID (might be used by Super Admin)
    @GetMapping("/profile/{uid}")
    public ResponseEntity<User> getUserProfile(@PathVariable String uid) {
        Optional<User> user = userRepository.findById(uid);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Example endpoint for Super Admin to update user role/plan
    // This would need proper authorization checks in a real application
    @PutMapping("/profile/{uid}/update-plan")
    public ResponseEntity<User> updateUserPlan(@PathVariable String uid, @RequestBody Map<String, String> updates) {
        Optional<User> userOptional = userRepository.findById(uid);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        if (updates.containsKey("role")) {
            try {
                user.setRole(UserRole.valueOf(updates.get("role").toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(null);
            }
        }
        if (updates.containsKey("plan")) {
            try {
                user.setPlan(UserPlan.valueOf(updates.get("plan").toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(null);
            }
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}

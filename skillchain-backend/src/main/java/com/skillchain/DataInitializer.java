package com.skillchain;

import com.skillchain.entity.Skill;
import com.skillchain.entity.User;
import com.skillchain.entity.Role; // ← Use entity package
import com.skillchain.repository.SkillRepository;
import com.skillchain.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initData() {
        // Insert test user only if not exists
        if (userRepository.findByUsername("prera").isEmpty()) {
            User testUser = new User();
            testUser.setUsername("prera");
            testUser.setEmail("prera@example.com");
            testUser.setPassword(passwordEncoder.encode("temp123")); // Hash the password
            testUser.setFullName("Prera Shetty");
            testUser.setBio("Learning Java and building SkillChain!");
            testUser.setLocation("India");
            testUser.setPoints(100);
            testUser.setRole(Role.USER);

            userRepository.save(testUser);
            System.out.println("Test user 'prera' inserted!");
        } else {
            System.out.println("Test user 'prera' already exists — skipping.");
        }

        // Insert skills only if not exists
        insertSkillIfNotExists("Java Programming", "Programming", "Core Java and OOP concepts");
        insertSkillIfNotExists("Spring Boot", "Programming", "Building web apps with Spring");
        insertSkillIfNotExists("React JS", "Frontend", "Modern frontend with React");

        System.out.println("Initial data setup complete!");
    }

    private void insertSkillIfNotExists(String name, String category, String description) {
        if (skillRepository.findByName(name).isEmpty()) {
            Skill skill = new Skill();
            skill.setName(name);
            skill.setCategory(category);
            skill.setDescription(description);
            skillRepository.save(skill);
            System.out.println("Skill '" + name + "' inserted!");
        } else {
            System.out.println("Skill '" + name + "' already exists — skipping.");
        }
    }
}
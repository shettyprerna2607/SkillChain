package com.skillchain.controller;

import com.skillchain.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillChainRepository skillChainRepository;

    @GetMapping("/stats")
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSessions", sessionRepository.count());
        stats.put("totalSkills", skillRepository.count());
        stats.put("totalChains", skillChainRepository.count());

        // Count active sessions
        long activeSessions = sessionRepository.findAll().stream()
                .filter(s -> s.getStatus().toString().equals("ACCEPTED") || s.getStatus().toString().equals("PENDING"))
                .count();
        stats.put("activeSessions", activeSessions);

        return stats;
    }

    @GetMapping("/users")
    public java.util.List<com.skillchain.entity.User> getAllUsers() {
        return userRepository.findAll();
    }
}

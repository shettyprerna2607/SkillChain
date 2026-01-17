package com.skillchain.controller;

import com.skillchain.entity.Badge;
import com.skillchain.entity.User;
import com.skillchain.repository.BadgeRepository;
import com.skillchain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my")
    public List<Badge> getMyBadges(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return badgeRepository.findByUserIdOrderByAwardedAtDesc(user.getId());
    }

    @GetMapping("/user/{userId}")
    public List<Badge> getUserBadges(@PathVariable Long userId) {
        return badgeRepository.findByUserIdOrderByAwardedAtDesc(userId);
    }
}

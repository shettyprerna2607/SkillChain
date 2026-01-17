package com.skillchain.controller;

import com.skillchain.dto.LeaderboardDTO;
import com.skillchain.entity.User;
import com.skillchain.repository.BadgeRepository;
import com.skillchain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @GetMapping
    public List<LeaderboardDTO> getTopUsers() {
        List<User> users = userRepository.findAll();

        List<LeaderboardDTO> leaderboard = users.stream()
                .map(u -> {
                    long badgeCount = badgeRepository.findByUserIdOrderByAwardedAtDesc(u.getId()).size();
                    return new LeaderboardDTO(u.getUsername(), u.getFullName(), u.getPoints(), badgeCount, 0);
                })
                // Sort by points desc, then badges desc
                .sorted((a, b) -> {
                    if (b.getPoints() != a.getPoints())
                        return b.getPoints() - a.getPoints();
                    return (int) (b.getBadgeCount() - a.getBadgeCount());
                })
                .collect(Collectors.toList());

        // Assign ranks
        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).setRank(i + 1);
        }

        return leaderboard.stream().limit(10).collect(Collectors.toList());
    }
}

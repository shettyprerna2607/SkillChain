package com.skillchain.controller;

import com.skillchain.entity.*;
import com.skillchain.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stakes")
public class StakeController {

    @Autowired
    private UserChainStakeRepository stakeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillChainRepository skillChainRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private com.skillchain.service.GamificationService gamificationService;

    @GetMapping("/my")
    public List<UserChainStake> getMyStakes(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return stakeRepository.findByUserId(user.getId());
    }

    @PostMapping("/chain/{chainId}")
    public UserChainStake createStake(@PathVariable Long chainId, @RequestBody Map<String, Integer> payload,
            Authentication authentication) {
        int amount = payload.get("amount");
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();

        if (user.getPoints() < amount) {
            throw new RuntimeException("Insufficient points to stake!");
        }

        SkillChain chain = skillChainRepository.findById(chainId).orElseThrow();

        // Check if already staked
        if (stakeRepository.findByUserIdAndSkillChainIdAndCompletedFalseAndFailedFalse(user.getId(), chainId)
                .isPresent()) {
            throw new RuntimeException("You already have an active stake on this chain!");
        }

        // Deduct points
        user.setPoints(user.getPoints() - amount);
        userRepository.save(user);

        UserChainStake stake = new UserChainStake();
        stake.setUser(user);
        stake.setSkillChain(chain);
        stake.setAmount(amount);
        // Default 30 day deadline
        stake.setDeadline(LocalDateTime.now().plusDays(30));

        return stakeRepository.save(stake);
    }

    @PostMapping("/{stakeId}/check")
    public Map<String, Object> checkCompletion(@PathVariable Long stakeId, Authentication authentication) {
        UserChainStake stake = stakeRepository.findById(stakeId).orElseThrow();
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();

        if (!stake.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (stake.isCompleted() || stake.isFailed()) {
            return Map.of("status", "already_processed", "stake", stake);
        }

        // Check if deadline passed
        if (LocalDateTime.now().isAfter(stake.getDeadline())) {
            stake.setFailed(true);
            stakeRepository.save(stake);
            return Map.of("status", "failed_deadline", "message", "Deadline has passed. Points lost.");
        }

        // Check if all skills in chain are in user's learned skills
        List<Long> chainSkillIds = stake.getSkillChain().getNodes().stream()
                .map(node -> node.getSkill().getId())
                .collect(Collectors.toList());

        List<Long> learnedSkillIds = userSkillRepository.findByUserId(user.getId()).stream()
                .filter(us -> us.getType() == SkillType.LEARN)
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toList());

        boolean allLearned = learnedSkillIds.containsAll(chainSkillIds);

        if (allLearned) {
            stake.setCompleted(true);
            stake.setRedeemed(true);

            // Reward: Original Stake + Bonus based on Multiplier
            double multiplier = gamificationService.getMultiplier(user);
            int reward = (int) (stake.getAmount() * multiplier);

            user.setPoints(user.getPoints() + reward);
            userRepository.save(user);
            stakeRepository.save(stake);
            return Map.of("status", "completed", "reward", reward, "message",
                    "Congratulations! You earned your points back plus a 50% bonus!");
        }

        long skillsNeeded = chainSkillIds.stream().filter(id -> !learnedSkillIds.contains(id)).count();
        return Map.of("status", "in_progress", "skills_needed", skillsNeeded);
    }
}

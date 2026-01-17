package com.skillchain.controller;

import com.skillchain.entity.*;
import com.skillchain.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillChainRepository skillChainRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private com.skillchain.service.LLMService llmService;

    @PostMapping("/claim-xp")
    public Map<String, Object> claimXP(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        user.setPoints(user.getPoints() + 1000);
        userRepository.save(user);
        return Map.of("message", "1000 XP granted!", "newPoints", user.getPoints());
    }

    @PostMapping("/coach")
    public Map<String, Object> getCoachAdvice(@RequestBody Map<String, String> request, Authentication authentication) {
        String query = request.get("query");
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        List<UserSkill> mySkills = userSkillRepository.findByUserId(user.getId());
        List<SkillChain> allChains = skillChainRepository.findAll();

        return llmService.getAdvancedAdvice(query, user, mySkills, allChains);
    }
}

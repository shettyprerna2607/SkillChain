package com.skillchain.controller;

import com.skillchain.entity.SkillChain;
import com.skillchain.repository.SkillChainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-chains")
public class SkillChainController {

    @Autowired
    private SkillChainRepository skillChainRepository;

    @GetMapping
    public List<SkillChain> getAllChains() {
        return skillChainRepository.findAll();
    }

    @GetMapping("/{id}")
    public SkillChain getChainById(@PathVariable Long id) {
        return skillChainRepository.findById(id).orElseThrow();
    }
}

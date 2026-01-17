package com.skillchain.config;

import com.skillchain.entity.*;
import com.skillchain.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private SkillChainRepository skillChainRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create an Admin user if not exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@skillchain.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Default Admin created: admin/admin123");
        }

        // Ensure generic skills exist
        Skill html = getOrCreateSkill("HTML", "Web Dev");
        Skill css = getOrCreateSkill("CSS", "Web Dev");
        Skill js = getOrCreateSkill("JavaScript", "Web Dev");
        Skill react = getOrCreateSkill("React", "Web Dev");
        Skill java = getOrCreateSkill("Java", "Programming");
        Skill spring = getOrCreateSkill("Spring Boot", "Backend");

        // 1. Full Stack Developer Chain
        if (skillChainRepository.findAll().stream().noneMatch(c -> c.getTitle().contains("Full-Stack"))) {
            SkillChain webDev = new SkillChain();
            webDev.setTitle("Full-Stack Web Architect");
            webDev.setDescription("Master the art of building modern web applications from scratch.");
            webDev.setCategory("Development");
            webDev.setIcon("🌐");

            createNode(webDev, html, 1, "The skeleton of the web.");
            createNode(webDev, css, 2, "Styling and responsiveness.");
            createNode(webDev, js, 3, "Interactivity and logic.");
            createNode(webDev, react, 4, "Modern frontend framework.");

            skillChainRepository.save(webDev);
        }

        // 2. Pro Backend Engineer Chain
        if (skillChainRepository.findAll().stream().noneMatch(c -> c.getTitle().contains("Backend Master"))) {
            SkillChain backend = new SkillChain();
            backend.setTitle("Enterprise Backend Master");
            backend.setDescription("Deep dive into server-side logic and robust architectures.");
            backend.setCategory("Development");
            backend.setIcon("⚙️");

            createNode(backend, java, 1, "The core language.");
            createNode(backend, spring, 2, "Building REST APIs.");

            skillChainRepository.save(backend);
        }

        // 3. Data Science Pioneer
        if (skillChainRepository.findAll().stream().noneMatch(c -> c.getTitle().contains("Data Science"))) {
            SkillChain dataScience = new SkillChain();
            dataScience.setTitle("Data Science Roadmap");
            dataScience.setDescription("Transform raw data into actionable insights using Python and statistics.");
            dataScience.setCategory("Data");
            dataScience.setIcon("📊");

            Skill python = getOrCreateSkill("Python", "Programming");
            Skill stats = getOrCreateSkill("Statistics", "Math");
            Skill ml = getOrCreateSkill("Machine Learning", "Data Science");

            createNode(dataScience, python, 1, "The foundation of data science.");
            createNode(dataScience, stats, 2, "Understanding data distributions.");
            createNode(dataScience, ml, 3, "Building predictive models.");

            skillChainRepository.save(dataScience);
        }

        // 4. Digital Marketing Growth
        if (skillChainRepository.findAll().stream().noneMatch(c -> c.getTitle().contains("Growth Marketing"))) {
            SkillChain marketing = new SkillChain();
            marketing.setTitle("Growth Marketing Strategy");
            marketing.setDescription("Learn to scale products using SEO, Social Media, and Analytics.");
            marketing.setCategory("Marketing");
            marketing.setIcon("📈");

            Skill seo = getOrCreateSkill("SEO", "Marketing");
            Skill ads = getOrCreateSkill("Google Ads", "Marketing");
            Skill content = getOrCreateSkill("Content Strategy", "Marketing");

            createNode(marketing, seo, 1, "Organic search optimization.");
            createNode(marketing, ads, 2, "Paid acquisition strategies.");
            createNode(marketing, content, 3, "Building a brand voice.");

            skillChainRepository.save(marketing);
        }

        // 5. UI/UX Creative
        if (skillChainRepository.findAll().stream().noneMatch(c -> c.getTitle().contains("UI/UX Design"))) {
            SkillChain uiux = new SkillChain();
            uiux.setTitle("UI/UX Design Masterclass");
            uiux.setDescription("Design intuitive and beautiful user experiences from wireframes to high-fidelity.");
            uiux.setCategory("Design");
            uiux.setIcon("🎨");

            Skill figma = getOrCreateSkill("Figma", "Design Tools");
            Skill uxInfo = getOrCreateSkill("Information Architecture", "UX Design");
            Skill prototyping = getOrCreateSkill("Interactive Prototyping", "UI Design");

            createNode(uiux, figma, 1, "Mastering the industry standard tool.");
            createNode(uiux, uxInfo, 2, "Structuring user flows.");
            createNode(uiux, prototyping, 3, "Bringing designs to life.");

            skillChainRepository.save(uiux);
        }

        // Initialize Chat Rooms
        createChatRoom("Web Dev Lounge", "Discuss React, Node, and more.", "Development", "🌐");
        createChatRoom("Design District", "Share Figma tips and UX research.", "Design", "🎨");
        createChatRoom("Data Den", "Python, ML, and Big Data talk.", "Data", "📊");
        createChatRoom("Business Bay", "Marketing and Strategy discussions.", "Business", "📈");
        createChatRoom("General", "Hang out and meet fellow learners.", "Community", "🤝");

        System.out.println("Skill Chain and Community Library verified!");
    }

    private Skill getOrCreateSkill(String name, String cat) {
        return skillRepository.findByName(name).orElseGet(() -> {
            Skill s = new Skill();
            s.setName(name);
            s.setCategory(cat);
            return skillRepository.save(s);
        });
    }

    private void createNode(SkillChain chain, Skill skill, int order, String desc) {
        SkillChainNode node = new SkillChainNode();
        node.setSkillChain(chain);
        node.setSkill(skill);
        node.setSequenceOrder(order);
        node.setDescription(desc);
        chain.getNodes().add(node);
    }

    private void createChatRoom(String name, String desc, String cat, String icon) {
        if (chatRoomRepository.findByName(name).isEmpty()) {
            ChatRoom room = new ChatRoom();
            room.setName(name);
            room.setDescription(desc);
            room.setCategory(cat);
            room.setIcon(icon);
            chatRoomRepository.save(room);
        }
    }
}

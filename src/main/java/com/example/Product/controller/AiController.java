package com.example.Product.controller;

import com.example.Product.dto.*;
import com.example.Product.model.Product;
import com.example.Product.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * AI Controller — exposes all 5 AI feature endpoints:
 *
 *  POST /api/ai/query         — Feature 1: NL → SQL → DB → AI explanation
 *  GET  /api/ai/insights      — Feature 2: AI Business Analyst
 *  POST /api/ai/consult       — Feature 3: AI Product Consultant
 *  GET  /api/ai/scores        — Feature 4: AI Recommendation Engine (all products scored)
 *  GET  /api/ai/scores/top    — Feature 4: Top products by category
 *  GET  /api/ai/search        — Feature 5: Natural Language Search
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final NlQueryService nlQueryService;
    private final BusinessAnalystService businessAnalystService;
    private final ProductConsultantService consultantService;
    private final RecommendationEngineService recommendationEngineService;
    private final NlSearchService nlSearchService;
    private final AiCacheService aiCacheService;

    public AiController(NlQueryService nlQueryService,
                        BusinessAnalystService businessAnalystService,
                        ProductConsultantService consultantService,
                        RecommendationEngineService recommendationEngineService,
                        NlSearchService nlSearchService,
                        AiCacheService aiCacheService) {
        this.nlQueryService = nlQueryService;
        this.businessAnalystService = businessAnalystService;
        this.consultantService = consultantService;
        this.recommendationEngineService = recommendationEngineService;
        this.nlSearchService = nlSearchService;
        this.aiCacheService = aiCacheService;
    }

    // ==============================
    // Feature 1: AI Chat with Database
    // POST /api/ai/query
    // Body: { "query": "Show Samsung phones under ₹50,000" }
    // ==============================
    @PostMapping("/query")
    public ResponseEntity<AiQueryResponse> query(
            @Valid @RequestBody AiQueryRequest request) {
        String cacheKey = aiCacheService.key("nlquery", request.getQuery());
        Optional<Object> cached = aiCacheService.get(cacheKey);
        if (cached.isPresent()) {
            return ResponseEntity.ok()
                    .header("X-Cache", "HIT")
                    .body((AiQueryResponse) cached.get());
        }
        AiQueryResponse response = nlQueryService.query(request.getQuery());
        aiCacheService.put(cacheKey, response);
        return ResponseEntity.ok()
                .header("X-Cache", "MISS")
                .body(response);
    }

    // ==============================
    // Feature 2: AI Business Analyst
    // GET /api/ai/insights
    // ==============================
    @GetMapping("/insights")
    public ResponseEntity<BusinessInsightResponse> getInsights() {
        String cacheKey = aiCacheService.key("insights", "");
        Optional<Object> cached = aiCacheService.get(cacheKey);
        if (cached.isPresent()) {
            return ResponseEntity.ok()
                    .header("X-Cache", "HIT")
                    .body((BusinessInsightResponse) cached.get());
        }
        BusinessInsightResponse response = businessAnalystService.analyze();
        aiCacheService.put(cacheKey, response);
        return ResponseEntity.ok()
                .header("X-Cache", "MISS")
                .body(response);
    }

    // ==============================
    // Feature 3: AI Product Consultant
    // POST /api/ai/consult
    // Body: { "message": "I need a gaming phone under ₹40,000" }
    // ==============================
    @PostMapping("/consult")
    public ResponseEntity<ChatResponse> consult(
            @Valid @RequestBody ConsultantRequest request) {
        String cacheKey = aiCacheService.key("consult", request.getMessage());
        Optional<Object> cached = aiCacheService.get(cacheKey);
        if (cached.isPresent()) {
            return ResponseEntity.ok()
                    .header("X-Cache", "HIT")
                    .body((ChatResponse) cached.get());
        }
        ChatResponse response;
        try {
            String reply = consultantService.consult(request.getMessage());
            response = ChatResponse.success(reply);
        } catch (Exception e) {
            return ResponseEntity.ok(
                    ChatResponse.error("Consultant service unavailable. Please check Ollama."));
        }
        aiCacheService.put(cacheKey, response);
        return ResponseEntity.ok()
                .header("X-Cache", "MISS")
                .body(response);
    }

    // ==============================
    // Feature 4a: All product scores
    // GET /api/ai/scores
    // ==============================
    @GetMapping("/scores")
    public ResponseEntity<List<ProductScoreDTO>> getAllScores() {
        return ResponseEntity.ok(recommendationEngineService.scoreAll());
    }

    // ==============================
    // Feature 4b: Top by category
    // GET /api/ai/scores/top
    // ==============================
    @GetMapping("/scores/top")
    public ResponseEntity<Map<String, List<ProductScoreDTO>>> getTopByCategory() {
        return ResponseEntity.ok(recommendationEngineService.getTopByCategory());
    }

    // ==============================
    // Feature 5: Natural Language Search
    // GET /api/ai/search?q=gaming+phones+under+40000
    // ==============================
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> nlSearch(
            @RequestParam(name = "q") String query) {
        NlSearchService.NlSearchResult result = nlSearchService.search(query);

        return ResponseEntity.ok(Map.of(
                "query", query,
                "interpretation", result.getInterpretation(),
                "count", result.getCount(),
                "products", result.getProducts()
        ));
    }
}

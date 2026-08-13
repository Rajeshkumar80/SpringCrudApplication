package com.example.Product.service;

import com.example.Product.dto.AiQueryResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NlQueryServiceTest {

    @Mock
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private ChatClient chatClient;

    @Mock
    private ChatClient.ChatClientRequestSpec requestSpec;

    @Mock
    private ChatClient.CallResponseSpec callResponse;

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query nativeQuery;

    private NlQueryService nlQueryService;

    @BeforeEach
    void setUp() {
        // Constructor calls builder.build(), so stub it before constructing
        when(chatClientBuilder.build()).thenReturn(chatClient);
        nlQueryService = new NlQueryService(chatClientBuilder, entityManager);
    }

    private void stubAiChatClient(String sql, String explanation) {
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponse);
        when(callResponse.content())
                .thenReturn(sql, explanation);
    }

    @Test
    void query_executesGeneratedSqlAndReturnsResults() {
        stubAiChatClient("SELECT * FROM products LIMIT 10", "Here are the top products.");

        Object[] row = {1L, "5000mAh", "Samsung", "50MP", "6.7\" AMOLED", null,
                "Galaxy S25", 65000.0, "Snapdragon 8 Elite", "12GB", 4.5, 10, "256GB"};
        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(Collections.singletonList(row));

        AiQueryResponse response = nlQueryService.query("Show Samsung phones");

        assertTrue(response.isSuccess());
        assertEquals(1, response.getResultCount());
        assertEquals("Galaxy S25", response.getResults().get(0).get("name"));
        assertEquals(65000.0, response.getResults().get(0).get("price"));
        assertEquals("Here are the top products.", response.getAiExplanation());
    }

    @Test
    void query_rejectsNonSelectSql() {
        stubAiChatClient("DROP TABLE products", "explanation");

        AiQueryResponse response = nlQueryService.query("Delete everything");

        assertFalse(response.isSuccess());
        assertEquals("Only read queries are supported.", response.getErrorMessage());
        verify(entityManager, never()).createNativeQuery(anyString());
    }

    @Test
    void query_rejectsSqlWithInjectionAttempt() {
        stubAiChatClient("SELECT * FROM products; DELETE FROM products", "explanation");

        AiQueryResponse response = nlQueryService.query("Hack the db");

        assertFalse(response.isSuccess());
        verify(entityManager, never()).createNativeQuery(anyString());
    }

    @Test
    void query_catchesDatabaseErrorsGracefully() {
        stubAiChatClient("SELECT * FROM products LIMIT 10", "explanation");

        when(entityManager.createNativeQuery(anyString()))
                .thenThrow(new RuntimeException("bad SQL"));

        AiQueryResponse response = nlQueryService.query("Show all");

        assertFalse(response.isSuccess());
        assertNotNull(response.getErrorMessage());
    }

    @Test
    void query_emptyResultReturnsNoRowsExplanation() {
        stubAiChatClient("SELECT * FROM products WHERE price < 1 LIMIT 10", "n/a");

        when(entityManager.createNativeQuery(anyString())).thenReturn(nativeQuery);
        when(nativeQuery.getResultList()).thenReturn(List.of());

        AiQueryResponse response = nlQueryService.query("Cheapest phone");

        assertTrue(response.isSuccess());
        assertEquals(0, response.getResultCount());
        assertEquals("No products found matching your query. Try searching with different criteria, " +
                "such as a different budget range, brand, or feature.", response.getAiExplanation());
    }
}

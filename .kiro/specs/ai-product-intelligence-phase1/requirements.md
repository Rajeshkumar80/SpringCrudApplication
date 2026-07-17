# Requirements Document

## Introduction

This document specifies the requirements for **AI Product Intelligence Platform – Phase 1**, a set of five enterprise-grade AI features layered on top of the existing Spring Boot 3.5.3 + React 19 (Vite) product management application. The existing system provides product CRUD, dashboard analytics, and a basic general-purpose chat assistant backed by Ollama (llama3.2:1b). Phase 1 elevates the platform into a professional AI-powered SaaS product by adding: a structured AI Product Consultant, an AI Business Analyst, AI Natural Language Search, an AI Executive Dashboard, and an AI Product Description Generator. All five features share a single Ollama backend and the existing MySQL product database. No existing endpoints or UI components may be broken.

---

## Glossary

- **AI_Consultant**: The backend service responsible for Feature 1 (AI Product Consultant) that interprets user needs and returns structured product recommendations.
- **AI_Analyst**: The backend service responsible for Feature 2 (AI Business Analyst) that derives business insights from live inventory data.
- **AI_Search**: The backend service responsible for Feature 3 (AI Natural Language Search) that converts free-text queries into structured database filters.
- **AI_Executive**: The backend service responsible for Feature 4 (AI Executive Dashboard) that generates a daily briefing from live inventory metrics.
- **AI_Describer**: The backend service responsible for Feature 5 (AI Product Description Generator) that produces marketing copy for a product.
- **OllamaClient**: The Spring AI ChatClient bean (already configured) that proxies requests to the local Ollama instance running llama3.2:1b on port 11434.
- **ProductRepository**: The existing Spring Data JPA repository that queries the `products` table in MySQL.
- **InventorySnapshot**: A read-only projection of all products fetched from the database at query time and serialised into the AI prompt context.
- **RecommendationResponseDTO**: A structured JSON DTO carrying: `topRecommendation`, `whyRecommended`, `pros` (list), `cons` (list), `alternatives` (list of product names), `confidenceScore` (integer 1–5).
- **InsightDTO**: A structured JSON DTO carrying: `title`, `description`, `dataPoint`, `confidenceLevel` (HIGH / MEDIUM / LOW), `suggestedAction`, `category`.
- **SearchFilterDTO**: An intermediate DTO carrying AI-extracted filters: `maxPrice`, `minPrice`, `brand`, `displayKeyword`, `minRam`, `minStorage`, `sortBy`, `explanation`.
- **SearchResultDTO**: A DTO carrying: `products` (list of ProductDTO), `explanation` (string), `totalFound` (integer), `filtersApplied` (SearchFilterDTO).
- **ExecutiveBriefingDTO**: A structured DTO carrying: `greeting`, `inventoryHealthStatus`, `topPerformingBrand`, `restockAlerts` (list), `priceAnomalies` (list), `keyRecommendation`, `generatedAt` (ISO-8601 timestamp).
- **KpiCardDTO**: A DTO within the dashboard context carrying: `totalProducts`, `inventoryValue`, `avgRating`, `lowStockAlerts`, `aiHealthScore` (0–100 integer).
- **DescriptionRequestDTO**: Input DTO for Feature 5 carrying: `name`, `processor`, `ram`, `storage`, `display`, `battery`, `camera`, `brand`.
- **DescriptionResponseDTO**: Output DTO carrying: `shortDescription`, `longDescription`, `keyHighlights` (list), `pros` (list), `cons` (list), `bestFor` (list), `seoMetaDescription`.
- **GlobalExceptionHandler**: The existing `@ControllerAdvice` class that catches exceptions and returns standardised error payloads.
- **LowStockThreshold**: Products with `stock` ≤ 5 units are classified as low stock.
- **Sidebar**: The existing React `Sidebar.jsx` navigation component.

---

## Requirements

---

### Requirement 1 — AI Product Consultant

**User Story:** As a customer, I want to describe my needs in plain language (budget, use case, preferences) and receive a structured, professional product recommendation, so that I can confidently choose the best phone from the inventory without manually comparing specifications.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/v1/ai/recommend` with a non-empty `userNeed` string, THE AI_Consultant SHALL fetch all products from the ProductRepository, build an InventorySnapshot prompt context, and invoke the OllamaClient to produce a recommendation.

2. WHEN the OllamaClient returns a response, THE AI_Consultant SHALL parse it into a RecommendationResponseDTO containing: `topRecommendation` (product name as string), `whyRecommended` (string ≤ 300 characters), `pros` (list of 2–5 strings), `cons` (list of 1–3 strings), `alternatives` (list of 2–3 product names from inventory), and `confidenceScore` (integer 1–5).

3. WHEN the AI response cannot be parsed into the expected structure, THE AI_Consultant SHALL attempt a second OllamaClient call with a stricter JSON-only prompt before returning an error.

4. IF the OllamaClient throws an exception or times out, THEN THE GlobalExceptionHandler SHALL return HTTP 503 with a JSON error body `{"error": "AI service unavailable", "code": "AI_503"}`.

5. IF the `userNeed` field is blank or absent in the request body, THEN THE AI_Consultant SHALL return HTTP 400 with a validation error before invoking the OllamaClient.

6. THE AI_Consultant SHALL only recommend products that exist in the current ProductRepository result set; it SHALL NOT fabricate product names.

7. WHEN the consultant endpoint is called, THE AI_Consultant SHALL respond within 60 seconds; IF no response is received within 60 seconds, THEN THE AI_Consultant SHALL return HTTP 504 with `{"error": "Request timed out", "code": "AI_504"}`.

8. THE AI_Consultant endpoint SHALL be accessible at `/api/v1/ai/recommend` via HTTP POST and SHALL return `Content-Type: application/json`.

---

### Requirement 2 — AI Consultant Frontend Page

**User Story:** As a customer, I want a dedicated, beautifully designed page in the application where I can type my need and see a rich recommendation card, so that the experience feels like using a premium product advisor tool.

#### Acceptance Criteria

1. THE Sidebar SHALL include a new navigation item labelled **"AI Consultant"** under the existing **"AI"** section, with an appropriate react-icon, that navigates to a new page component `AiConsultantPage`.

2. WHEN the `AiConsultantPage` is loaded, THE page SHALL display a full-width natural-language input field with placeholder text "Describe your need, e.g. college student, ₹30,000 budget, good camera…" and a **"Get Recommendation"** button.

3. WHILE a recommendation request is in-flight, THE page SHALL display a skeleton screen in place of the result card; the input and button SHALL be disabled.

4. WHEN a RecommendationResponseDTO is received, THE page SHALL render a recommendation card containing:
   - Product name as a prominent heading.
   - A "Why Recommended" paragraph.
   - A "Pros" section as a styled bullet list.
   - A "Cons" section as a styled bullet list.
   - An "Alternatives" section listing 2–3 alternative product names.
   - A visual star rating displaying `confidenceScore` as filled/empty stars (1–5).

5. WHEN the recommendation card is rendered, THE page SHALL animate it into view using Framer Motion (`initial={{ opacity: 0, y: 24 }}`, `animate={{ opacity: 1, y: 0 }}`).

6. IF the API returns an error (HTTP 4xx or 5xx), THEN THE page SHALL display an error state card with an informative message and a **"Try Again"** button; the error card SHALL NOT show a skeleton screen.

7. THE page SHALL support both light and dark themes using existing CSS variable tokens (`--color-card`, `--color-bg`, `--color-accent`, etc.) and SHALL NOT use Bootstrap or Tailwind utility classes.

8. THE page SHALL call the backend via a new `AiConsultantService.js` using Axios, posting to `/api/v1/ai/recommend`.

---

### Requirement 3 — AI Business Analyst

**User Story:** As a product manager, I want the system to automatically analyze the live inventory data and present professional business insights, so that I can identify opportunities and risks without manual data crunching.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/v1/ai/insights`, THE AI_Analyst SHALL fetch all products from the ProductRepository, compute an InventorySnapshot (brand distribution, price ranges, stock levels, rating averages), and invoke the OllamaClient with an analysis prompt.

2. WHEN the OllamaClient responds, THE AI_Analyst SHALL return a JSON array of InsightDTO objects; the array SHALL contain between 4 and 8 insights.

3. THE AI_Analyst SHALL generate insights covering at least the following categories when data supports them: `BRAND_PERFORMANCE`, `INVENTORY_HEALTH`, `RESTOCK_ALERT`, `REVENUE_ANALYSIS`, `TREND_OBSERVATION`.

4. WHEN generating insights, THE AI_Analyst SHALL embed a concrete `dataPoint` (e.g., "Samsung holds 40% of inventory") derived from the actual InventorySnapshot; the `dataPoint` SHALL NOT be a fabricated or generic placeholder.

5. WHEN the OllamaClient throws an exception, THE GlobalExceptionHandler SHALL return HTTP 503 with `{"error": "AI service unavailable", "code": "AI_503"}`.

6. THE AI_Analyst endpoint SHALL be accessible at `/api/v1/ai/insights` via HTTP GET and SHALL return `Content-Type: application/json`.

---

### Requirement 4 — AI Business Analyst Frontend Section

**User Story:** As a product manager, I want the AI-generated business insights to appear as polished animated cards on the Dashboard page, with a refresh button, so that the insights feel actionable and up-to-date.

#### Acceptance Criteria

1. THE `DashboardPage` SHALL include an **"AI Insights"** section below the existing charts grid, displaying up to 8 InsightDTO cards loaded from `/api/v1/ai/insights`.

2. WHEN the `DashboardPage` initially loads, THE AI Insights section SHALL display skeleton placeholder cards while the insights are being fetched; the existing stats and charts SHALL NOT be blocked by this fetch.

3. WHEN InsightDTO objects are received, THE page SHALL render each insight card showing: `title` (bold), `description`, `dataPoint` (in a highlighted chip), `confidenceLevel` badge (color-coded: HIGH=green, MEDIUM=orange, LOW=red), and `suggestedAction` in italic.

4. WHEN insight cards are rendered, THE page SHALL stagger their entrance animation using Framer Motion with a 0.08-second delay increment per card.

5. THE AI Insights section SHALL include a **"Refresh Insights"** button; WHEN the button is clicked, THE page SHALL clear existing insight cards, show skeleton screens, and fetch a new set of insights from `/api/v1/ai/insights`.

6. IF the insights fetch fails, THEN THE AI Insights section SHALL display a single error card with a retry button; the rest of the dashboard SHALL remain functional.

7. THE insight cards SHALL use pure CSS styling consistent with the existing card design system (matching `--color-card`, `--color-border`, `--radius-md`).

---

### Requirement 5 — AI Natural Language Search

**User Story:** As a customer, I want to search for products using natural language like "gaming phones under ₹50,000 with AMOLED display", so that I do not need to know exact filter values or field names.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/v1/ai/search` with a non-empty `query` string, THE AI_Search SHALL invoke the OllamaClient to extract structured filters into a SearchFilterDTO.

2. WHEN a SearchFilterDTO is extracted, THE AI_Search SHALL build a dynamic JPA query against the ProductRepository applying the extracted filters (maxPrice, minPrice, brand LIKE, display LIKE, minimum RAM numeric comparison, minimum storage numeric comparison) and return the matching products as a SearchResultDTO.

3. WHEN the AI extraction succeeds, THE SearchResultDTO SHALL include: the matching `products` list (as ProductDTO), a human-readable `explanation` string generated by the AI (e.g., "Found 4 phones matching your criteria. Filtered by price ≤ ₹50,000 and AMOLED display."), `totalFound` count, and the `filtersApplied` SearchFilterDTO.

4. IF the OllamaClient fails to return parseable filters OR returns no filters, THEN THE AI_Search SHALL fall back to the existing full-text keyword search using the `query` string directly against ProductRepository's `searchProducts` method, and SHALL set `explanation` to "Showing results for keyword search: '{query}'".

5. IF the `query` field is blank or absent, THEN THE AI_Search SHALL return HTTP 400 with a validation error before invoking the OllamaClient.

6. THE AI_Search endpoint SHALL be accessible at `/api/v1/ai/search` via HTTP POST and SHALL return `Content-Type: application/json`.

---

### Requirement 6 — AI Natural Language Search Frontend Page

**User Story:** As a customer, I want a dedicated search page where I can type natural language queries and see a results grid with an AI explanation banner, so that the search experience feels intuitive and transparent.

#### Acceptance Criteria

1. THE Sidebar SHALL include a new navigation item labelled **"AI Search"** under the existing **"AI"** section, navigating to a new page component `AiSearchPage`.

2. WHEN the `AiSearchPage` is loaded, THE page SHALL display a full-width search input with placeholder "Search naturally, e.g. gaming phones under ₹50,000 with AMOLED display…" and a **"Search"** button.

3. WHILE the search request is in-flight, THE page SHALL display a skeleton grid of 4–6 product card placeholders.

4. WHEN a SearchResultDTO is received, THE page SHALL display: an AI explanation banner at the top showing `explanation` and `totalFound`; a responsive product cards grid showing matching products.

5. WHEN zero products are returned, THE page SHALL display a "No products found" state with the AI explanation message and a **"Clear Search"** button.

6. WHEN a product card is clicked, THE page SHALL navigate to the Products page with the product highlighted (or open the product detail modal if the existing system supports it).

7. IF the API returns an error, THEN THE page SHALL display an error banner above the search input without clearing the query text.

8. THE page SHALL support re-submission of a new query without requiring a page reload.

9. THE page SHALL use Framer Motion for result card entrance animations (staggered by 0.05 seconds per card).

---

### Requirement 7 — AI Executive Dashboard

**User Story:** As an executive, I want the dashboard to open with a personalized AI-generated daily briefing and KPI cards that give me an instant pulse on the business, so that I do not need to drill into reports to get the key numbers.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/v1/ai/briefing`, THE AI_Executive SHALL fetch live data from the ProductRepository, compute KPI metrics (total products, total inventory value, average rating, low-stock count using LowStockThreshold, AI health score), and invoke the OllamaClient to generate an ExecutiveBriefingDTO.

2. THE AI_Executive SHALL compute `aiHealthScore` as an integer from 0 to 100 using this formula: `100 − (lowStockCount / totalProducts × 100)`, rounded to the nearest integer; WHERE totalProducts is 0, THE AI_Executive SHALL set `aiHealthScore` to 0.

3. WHEN the OllamaClient responds, THE AI_Executive SHALL return an ExecutiveBriefingDTO containing: `greeting` (time-of-day-aware salutation, e.g., "Good Morning 👋"), `inventoryHealthStatus` (string), `topPerformingBrand` (brand name), `restockAlerts` (list of product names with stock ≤ LowStockThreshold), `priceAnomalies` (list of product names priced more than 2 standard deviations above the mean price), `keyRecommendation` (string), and `generatedAt` (ISO-8601 UTC timestamp).

4. IF the OllamaClient fails, THEN THE AI_Executive SHALL still return a KpiCardDTO derived purely from database calculations without AI-generated prose; `greeting`, `inventoryHealthStatus`, and `keyRecommendation` SHALL be set to a fallback static string indicating AI is unavailable.

5. THE AI_Executive endpoint SHALL be accessible at `/api/v1/ai/briefing` via HTTP GET and SHALL return `Content-Type: application/json`.

---

### Requirement 8 — AI Executive Dashboard Frontend

**User Story:** As an executive, I want the top of the Dashboard page to show a personalized greeting banner, 5 KPI cards, and the AI briefing content, so that the page looks and feels like an enterprise BI morning report.

#### Acceptance Criteria

1. THE `DashboardPage` SHALL display an **AI Executive Briefing** banner at the very top of the page, above the existing stats grid, loaded from `/api/v1/ai/briefing`.

2. THE briefing banner SHALL display: the `greeting` text, `inventoryHealthStatus`, `topPerformingBrand`, and `keyRecommendation` in a styled card with a gradient accent border.

3. THE `DashboardPage` SHALL display 5 KPI cards immediately below the briefing banner: **Total Products**, **Inventory Value**, **Avg Rating**, **Low Stock Alerts**, and **AI Health Score**; each card SHALL display the icon, label, and value sourced from the ExecutiveBriefingDTO / KpiCardDTO.

4. THE **AI Health Score** KPI card SHALL display the score as a percentage value and SHALL apply color coding: ≥ 80 = green, 50–79 = orange, < 50 = red, using CSS variable tokens.

5. WHILE the briefing is loading, THE banner and KPI cards SHALL display skeleton screens; the existing stats grid and charts below SHALL load independently and SHALL NOT wait for the briefing.

6. IF the briefing endpoint fails, THEN THE banner SHALL display a static fallback message "AI briefing unavailable — showing live data" and the KPI cards SHALL still render with values derived from the existing dashboard summary endpoint.

7. THE briefing banner and KPI cards SHALL animate into view using Framer Motion on first load.

---

### Requirement 9 — AI Product Description Generator

**User Story:** As an admin, I want to fill a form with a product's technical specifications and have the AI generate professional marketing copy (short description, long description, highlights, pros, cons, best-for use cases, and SEO meta description), so that I can rapidly produce high-quality product listings.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/v1/ai/describe` with a valid DescriptionRequestDTO (all fields non-blank), THE AI_Describer SHALL invoke the OllamaClient with a structured marketing copy prompt and return a DescriptionResponseDTO.

2. THE DescriptionResponseDTO SHALL contain: `shortDescription` (string, ≤ 160 characters), `longDescription` (string, ≤ 500 characters), `keyHighlights` (list of 3–6 strings), `pros` (list of 3–5 strings), `cons` (list of 1–3 strings), `bestFor` (list of 2–4 strings describing target use cases), and `seoMetaDescription` (string, ≤ 160 characters, keyword-rich).

3. IF any required field in DescriptionRequestDTO is blank or null, THEN THE AI_Describer SHALL return HTTP 400 with a field-level validation error before invoking the OllamaClient.

4. IF the OllamaClient throws an exception, THEN THE GlobalExceptionHandler SHALL return HTTP 503 with `{"error": "AI service unavailable", "code": "AI_503"}`.

5. THE AI_Describer endpoint SHALL be accessible at `/api/v1/ai/describe` via HTTP POST and SHALL return `Content-Type: application/json`.

---

### Requirement 10 — AI Product Description Generator Frontend Page

**User Story:** As an admin, I want a clean two-panel page where I fill in specs on the left and see the generated descriptions appear on the right with copy-to-clipboard buttons, so that the workflow is fast and frictionless.

#### Acceptance Criteria

1. THE Sidebar SHALL include a new navigation item labelled **"AI Describer"** under the existing **"AI"** section, navigating to a new page component `AiDescriberPage`.

2. THE `AiDescriberPage` SHALL display a two-panel layout: a left panel with an input form containing labeled text fields for `name`, `brand`, `processor`, `RAM`, `storage`, `display`, `battery`, and `camera`; a right panel showing the generated content.

3. THE left panel SHALL include a **"Generate Description"** button; WHILE generation is in-flight, the button SHALL be disabled and SHALL display a loading spinner; all form fields SHALL remain editable.

4. WHEN a DescriptionResponseDTO is received, THE right panel SHALL render the following sections, each with a **"Copy"** button: Short Description, Long Description, Key Highlights (bullet list), Pros, Cons, Best For, SEO Meta Description.

5. WHEN a **"Copy"** button is clicked, THE page SHALL copy the section content to the clipboard using the browser Clipboard API and SHALL display a brief inline confirmation ("Copied!" label for 2 seconds) next to the button.

6. WHILE the right panel is loading, THE right panel SHALL display skeleton placeholder blocks for each content section.

7. WHEN the right panel is empty (before first generation), THE right panel SHALL display a placeholder illustration or message: "Fill in product details and click Generate to see AI-crafted descriptions".

8. IF the API returns an error, THEN THE right panel SHALL display an error state with the error message and a **"Retry"** button; the form data SHALL be preserved.

9. THE page SHALL animate the right panel content into view using Framer Motion when new content arrives.

10. THE page SHALL use pure CSS consistent with the existing design system and SHALL NOT use Bootstrap or Tailwind utility classes.

---

### Requirement 11 — Backend Architecture Constraints

**User Story:** As a developer, I want all new AI features to follow the existing layered architecture and coding standards, so that the codebase remains maintainable and the existing functionality is never broken.

#### Acceptance Criteria

1. THE System SHALL expose all new AI endpoints under the URL prefix `/api/v1/ai/`; existing endpoints under `/api/chat`, `/api/dashboard`, and `/api/products` SHALL remain unchanged.

2. THE System SHALL use layered architecture: each new AI feature SHALL have a dedicated Controller class, a dedicated Service interface and implementation class, and SHALL use DTOs for all request and response payloads.

3. THE System SHALL NOT use Lombok annotations (`@Data`, `@Getter`, `@Setter`, `@Builder`, etc.); all DTOs and model classes SHALL declare explicit constructors, getters, and setters.

4. THE System SHALL register all new controllers under the existing CORS configuration in `CorsConfig.java` (origin `http://localhost:5173`); no new `@CrossOrigin` annotations are required if the global CORS config covers `/api/v1/**`.

5. THE GlobalExceptionHandler SHALL handle `ResourceNotFoundException` (HTTP 404), `MethodArgumentNotValidException` (HTTP 400 with field errors), and a new `AiServiceException` (HTTP 503) for all new AI endpoints.

6. THE System SHALL NOT introduce new external library dependencies beyond those already declared in `pom.xml`; all AI calls SHALL use the existing `ChatClient` bean configured in `AiConfig.java`.

7. WHEN the AI response contains raw JSON embedded in markdown code fences (` ```json ... ``` `), THE Service SHALL strip the fences before attempting JSON parsing.

---

### Requirement 12 — Frontend Architecture Constraints

**User Story:** As a developer, I want all new frontend pages to follow the existing React patterns and styling conventions, so that the UI is cohesive and the project remains easy to maintain.

#### Acceptance Criteria

1. THE System SHALL add three new page components (`AiConsultantPage.jsx`, `AiSearchPage.jsx`, `AiDescriberPage.jsx`) under `product-frontend/src/pages/`; the existing four pages SHALL NOT be modified except for wiring the new pages in `App.jsx`.

2. THE App.jsx `renderPage` switch SHALL be extended to handle the three new route keys (`ai-consultant`, `ai-search`, `ai-describer`) and the AI Executive + Insights sections SHALL be integrated directly into `DashboardPage.jsx`.

3. THE Sidebar.jsx `navItems` array SHALL be extended with the three new items under the **"AI"** section without removing or renaming existing items.

4. THE System SHALL add three new service modules (`AiConsultantService.js`, `AiInsightsService.js`, `AiSearchService.js`, `AiDescriberService.js`) under `product-frontend/src/services/`; each SHALL use Axios with base URL `http://localhost:8888`.

5. THE System SHALL use pure CSS only for all new UI; NO Bootstrap, NO Tailwind, NO CSS-in-JS libraries SHALL be introduced.

6. THE System SHALL use Framer Motion (already in `package.json`) for all entrance and transition animations on new pages; animation parameters SHALL be consistent with existing patterns (`duration: 0.22–0.35`, `y: 8–24` offsets).

7. THE System SHALL display skeleton screen loading states (using animated CSS `@keyframes` shimmer or Framer Motion pulse) for all AI-powered sections before data arrives.

8. WHERE the existing `index.css` CSS variable tokens exist (e.g., `--color-card`, `--color-accent`, `--color-border`), THE new pages SHALL use those tokens exclusively for colors, shadows, and radius values.

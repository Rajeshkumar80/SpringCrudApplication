# Requirements Document

## Introduction

The AI Product Consultant is a smart shopping assistant feature added to the existing AI-Powered Product Management System. It provides a dedicated page where users can describe what they are looking for in natural language (e.g., "gaming phone under ₹40,000") and receive a structured, card-based recommendation that includes the best matching product, the reasoning behind the recommendation, a pros/cons breakdown, alternative options, and a confidence score. All recommendations must be grounded strictly in products that exist in the MySQL inventory database.

The feature consists of:
- A new backend endpoint `POST /api/ai/consult` that builds a structured prompt with the full product catalog, calls Ollama (llama3.2:1b) via Spring AI, and returns a structured JSON response.
- A new frontend page "AI Consultant" with suggested query chips, a query input, and a structured response card displaying the recommendation visually.

## Glossary

- **Consultant**: The AI Product Consultant feature described in this document.
- **ConsultRequest**: The request payload sent to the backend containing the user's natural-language query.
- **ConsultResponse**: The structured JSON response returned by the backend containing a recommendation.
- **Recommendation**: A single structured AI-generated product suggestion that includes a best product, reasoning, pros, cons, alternatives, and a confidence score.
- **BestProduct**: The single product from the inventory that most closely matches the user's query.
- **Alternatives**: A list of 2–3 other products from the inventory that partially match the user's query.
- **ConfidenceScore**: An integer between 1 and 5 (inclusive) representing how well the best product matches the query.
- **ConfidenceLabel**: A human-readable label corresponding to the ConfidenceScore (e.g., "Excellent Match", "Good Match", "Average Match", "Weak Match", "Poor Match").
- **Product**: A mobile phone entity stored in the MySQL database, with fields: id, name, brand, price, processor, ram, storage, battery, camera, display, rating, stock, imageUrl.
- **ProductCatalog**: The complete list of all Products fetched from the MySQL database.
- **QueryChip**: A pre-defined suggested query displayed on the AI Consultant page that the user can click to auto-populate the query input.
- **ConsultService**: The backend Spring service responsible for building the structured prompt and calling the LLM.
- **ConsultController**: The backend Spring REST controller that exposes the `/api/ai/consult` endpoint.
- **AiConsultantPage**: The dedicated frontend React page for the AI Consultant feature.
- **LLM**: The large language model instance served by Ollama (llama3.2:1b).

---

## Requirements

### Requirement 1: Submit a Natural-Language Consultation Query

**User Story:** As a shopper, I want to describe what I need in plain language, so that the AI Consultant can recommend the most suitable phone from the inventory.

#### Acceptance Criteria

1. THE AiConsultantPage SHALL provide a text input field where the user can enter a natural-language product query.
2. THE AiConsultantPage SHALL provide a submit button that sends the query to the backend when clicked.
3. WHEN the user presses Enter in the query input field, THE AiConsultantPage SHALL submit the query without requiring the user to click the submit button.
4. WHILE a consultation request is in progress, THE AiConsultantPage SHALL display a loading indicator and disable the submit button and query input.
5. IF the user submits an empty or whitespace-only query, THEN THE AiConsultantPage SHALL prevent submission and display an inline validation message.

---

### Requirement 2: Suggested Query Chips

**User Story:** As a shopper, I want to see example queries I can click, so that I can quickly explore recommendations without typing.

#### Acceptance Criteria

1. THE AiConsultantPage SHALL display at least 5 QueryChip buttons including examples such as "Gaming phone under ₹40,000", "Best phone for photography", "Phone with long battery life", "Student phone under ₹25,000", and "Suggest a flagship phone".
2. WHEN the user clicks a QueryChip, THE AiConsultantPage SHALL populate the query input with the chip's text and submit the query automatically.
3. WHILE a consultation request is in progress, THE AiConsultantPage SHALL disable all QueryChip buttons.

---

### Requirement 3: Backend Consultation Endpoint

**User Story:** As a developer, I want a dedicated backend endpoint, so that the frontend can request structured AI recommendations independently of the existing general chat endpoint.

#### Acceptance Criteria

1. THE ConsultController SHALL expose a `POST /api/ai/consult` endpoint that accepts a JSON body with a `query` string field.
2. WHEN a valid ConsultRequest is received, THE ConsultController SHALL delegate to ConsultService and return a ConsultResponse with HTTP 200.
3. IF the `query` field in the request body is blank or absent, THEN THE ConsultController SHALL return HTTP 400 with a descriptive error message.
4. IF the ConsultService throws an exception, THEN THE ConsultController SHALL return HTTP 503 with a message indicating the AI service is unavailable.
5. THE ConsultController SHALL allow cross-origin requests from `http://localhost:5173`.

---

### Requirement 4: Structured Prompt Construction with Full Product Catalog

**User Story:** As a product owner, I want the AI to only recommend products that exist in our database, so that users are never misled by hallucinated or out-of-stock recommendations.

#### Acceptance Criteria

1. WHEN ConsultService processes a query, THE ConsultService SHALL fetch the complete ProductCatalog from the MySQL database before calling the LLM.
2. THE ConsultService SHALL include the full ProductCatalog in the system prompt sent to the LLM, formatted with all relevant product fields (name, brand, price, processor, ram, storage, battery, camera, display, rating, stock).
3. THE ConsultService SHALL instruct the LLM via the system prompt to recommend only products present in the provided ProductCatalog and to never invent or hallucinate products.
4. THE ConsultService SHALL instruct the LLM to return a response exclusively in valid JSON format matching the ConsultResponse schema.
5. THE ConsultService SHALL set the LLM temperature to a value that reduces creative fabrication while preserving recommendation quality.

---

### Requirement 5: Structured ConsultResponse Schema

**User Story:** As a developer, I want the AI response to conform to a well-defined schema, so that the frontend can reliably parse and render recommendation cards.

#### Acceptance Criteria

1. THE ConsultService SHALL return a ConsultResponse containing: `bestProduct` (object), `reason` (string), `pros` (array of strings), `cons` (array of strings), `alternatives` (array of objects), and `confidenceScore` (integer).
2. THE `bestProduct` object SHALL contain at minimum: `name` (string), `brand` (string), and `price` (number).
3. THE `alternatives` array SHALL contain between 2 and 3 product objects, each with at minimum `name`, `brand`, and `price`.
4. THE `confidenceScore` field SHALL be an integer with a value between 1 and 5 inclusive.
5. THE ConsultService SHALL derive a `confidenceLabel` string from the `confidenceScore` using the mapping: 5 → "Excellent Match", 4 → "Good Match", 3 → "Average Match", 2 → "Weak Match", 1 → "Poor Match".
6. IF the LLM returns a response that cannot be parsed as valid JSON, THEN THE ConsultService SHALL return a ConsultResponse with `success` set to false and a descriptive `errorMessage`.
7. IF no product in the ProductCatalog matches the user's query, THEN THE ConsultService SHALL return a ConsultResponse indicating no match was found, without fabricating a product.

---

### Requirement 6: Confidence Score Integrity

**User Story:** As a shopper, I want the confidence score to always be a meaningful value between 1 and 5, so that I can trust the match quality indicator.

#### Acceptance Criteria

1. THE ConsultService SHALL validate that the `confidenceScore` parsed from the LLM response is an integer between 1 and 5 inclusive.
2. IF the parsed `confidenceScore` is outside the range 1–5, THEN THE ConsultService SHALL clamp the value to the nearest bound (1 or 5) before returning the ConsultResponse.
3. THE ConsultService SHALL never return a ConsultResponse with a `confidenceScore` that is null, zero, negative, or greater than 5.

---

### Requirement 7: Recommendation Card Display

**User Story:** As a shopper, I want to see a visually structured recommendation card, so that I can quickly evaluate the best product and its alternatives.

#### Acceptance Criteria

1. WHEN a ConsultResponse is received, THE AiConsultantPage SHALL render a recommendation card containing: the BestProduct name, brand, and price; the reason paragraph; a bulleted pros list; a bulleted cons list; a confidence score display; and the alternatives list.
2. THE AiConsultantPage SHALL render the ConfidenceScore as a star rating (1–5 filled stars) accompanied by the ConfidenceLabel text.
3. THE AiConsultantPage SHALL visually distinguish pros items (e.g., green indicator) from cons items (e.g., red indicator).
4. THE AiConsultantPage SHALL display each alternative product with its name, brand, and price.
5. WHEN the user submits a new query, THE AiConsultantPage SHALL clear the previous recommendation card and display the loading indicator until the new ConsultResponse arrives.

---

### Requirement 8: Error Handling and User Feedback

**User Story:** As a shopper, I want clear feedback when something goes wrong, so that I understand whether the AI service is unavailable or my query returned no results.

#### Acceptance Criteria

1. IF the backend returns HTTP 503, THEN THE AiConsultantPage SHALL display an error message indicating the AI service is unavailable and prompt the user to ensure Ollama is running.
2. IF the ConsultResponse contains `success: false`, THEN THE AiConsultantPage SHALL display the `errorMessage` from the response in place of the recommendation card.
3. IF the network request fails entirely, THEN THE AiConsultantPage SHALL display a generic connectivity error message.
4. THE AiConsultantPage SHALL always return the query input to an enabled, focusable state after a request completes, whether successfully or with an error.

---

### Requirement 9: Frontend Service Integration

**User Story:** As a developer, I want a dedicated frontend service module, so that the AI Consultant API call is cleanly separated from the general chat service.

#### Acceptance Criteria

1. THE AiConsultantPage SHALL use a dedicated `ConsultService.js` module to call `POST /api/ai/consult`.
2. THE ConsultService.js module SHALL NOT reuse or modify the existing `ChatService.js`.
3. THE ConsultService.js module SHALL send the query as a JSON body with the field name `query`.
4. THE ConsultService.js module SHALL return the parsed ConsultResponse to the caller.

---

### Requirement 10: Navigation Integration

**User Story:** As a user, I want to navigate to the AI Consultant page from the sidebar, so that I can access it just like any other page in the application.

#### Acceptance Criteria

1. THE Sidebar SHALL include a navigation entry labelled "AI Consultant" that sets the active page to `ai-consultant`.
2. WHEN the active page is set to `ai-consultant`, THE App SHALL render the AiConsultantPage component.
3. THE Navbar SHALL display "AI Consultant" as the page title when the active page is `ai-consultant`.

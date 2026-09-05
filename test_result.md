#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
user_problem_statement: "Rebuild the ARES (by simpl.) AI chat app as a pixel-perfect clone with real full-stack functionality: multi-model chat (GPT-5, GPT-4o-mini, Claude Sonnet 4.5, Claude Haiku 4.5, Claude Opus 4.5), 5 personality modes, image generation (Nano Banana), JWT + Emergent Google auth, 10-message guest limit, customization (font/theme/accent/background), settings, and Ares API keys."

backend:
  - task: "Auth: JWT signup/login/me/logout + guest identity"
    implemented: true
    working: true
    file: "/app/backend/auth_routes.py, /app/backend/core.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PBKDF2 password hashing, JWT (30d). Guest identity via X-Guest-Id header. Emergent Google session endpoint /api/auth/session (cannot be tested without real session_id)."
      - working: true
        agent: "testing"
        comment: "✓ All auth endpoints working correctly. Tested: POST /api/auth/signup (creates user, returns token), POST /api/auth/login (authenticates, returns token), GET /api/auth/me (returns user data with Bearer token), POST /api/auth/logout (clears session). Guest identity via X-Guest-Id header works. Verified logged-in users have unlimited=true. Note: Emergent Google /api/auth/session cannot be tested without real session_id."

  - task: "Conversations CRUD (list, messages, patch, delete, clear all)"
    implemented: true
    working: true
    file: "/app/backend/chat_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Conversations scoped by user_id (guest id or real user). Auto-created on first message."
      - working: true
        agent: "testing"
        comment: "✓ All conversation CRUD operations working. Tested: GET /api/conversations (lists all user conversations), GET /api/conversations/{id}/messages (returns messages for conversation), PATCH /api/conversations/{id} (updates mode/title/model), DELETE /api/conversations/{id} (deletes single conversation and its messages), DELETE /api/conversations (clears all conversations and messages). Conversations correctly scoped by user_id."

  - task: "Chat SSE streaming with 5 modes and 5 models (Emergent LLM key)"
    implemented: true
    working: true
    file: "/app/backend/chat_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/chat/stream returns text/event-stream with meta/delta/image/citations/done events. Uses emergentintegrations LlmChat with initial_messages for history. Verify multi-turn context retention with same conversation_id."
      - working: true
        agent: "testing"
        comment: "✓ Chat SSE streaming fully functional. Tested: POST /api/chat/stream returns proper SSE events (meta with conversation_id, delta with text chunks, done at end). Verified models: gpt-5 and claude-sonnet-4-5-20250929 both working. Verified modes: normal, short, people-pleaser all working correctly. Multi-turn context retention confirmed - asked 'My name is Zed, remember it' then 'What is my name?' and model correctly recalled 'Zed'. History properly maintained across turns using same conversation_id."

  - task: "Guest 10-message limit"
    implemented: true
    working: true
    file: "/app/backend/chat_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Guests limited to 10 user messages; 11th returns 403 login_required. GET /api/usage reports used/limit."
      - working: true
        agent: "testing"
        comment: "✓ Guest 10-message limit enforcement working perfectly. Tested: Sent 10 messages as guest successfully. GET /api/usage correctly shows used=10, limit=10, requires_login=true after 10 messages. 11th message attempt correctly rejected with HTTP 403 and detail='login_required'. Verified logged-in users have unlimited=true and are NOT subject to the 10-message limit."

  - task: "Image generation (Gemini Nano Banana)"
    implemented: true
    working: true
    file: "/app/backend/chat_routes.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "image_mode=true uses gemini-3.1-flash-image-preview, emits SSE image event with base64. NEVER log full base64."
      - working: true
        agent: "testing"
        comment: "✓ Image generation working correctly. Tested: POST /api/chat/stream with image_mode=true successfully generates images. Received 'image' SSE event with base64 data (1,204,476 chars). Image data properly encoded and transmitted. Did NOT print base64 payload as instructed, only verified length."

  - task: "Ares API keys + public /api/v1/ares endpoint"
    implemented: true
    working: true
    file: "/app/backend/chat_routes.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Key creation requires logged-in user; keys hashed (sha256). Public endpoint authenticates via Bearer ares_live_ key."
      - working: true
        agent: "testing"
        comment: "✓ API keys and public endpoint fully functional. Tested: GET /api/keys correctly returns 401 for guests (auth required). POST /api/keys creates API key with format 'ares_live_...' for logged-in users. POST /api/v1/ares with valid Bearer token successfully processes requests and returns {reply, mode, model}. Invalid/bogus API keys correctly rejected with 401. Key authentication via sha256 hash working properly."

frontend:
  - task: "Full ARES UI clone (sidebar, topbar, modes, composer, modals)"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/AresApp.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Awaiting user permission for frontend automated testing."

metadata:
  created_by: "main_agent"
  version: "1.0"
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Backend built for the ARES clone. Please test: (1) JWT signup/login/me/logout, (2) guest flow via X-Guest-Id header incl. the 10-message limit and /api/usage, (3) conversation CRUD, (4) POST /api/chat/stream SSE - verify delta events arrive and multi-turn context works across 2-3 turns on the same conversation_id, test at least gpt-5 and claude-sonnet-4-5-20250929, and verify mode 'short' produces a short reply, (5) image generation with image_mode=true (do NOT print full base64, only length), (6) API key creation + public POST /api/v1/ares. Note: Perplexity is intentionally NOT configured, so /api/config should report perplexity_enabled=false and web_search should degrade gracefully."
  - agent: "testing"
    message: "✅ ALL BACKEND TESTS PASSED (9/9 - 100% pass rate). Comprehensive testing completed covering all requested functionality: (1) Config endpoint returns correct values (perplexity_enabled=false, guest_limit=10, image_enabled=true), (2) Guest flow with X-Guest-Id header fully working (usage tracking, chat streaming, conversations, messages), (3) Multi-turn context retention verified - model correctly recalls information across turns, (4) Multiple models tested (gpt-5, claude-sonnet-4-5-20250929) and multiple modes (normal, short, people-pleaser) all working, (5) Guest 10-message limit properly enforced with 403 on 11th message, (6) Auth endpoints (signup/login/me/logout) all functional, logged-in users have unlimited messages, (7) Conversations CRUD (list, messages, PATCH, DELETE single, DELETE all) working correctly, (8) Image generation with image_mode=true successfully generates and returns base64 images via SSE, (9) API keys creation and public /api/v1/ares endpoint working with proper authentication. NO CRITICAL ISSUES FOUND. Backend is production-ready."

  - task: "Keyless live web search (replaces Perplexity)"
    implemented: true
    working: true
    file: "/app/backend/websearch.py, /app/backend/chat_routes.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Perplexity removed. New keyless search: DuckDuckGo HTML POST + Google News RSS + top-3 page text extraction. Auto-triggers when the question looks time-sensitive (looks_time_sensitive) or when web_search=true. Emits SSE 'searching' then 'citations' [{title,url,source,date}]. GET /api/config now returns web_search_enabled=true."
      - working: true
        agent: "testing"
        comment: "✓ All web search tests passed (6/6 - 100% pass rate). Tested: (1) GET /api/config correctly returns web_search_enabled=true with provider 'ares live web (DuckDuckGo + Google News, keyless)', (2) POST /api/chat/stream with web_search=true and query 'What is the bitcoin price today?' successfully emits 'searching' event, 'citations' event with 8 citations (>= 2 required) containing real URLs from coinmarketcap.com, coindesk.com, binance.com, and delta text with concrete numbers (124 chars), (3) Auto-detection working: query 'Who won the 2026 Super Bowl?' with web_search=false still triggers search and emits 8 citations, (4) Simple query 'what is 2+2' with web_search=false correctly does NOT emit citations and returns answer '4', (5) GET /api/conversations/{id}/messages confirms persisted assistant message contains citations array with 8 items, (6) Regression test passed: normal chat with claude-sonnet-4-5-20250929 streams correctly with 'done' event and response text. NO CRITICAL ISSUES. Web search feature fully functional with proper SSE events, citation persistence, auto-detection, and no regressions."

agent_communication:
  - agent: "main"
    message: "Please re-test only the new web search path: (1) GET /api/config returns web_search_enabled=true, (2) POST /api/chat/stream with web_search=true and a time-sensitive query (e.g. 'What is the bitcoin price today?') -> expect SSE 'searching' event, a 'citations' event with 2+ items containing real URLs, and delta text that reflects fresh data, (3) same query with web_search=false but time-sensitive wording should still auto-trigger the search, (4) a non-time-sensitive query like 'what is 2+2' should NOT emit citations and should still answer, (5) confirm the persisted assistant message in GET /api/conversations/{id}/messages contains the citations array. Also re-verify a plain chat turn still works (no regressions)."
  - agent: "testing"
    message: "✅ Web search feature testing complete. All 6 tests passed: (1) Config endpoint returns web_search_enabled=true, (2) Explicit web search with web_search=true works - emits 'searching' event, 8 citations with real URLs (coinmarketcap, coindesk, binance), and response with concrete bitcoin price data, (3) Auto-detection works - time-sensitive query 'Who won the 2026 Super Bowl?' with web_search=false still triggers search and returns 8 citations, (4) Simple non-time-sensitive query 'what is 2+2' correctly does NOT trigger search and returns '4', (5) Citations properly persisted in database - GET /api/conversations/{id}/messages returns assistant message with citations array, (6) Regression test passed - normal chat with Claude Sonnet still streams correctly. NO ISSUES FOUND. Backend is production-ready."

# ARES by simpl. — Product requirements and progress

## Original goal
Rebuild the supplied ARES/Simpl AI chat screenshots closely, with working GPT/Claude conversations, personality modes, image generation, guest quota, authentication, customization, settings, and API keys. Ares Labs is outside scope. Replace Perplexity with a free live-web alternative that requires no user-supplied API key.

## Architecture
- React frontend on supervisor port 3000; FastAPI backend on port 8001; MongoDB.
- Frontend API base: `REACT_APP_BACKEND_URL`; backend database: `MONGO_URL` and `DB_NAME`.
- JWT/email authentication plus Emergent-managed Google social login; 10 guest messages.
- Emergent LLM integration for GPT/Claude and Gemini image generation.
- Keyless web research via `backend/websearch.py`; SSE citations carry `{title,url,source,date}` or legacy URL strings.
- UI: `pages/AresApp.jsx`, `components/{Sidebar,TopBar,ChatArea,Composer,Message}.jsx`, shared modal components and `styles/ares.css`.

## Previously implemented
- Multi-turn streaming chat and conversations CRUD; modes/models and image generation.
- Guest usage limit, account flows, API key creation and public chat endpoint.
- Themes, fonts, accents, backgrounds; settings.
- Keyless live web search with auto-detection and persisted citations; handoff reports six backend tests passed.
- User acceptance remains pending, including Google callback and screenshot fidelity.

## Current request
“Source Previews: Show a small favicon and headline card for each source instead of a plain link. Also, optimize the UI for mobile and tablet.”
User priority: “prioritize phone and tablet UI optimization”.

## Current implementation (2026-10-02)
- Phone/tablet navigation becomes a dismissible, focus-trapped drawer below 1100px; desktop retains the sidebar.
- Reflowed header and model/mode menus; 44px touch targets; visible touch-accessible message and conversation actions.
- Keyboard-aware visual viewport sizing, safe-area padding, readable inputs, responsive message widths and wrapping; composer grows as text wraps after rotation.
- Theme-aware, viewport-bounded accessible dialogs; three-column phone customization grids.
- Source preview cards with publisher favicon, headline, number, domain/date and external-link indicator; globe fallback for unavailable favicons. Existing source data and search backend unchanged.
- Sources link directly to original HTTP(S) URLs; no new key or third-party favicon service.
- Auth logic unchanged (form markup only received test IDs and accessible labels).

## Verification constraints
- User previously opted to test frontend personally; no frontend testing-agent browser run without permission.
- Use direct layout checks and production build verification for this incremental work.
- No credentials created/modified in this task.

## Verified results — 2026-10-02
- Production build (`yarn build`) passes. Direct browser checks used the current external URL from frontend `.env`; no testing subagent used, respecting the prior frontend testing preference.
- Layout/navigation/model/mode checks passed at 320, 390, 768, 1024 and 1440px. Desktop also loaded at 1920px. No horizontal overflow for tested controls or source cards; primary touch controls meet 44px sizing.
- Settings, Customize, API keys and signup dialog layout checks passed at 320px; customization scroll, light theme, reset and close controls verified. Modal focus containment and Escape tested.
- Drawer selection, New chat, Escape and backdrop dismissal verified on phone/tablet.
- Reduced-height viewport keeps Send visible. Touch-emulated Enter creates a newline rather than submitting. Repeated width changes resize long input from 168px to 112px without losing text or runtime errors.
- Fixed a ResizeObserver notification loop caught during verification by scheduling resize writes on the next animation frame; repeat checks pass.
- Real web search returned eight source cards. Six favicons loaded and two used the globe fallback. Source URLs open in a new tab; compact dates and persisted conversation reload verified. No application APIs mocked.
- Initial automation attempts clicked during drawer transitions; rerun after transitions passed. This was test timing, not an app failure.
- Artifacts: `/app/test_reports/responsive_source_previews.json`; direct browser logs under `/root/.emergent/automation_output/20261002_211326/` and `20261002_211659/`.
- Physical iOS/Android keyboards, native Safari and user visual acceptance remain unverified.

## Priorities / next actions
- P0: None outstanding in the current responsive/source-preview scope after direct checks.
- P1: User device acceptance, including physical iOS/Android keyboard behavior and tablet rotation.
- P1: Existing Google login callback and each model/image flow still require user acceptance.
- P2: Optional saved/bookmarked research sources; broader visual refinements based on user feedback.
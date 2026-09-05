#!/usr/bin/env python3
"""
Backend test for ARES web search feature.
Tests the new keyless web search functionality.
"""

import asyncio
import json
import sys
import httpx
from datetime import datetime

# Backend URL from frontend/.env
BASE_URL = "https://app-remake-15.preview.emergentagent.com/api"
GUEST_ID = f"test-guest-{datetime.now().timestamp()}"

# Test results tracking
tests_passed = 0
tests_failed = 0
test_details = []


def log_test(name: str, passed: bool, details: str = ""):
    """Log test result."""
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        print(f"✅ {name}")
    else:
        tests_failed += 1
        print(f"❌ {name}")
    if details:
        print(f"   {details}")
    test_details.append({"name": name, "passed": passed, "details": details})


async def test_config():
    """Test 1: GET /api/config -> web_search_enabled must be true."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(f"{BASE_URL}/config")
            if resp.status_code != 200:
                log_test("Config endpoint", False, f"Status {resp.status_code}")
                return False
            
            data = resp.json()
            if data.get("web_search_enabled") is True:
                log_test("Config: web_search_enabled=true", True, f"Provider: {data.get('web_search_provider', 'N/A')}")
                return True
            else:
                log_test("Config: web_search_enabled=true", False, f"Got: {data.get('web_search_enabled')}")
                return False
    except Exception as e:
        log_test("Config endpoint", False, f"Error: {e}")
        return False


async def test_web_search_explicit(timeout_seconds=90):
    """Test 2: POST /api/chat/stream with web_search=true and time-sensitive query."""
    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            payload = {
                "conversation_id": None,
                "text": "What is the bitcoin price today?",
                "mode": "short",
                "model": "gpt-5",
                "web_search": True
            }
            
            headers = {"X-Guest-Id": GUEST_ID}
            
            events = []
            searching_found = False
            citations_found = False
            citations_items = []
            delta_text = ""
            
            async with client.stream("POST", f"{BASE_URL}/chat/stream", json=payload, headers=headers) as resp:
                if resp.status_code != 200:
                    log_test("Web search explicit (web_search=true)", False, f"Status {resp.status_code}")
                    return None
                
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            event = json.loads(line[6:])
                            events.append(event)
                            
                            if event.get("type") == "searching":
                                searching_found = True
                            elif event.get("type") == "citations":
                                citations_found = True
                                citations_items = event.get("items", [])
                            elif event.get("type") == "delta":
                                delta_text += event.get("content", "")
                            elif event.get("type") == "meta":
                                conversation_id = event.get("conversation_id")
                        except json.JSONDecodeError:
                            pass
            
            # Verify results
            all_passed = True
            details = []
            
            if not searching_found:
                all_passed = False
                details.append("Missing 'searching' event")
            else:
                details.append("✓ 'searching' event found")
            
            if not citations_found:
                all_passed = False
                details.append("Missing 'citations' event")
            elif len(citations_items) < 2:
                all_passed = False
                details.append(f"Only {len(citations_items)} citations (need >=2)")
            else:
                details.append(f"✓ {len(citations_items)} citations found")
                # Print citation titles and URLs (short)
                for i, cit in enumerate(citations_items[:3], 1):
                    title = cit.get("title", "N/A")[:60]
                    url = cit.get("url", "N/A")[:80]
                    details.append(f"  [{i}] {title} | {url}")
            
            # Check if delta text mentions concrete price/figure
            has_number = any(char.isdigit() for char in delta_text)
            if not has_number:
                details.append("⚠️  Delta text may not contain concrete price/figure")
            else:
                details.append(f"✓ Delta text contains numbers (length: {len(delta_text)} chars)")
            
            log_test("Web search explicit (web_search=true)", all_passed, "\n   ".join(details))
            
            # Return conversation_id for later test
            return conversation_id if 'conversation_id' in locals() else None
            
    except Exception as e:
        log_test("Web search explicit (web_search=true)", False, f"Error: {e}")
        return None


async def test_web_search_auto_detect(timeout_seconds=90):
    """Test 3: POST with web_search=false but time-sensitive query should auto-trigger."""
    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            payload = {
                "conversation_id": None,
                "text": "Who won the 2026 Super Bowl?",
                "mode": "short",
                "model": "gpt-5",
                "web_search": False
            }
            
            headers = {"X-Guest-Id": GUEST_ID}
            
            searching_found = False
            citations_found = False
            citations_count = 0
            delta_text = ""
            
            async with client.stream("POST", f"{BASE_URL}/chat/stream", json=payload, headers=headers) as resp:
                if resp.status_code != 200:
                    log_test("Web search auto-detect", False, f"Status {resp.status_code}")
                    return
                
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            event = json.loads(line[6:])
                            
                            if event.get("type") == "searching":
                                searching_found = True
                            elif event.get("type") == "citations":
                                citations_found = True
                                citations_count = len(event.get("items", []))
                            elif event.get("type") == "delta":
                                delta_text += event.get("content", "")
                        except json.JSONDecodeError:
                            pass
            
            # Auto-detection should trigger search
            all_passed = searching_found and citations_found
            details = []
            
            if searching_found:
                details.append("✓ Auto-detected time-sensitive query")
            else:
                details.append("❌ Did not auto-detect time-sensitive query")
            
            if citations_found:
                details.append(f"✓ {citations_count} citations emitted")
            else:
                details.append("❌ No citations emitted")
            
            if delta_text:
                details.append(f"✓ Answer received (length: {len(delta_text)} chars)")
            
            log_test("Web search auto-detect (time-sensitive)", all_passed, "\n   ".join(details))
            
    except Exception as e:
        log_test("Web search auto-detect", False, f"Error: {e}")


async def test_no_web_search_simple(timeout_seconds=90):
    """Test 4: POST with simple query and web_search=false should NOT emit citations."""
    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            payload = {
                "conversation_id": None,
                "text": "what is 2+2",
                "mode": "short",
                "model": "gpt-5",
                "web_search": False
            }
            
            headers = {"X-Guest-Id": GUEST_ID}
            
            citations_found = False
            delta_text = ""
            
            async with client.stream("POST", f"{BASE_URL}/chat/stream", json=payload, headers=headers) as resp:
                if resp.status_code != 200:
                    log_test("No web search (simple query)", False, f"Status {resp.status_code}")
                    return
                
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            event = json.loads(line[6:])
                            
                            if event.get("type") == "citations":
                                citations_found = True
                            elif event.get("type") == "delta":
                                delta_text += event.get("content", "")
                        except json.JSONDecodeError:
                            pass
            
            # Should NOT have citations but should have answer
            all_passed = not citations_found and len(delta_text) > 0
            details = []
            
            if not citations_found:
                details.append("✓ No citations emitted (correct)")
            else:
                details.append("❌ Citations emitted (should not)")
            
            if delta_text:
                details.append(f"✓ Answer received: '{delta_text.strip()}'")
            else:
                details.append("❌ No answer received")
            
            log_test("No web search (simple query)", all_passed, "\n   ".join(details))
            
    except Exception as e:
        log_test("No web search (simple query)", False, f"Error: {e}")


async def test_citations_persistence(conversation_id: str):
    """Test 5: GET /api/conversations/{id}/messages should include citations array."""
    if not conversation_id:
        log_test("Citations persistence", False, "No conversation_id from previous test")
        return
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            headers = {"X-Guest-Id": GUEST_ID}
            resp = await client.get(f"{BASE_URL}/conversations/{conversation_id}/messages", headers=headers)
            
            if resp.status_code != 200:
                log_test("Citations persistence", False, f"Status {resp.status_code}")
                return
            
            messages = resp.json()
            
            # Find assistant message
            assistant_msg = None
            for msg in messages:
                if msg.get("role") == "assistant":
                    assistant_msg = msg
                    break
            
            if not assistant_msg:
                log_test("Citations persistence", False, "No assistant message found")
                return
            
            citations = assistant_msg.get("citations", [])
            
            if citations and len(citations) > 0:
                log_test("Citations persistence", True, f"✓ {len(citations)} citations in persisted message")
            else:
                log_test("Citations persistence", False, "No citations in persisted message")
                
    except Exception as e:
        log_test("Citations persistence", False, f"Error: {e}")


async def test_regression_normal_chat(timeout_seconds=90):
    """Test 6: Regression - normal chat with claude-sonnet-4-5-20250929 still works."""
    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            payload = {
                "conversation_id": None,
                "text": "Say hello in exactly 5 words.",
                "mode": "normal",
                "model": "claude-sonnet-4-5-20250929",
                "web_search": False
            }
            
            headers = {"X-Guest-Id": f"test-regression-{datetime.now().timestamp()}"}
            
            delta_text = ""
            done_found = False
            
            async with client.stream("POST", f"{BASE_URL}/chat/stream", json=payload, headers=headers) as resp:
                if resp.status_code != 200:
                    log_test("Regression: normal chat (Claude)", False, f"Status {resp.status_code}")
                    return
                
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            event = json.loads(line[6:])
                            
                            if event.get("type") == "delta":
                                delta_text += event.get("content", "")
                            elif event.get("type") == "done":
                                done_found = True
                        except json.JSONDecodeError:
                            pass
            
            all_passed = done_found and len(delta_text) > 0
            details = []
            
            if done_found:
                details.append("✓ Stream completed with 'done' event")
            else:
                details.append("❌ No 'done' event received")
            
            if delta_text:
                details.append(f"✓ Response received (length: {len(delta_text)} chars)")
            else:
                details.append("❌ No response text")
            
            log_test("Regression: normal chat (Claude)", all_passed, "\n   ".join(details))
            
    except Exception as e:
        log_test("Regression: normal chat (Claude)", False, f"Error: {e}")


async def main():
    """Run all tests."""
    print("=" * 80)
    print("ARES Backend Web Search Testing")
    print("=" * 80)
    print(f"Backend URL: {BASE_URL}")
    print(f"Guest ID: {GUEST_ID}")
    print("=" * 80)
    print()
    
    # Test 1: Config
    await test_config()
    print()
    
    # Test 2: Explicit web search (returns conversation_id)
    print("Testing explicit web search (may take up to 90s)...")
    conversation_id = await test_web_search_explicit()
    print()
    
    # Test 3: Auto-detect web search
    print("Testing auto-detect web search (may take up to 90s)...")
    await test_web_search_auto_detect()
    print()
    
    # Test 4: No web search for simple query
    print("Testing simple query without web search...")
    await test_no_web_search_simple()
    print()
    
    # Test 5: Citations persistence
    if conversation_id:
        await test_citations_persistence(conversation_id)
        print()
    
    # Test 6: Regression test
    print("Testing regression (normal chat)...")
    await test_regression_normal_chat()
    print()
    
    # Summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print(f"Total: {tests_passed + tests_failed}")
    print("=" * 80)
    
    if tests_failed > 0:
        sys.exit(1)
    else:
        print("\n🎉 All tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())

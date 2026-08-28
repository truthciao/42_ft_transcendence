#!/bin/bash

set -e

BASE_URL="http://localhost:3000"

# ============================================================
# Helpers
# ============================================================

print_step() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

print_ok() {
  echo "✅ $1"
}

print_error() {
  echo "❌ $1"
  exit 1
}

# ============================================================
# Check dependencies
# ============================================================

if ! command -v jq >/dev/null 2>&1; then
  print_error "jq is required. Install it with: sudo apt install jq"
fi

if ! command -v node >/dev/null 2>&1; then
  print_error "node is required"
fi

# ============================================================
# Test users
# ============================================================

TIMESTAMP=$(date +%s)

ALICE_USERNAME="alice_${TIMESTAMP}"
ALICE_EMAIL="alice_${TIMESTAMP}@test.com"
ALICE_PASSWORD="Alice12345!"

BOB_USERNAME="bob_${TIMESTAMP}"
BOB_EMAIL="bob_${TIMESTAMP}@test.com"
BOB_PASSWORD="Bob12345!"

# ============================================================
# 1. Register Alice
# ============================================================

print_step "1. Register Alice"

ALICE_REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ALICE_EMAIL\",
    \"username\": \"$ALICE_USERNAME\",
    \"password\": \"$ALICE_PASSWORD\"
  }")

echo "$ALICE_REGISTER_RESPONSE" | jq .

if echo "$ALICE_REGISTER_RESPONSE" | jq -e '.statusCode' >/dev/null 2>&1; then
  print_error "Alice registration failed"
fi

print_ok "Alice registered: $ALICE_USERNAME"

# ============================================================
# 2. Register Bob
# ============================================================

print_step "2. Register Bob"

BOB_REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$BOB_EMAIL\",
    \"username\": \"$BOB_USERNAME\",
    \"password\": \"$BOB_PASSWORD\"
  }")

echo "$BOB_REGISTER_RESPONSE" | jq .

if echo "$BOB_REGISTER_RESPONSE" | jq -e '.statusCode' >/dev/null 2>&1; then
  print_error "Bob registration failed"
fi

print_ok "Bob registered: $BOB_USERNAME"

# ============================================================
# 3. Login Alice
# ============================================================

print_step "3. Login Alice"

ALICE_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ALICE_EMAIL\",
    \"password\": \"$ALICE_PASSWORD\"
  }")

echo "$ALICE_LOGIN_RESPONSE" | jq .

ALICE_TOKEN=$(echo "$ALICE_LOGIN_RESPONSE" | jq -r \
  '.access_token // .accessToken // empty')

if [ -z "$ALICE_TOKEN" ]; then
  print_error "Could not extract Alice access token"
fi

print_ok "Alice login successful"

# ============================================================
# 4. Login Bob
# ============================================================

print_step "4. Login Bob"

BOB_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$BOB_EMAIL\",
    \"password\": \"$BOB_PASSWORD\"
  }")

echo "$BOB_LOGIN_RESPONSE" | jq .

BOB_TOKEN=$(echo "$BOB_LOGIN_RESPONSE" | jq -r \
  '.access_token // .accessToken // empty')

if [ -z "$BOB_TOKEN" ]; then
  print_error "Could not extract Bob access token"
fi

print_ok "Bob login successful"

# ============================================================
# 5. Alice creates conversation with Bob
# ============================================================

print_step "5. Alice creates conversation with Bob"

CREATE_CONVERSATION_RESPONSE=$(curl -s -X POST \
  "$BASE_URL/chat/conversations/by-username" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$BOB_USERNAME\"
  }")

echo "$CREATE_CONVERSATION_RESPONSE" | jq .

CONVERSATION_ID=$(echo "$CREATE_CONVERSATION_RESPONSE" | jq -r \
  '.id // empty')

if [ -z "$CONVERSATION_ID" ]; then
  print_error "Could not extract conversation ID"
fi

print_ok "Conversation created: $CONVERSATION_ID"

# ============================================================
# 6. Alice checks initial unreadCount
# ============================================================

print_step "6. Alice checks initial unreadCount"

ALICE_CONVERSATIONS=$(curl -s \
  "$BASE_URL/chat/conversations" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "$ALICE_CONVERSATIONS" | jq .

INITIAL_UNREAD=$(echo "$ALICE_CONVERSATIONS" | jq -r \
  ".[] | select(.id == $CONVERSATION_ID) | .unreadCount")

if [ "$INITIAL_UNREAD" != "0" ]; then
  print_error "Expected initial unreadCount = 0, got $INITIAL_UNREAD"
fi

print_ok "Initial unreadCount = 0"

# ============================================================
# 7-9. Send messages through REAL Socket.IO
# ============================================================

print_step "7-9. Bob sends 3 messages through Socket.IO"

BASE_URL="$BASE_URL" \
BOB_TOKEN="$BOB_TOKEN" \
CONVERSATION_ID="$CONVERSATION_ID" \
pnpm --filter web exec node scripts/send-messages.cjs

rm -rf "$SOCKET_TEST_DIR"

print_ok "Bob sent 3 messages through Socket.IO"

# ============================================================
# 10. Alice checks unreadCount
# ============================================================

print_step "10. Alice checks unreadCount after 3 messages"

# Give the database a short moment to finish the writes.
sleep 0.2

ALICE_CONVERSATIONS=$(curl -s \
  "$BASE_URL/chat/conversations" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "$ALICE_CONVERSATIONS" | jq .

UNREAD_COUNT=$(echo "$ALICE_CONVERSATIONS" | jq -r \
  ".[] | select(.id == $CONVERSATION_ID) | .unreadCount")

if [ "$UNREAD_COUNT" != "3" ]; then
  print_error "Expected unreadCount = 3, got $UNREAD_COUNT"
fi

print_ok "unreadCount = 3"

# ============================================================
# 11. Verify lastMessage
# ============================================================

print_step "11. Verify lastMessage"

LAST_MESSAGE=$(echo "$ALICE_CONVERSATIONS" | jq -r \
  ".[] | select(.id == $CONVERSATION_ID) | .lastMessage.content")

echo "Last message: $LAST_MESSAGE"

if [ "$LAST_MESSAGE" != "Hello Alice - message 3" ]; then
  print_error "Unexpected lastMessage: $LAST_MESSAGE"
fi

print_ok "lastMessage is correct"

# ============================================================
# 12. Alice marks conversation as read
# ============================================================

print_step "12. Alice marks conversation as read"

MARK_READ_RESPONSE=$(curl -s -X PATCH \
  "$BASE_URL/chat/conversations/$CONVERSATION_ID/message" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "$MARK_READ_RESPONSE" | jq .

print_ok "Conversation marked as read"

# ============================================================
# 13. Alice checks unreadCount again
# ============================================================

print_step "13. Alice checks unreadCount after mark as read"

ALICE_CONVERSATIONS=$(curl -s \
  "$BASE_URL/chat/conversations" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "$ALICE_CONVERSATIONS" | jq .

FINAL_UNREAD=$(echo "$ALICE_CONVERSATIONS" | jq -r \
  ".[] | select(.id == $CONVERSATION_ID) | .unreadCount")

if [ "$FINAL_UNREAD" != "0" ]; then
  print_error "Expected unreadCount = 0 after mark as read, got $FINAL_UNREAD"
fi

print_ok "Final unreadCount = 0"

# ============================================================
# Final result
# ============================================================

print_step "TEST PASSED"

echo "Alice:        $ALICE_USERNAME"
echo "Bob:          $BOB_USERNAME"
echo "Conversation: $CONVERSATION_ID"
echo
echo "Initial unreadCount: 0"
echo "After 3 messages:   3"
echo "After mark as read: 0"
echo
echo "🎉 All chat unreadCount tests passed!"



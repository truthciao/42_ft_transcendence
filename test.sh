#!/bin/bash

BASE_URL="http://localhost:3000"

ALICE_USERNAME="alice_test"
ALICE_EMAIL="alice_test@example.com"
ALICE_PASSWORD="Password123!"

BOB_USERNAME="bob_test"
BOB_EMAIL="bob_test@example.com"
BOB_PASSWORD="Password123!"

echo "===== 1. Register Alice ====="

curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$ALICE_USERNAME"'",
    "email": "'"$ALICE_EMAIL"'",
    "password": "'"$ALICE_PASSWORD"'"
  }'

echo
echo

echo "===== 2. Login Alice ====="

ALICE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$ALICE_EMAIL"'",
    "password": "'"$ALICE_PASSWORD"'"
  }')

echo "$ALICE_LOGIN"

ALICE_TOKEN=$(echo "$ALICE_LOGIN" | jq -r '.access_token')

echo "Alice token obtained"
echo

echo "===== 3. Register Bob ====="

curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob_test",
    "email": "bob_test@example.com",
    "password": "Password123!"
  }'

echo
echo

echo "===== 4. Login Bob ====="

BOB_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob_test@example.com",
    "password": "Password123!"
  }')

echo "$BOB_LOGIN"

BOB_TOKEN=$(echo "$BOB_LOGIN" | jq -r '.access_token')
BOB_ID=$(echo "$BOB_LOGIN" | jq -r '.user.id')

echo "Bob ID: $BOB_ID"
echo


echo "===== 5. Create Conversation Alice -> Bob ====="

CONVERSATION=$(curl -s -X POST "$BASE_URL/chat/conversations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{
    "targetUserId": '"$BOB_ID"'
  }')

echo "$CONVERSATION"

CONVERSATION_ID=$(echo "$CONVERSATION" | jq -r '.id')

echo
echo "Conversation ID: $CONVERSATION_ID"
echo

echo "===== 6. Get Alice Conversations ====="

curl -s \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  "$BASE_URL/chat/conversations"

echo
echo

echo "===== 7. Get Conversation Messages ====="

curl -s \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  "$BASE_URL/chat/conversations/$CONVERSATION_ID/message"

echo
echo
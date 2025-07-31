#!/bin/bash

# BudgetFlip API Test Script
# Run this script to test all API endpoints

BASE_URL="http://localhost:3000/api"
EMAIL="test$(date +%s)@budgetflip.com"
PASSWORD="password123"

echo "🧪 Testing BudgetFlip API..."
echo "================================"

# 1. Register
echo -e "\n1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")

echo "Response: $REGISTER_RESPONSE"

# 2. Login
echo -e "\n2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

echo "Token received: ${TOKEN:0:20}..."

# 3. Create Project
echo -e "\n3. Creating Project..."
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test House Flip",
    "address": "123 Test St",
    "budget": 100000,
    "start_date": "2025-08-01",
    "target_end_date": "2025-12-31",
    "status": "planning",
    "priority": "high"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Project created with ID: $PROJECT_ID"

# 4. Get Projects
echo -e "\n4. Getting All Projects..."
curl -s -X GET "$BASE_URL/projects" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 5. Create Expense
echo -e "\n5. Creating Expense..."
EXPENSE_RESPONSE=$(curl -s -X POST "$BASE_URL/expenses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"project_id\": \"$PROJECT_ID\",
    \"amount\": 1500,
    \"vendor\": \"Home Depot\",
    \"description\": \"Materials\",
    \"date\": \"2025-08-15\",
    \"payment_method\": \"credit_card\"
  }")

EXPENSE_ID=$(echo $EXPENSE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Expense created with ID: $EXPENSE_ID"

# 6. Get Project Expenses
echo -e "\n6. Getting Project Expenses..."
curl -s -X GET "$BASE_URL/expenses/project/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 7. Get Expense Stats
echo -e "\n7. Getting Expense Statistics..."
curl -s -X GET "$BASE_URL/expenses/project/$PROJECT_ID/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n✅ API tests completed!"
echo "================================"
echo "Test user: $EMAIL"
echo "Project ID: $PROJECT_ID"
echo "Expense ID: $EXPENSE_ID"
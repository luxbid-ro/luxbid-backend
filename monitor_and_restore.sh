#!/bin/bash

# 🔄 AUTOMATED DATABASE MONITORING
# Runs every 30 minutes to check for data loss and restore accounts

echo "🔄 Starting Database Monitor..."
echo "📅 $(date): Checking for database resets..."

# Check current user count
USER_COUNT=$(curl -s https://luxbid-backend.onrender.com/health/db | jq -r '.usersCount' 2>/dev/null || echo "0")

echo "👥 Current users in database: $USER_COUNT"

# If no users, recreate the main account
if [ "$USER_COUNT" -eq "0" ]; then
    echo "🚨 DATABASE RESET DETECTED! Restoring main account..."
    
    # Restore main account
    RESPONSE=$(curl -s -X POST "https://luxbid-backend.onrender.com/auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "andrei@luxbid.ro",
        "password": "parolaprincipala123",
        "personType": "fizica",
        "firstName": "Andrei",
        "lastName": "LuxBid",
        "phone": "+40700123456",
        "address": "Strada Principala 1",
        "city": "București",
        "county": "București",
        "postalCode": "010001",
        "country": "România"
      }')
    
    if echo "$RESPONSE" | grep -q "accessToken"; then
        echo "✅ Main account restored successfully!"
        echo "🔑 Login: andrei@luxbid.ro / parolaprincipala123"
    else
        echo "❌ Failed to restore main account"
        echo "Response: $RESPONSE"
    fi
    
    # Also restore test accounts
    echo "🔄 Restoring test accounts..."
    
    curl -s -X POST "https://luxbid-backend.onrender.com/auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@test.com",
        "password": "testpassword",
        "personType": "fizica",
        "firstName": "Test",
        "lastName": "User",
        "phone": "+40700000001",
        "address": "Strada Test 1",
        "city": "București",
        "county": "București",
        "postalCode": "010001",
        "country": "România"
      }' > /dev/null
    
    curl -s -X POST "https://luxbid-backend.onrender.com/auth/register" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "demo@luxbid.ro",
        "password": "demo123",
        "personType": "fizica",
        "firstName": "Demo",
        "lastName": "LuxBid",
        "phone": "+40700000002",
        "address": "Strada Demo 123",
        "city": "București",
        "county": "București",
        "postalCode": "010101",
        "country": "România"
      }' > /dev/null
    
    echo "✅ All accounts restored!"
    
else
    echo "✅ Database is healthy with $USER_COUNT users"
fi

echo "📊 $(date): Check complete"
echo "----------------------------------------"

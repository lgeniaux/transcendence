#!/bin/bash

# API endpoint URL for user registration
API_URL="http://localhost:8000/api/register-user/"

# Number of users to create
NUM_USERS=$1

# Base username, email and password to be used for creating users
BASE_USERNAME="user0"
BASE_EMAIL="user0@mail.com"
PASSWORD="17GeniauX###"

if [[ -z "$NUM_USERS" ]]; then
    echo "Usage: $0 <number_of_users>"
    exit 1
fi

for i in $(seq 1 $NUM_USERS); do
    USERNAME="${BASE_USERNAME}${i}"
    EMAIL=$(echo $BASE_EMAIL | sed "s/@/${i}@/g")
    # Make a POST request to create a new user
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"${USERNAME}\", \"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")
    
    if [[ "$RESPONSE" == "200" ]] || [[ "$RESPONSE" == "201" ]]; then
        echo "User $USERNAME created successfully."
        echo "Email: $EMAIL"
    else
        echo "Failed to create user $USERNAME. HTTP status: $RESPONSE"
    fi
done

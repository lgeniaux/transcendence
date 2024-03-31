#!/bin/bash

# API endpoint URL for user registration
API_URL="https://localhost:8443/api/register-user/"

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
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" --insecure \
        -H "Content-Type: application/json" \
        -d "{\"username\": \"${USERNAME}\", \"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")
    
    printf "\033[2m\033[90mUser $USERNAME created successfully.\n"
    printf "Email: \033[0m$EMAIL\033[2m\033[90m, Password: \033[0m$PASSWORD\n"
    if [[ "$RESPONSE" != "200" ]] && [[ "$RESPONSE" != "201" ]]; then
        printf "\033[2m\033[90mFailed to create user $USERNAME. HTTP status: \033[0m\033[1m\033[91m$RESPONSE\033[0m\n"
    fi
done

#!/bin/bash

echo "Starting Barcode Generator Application..."
echo

echo "Building and starting Docker containers..."
docker compose up --build

echo
echo "Application started!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8080"
echo

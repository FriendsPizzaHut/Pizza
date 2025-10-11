#!/bin/bash

# Test the product creation endpoint
# This will show the actual validation error

curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTk5MWIzNjk4ODYxNGUyOGNiMDk5MyIsImVtYWlsIjoibmFpdGlra3VtYXIyNDA4QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDIwMjYzMiwiZXhwIjoxNzYwMjAzNTMyfQ.NJ_7yKS1qVcMgmgCULx3Vj6FDNp6LZto7gBrE49zy_A" \
  -d '{
    "name": "Test Pizza",
    "description": "This is a test pizza.",
    "category": "pizza",
    "pricing": {
      "small": 9.99,
      "medium": 14.99,
      "large": 18.99
    },
    "imageUrl": "file:///test/image.jpeg",
    "isVegetarian": true,
    "isAvailable": true,
    "toppings": [
      {"name": "Mushrooms", "category": "vegetables"},
      {"name": "Mozzarella", "category": "cheese"}
    ]
  }' | jq '.'

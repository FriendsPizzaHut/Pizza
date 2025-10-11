# Product Schema Implementation Guide

## Overview
The Product schema has been completely redesigned to support flexible menu management for pizzas and other items with different pricing structures.

## Key Features

### 1. **Flexible Pricing System**
- **Pizza Category**: Multi-size pricing using object format
  ```javascript
  pricing: {
    small: 299,
    medium: 499,
    large: 699
  }
  ```
- **Other Categories**: Single price using number format
  ```javascript
  pricing: 149
  ```

### 2. **Auto-Generated Fields**
The following fields are automatically calculated:

#### `preparationTime`
Auto-generated based on category:
- Pizza: 20 minutes
- Sides: 10 minutes
- Beverages: 2 minutes
- Desserts: 5 minutes

#### `discountPercent`
Randomly generated between 10-25% for new products

#### `basePrice`
Auto-calculated from pricing:
- Pizza: Minimum price across all sizes
- Others: The single price value

### 3. **Rating System**
Dynamic rating based on sales performance:
- 0-9 sales: 4.0 stars
- 10-49 sales: 4.2 stars
- 50-99 sales: 4.5 stars
- 100-199 sales: 4.7 stars
- 200+ sales: 5.0 stars

### 4. **Pizza-Specific Features**
#### Toppings
Only available for pizza category:
```javascript
toppings: [
  { name: 'Mushrooms', category: 'vegetables' },
  { name: 'Pepperoni', category: 'meat' },
  { name: 'Mozzarella', category: 'cheese' },
  { name: 'Marinara', category: 'sauce' }
]
```

Topping categories: `vegetables`, `meat`, `cheese`, `sauce`

## Schema Structure

```javascript
{
  name: String (required, max 100 chars)
  description: String (required, max 500 chars)
  category: String (required, enum: 'pizza', 'sides', 'beverages', 'desserts')
  pricing: Mixed (required, object for pizza, number for others)
  basePrice: Number (required, auto-calculated)
  imageUrl: String (required, must be valid URL)
  isVegetarian: Boolean (default: false)
  toppings: Array (only for pizza)
  preparationTime: Number (required, auto-generated, min: 5)
  discountPercent: Number (default: 0, auto-generated 10-25%, max: 100)
  rating: Number (default: 4.0, min: 0, max: 5)
  salesCount: Number (default: 0)
  totalRevenue: Number (default: 0)
  isAvailable: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## Instance Methods

### `getDiscountedPrice(size)`
Calculate final price after discount:
```javascript
// For pizza
const discountedPrice = product.getDiscountedPrice('medium');

// For other items
const discountedPrice = product.getDiscountedPrice();
```

### `updateRating()`
Recalculate rating based on current sales count:
```javascript
product.updateRating();
// Returns updated rating value
```

### `incrementSales(amount)`
Record a sale and update analytics:
```javascript
await product.incrementSales(499); // Amount paid
// Automatically increments salesCount, adds to totalRevenue, and updates rating
```

## API Examples

### Create Pizza Product
```javascript
POST /api/v1/products
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with fresh mozzarella, tomatoes, and basil",
  "category": "pizza",
  "pricing": {
    "small": 299,
    "medium": 499,
    "large": 699
  },
  "imageUrl": "https://example.com/margherita.jpg",
  "isVegetarian": true,
  "toppings": [
    { "name": "Fresh Mozzarella", "category": "cheese" },
    { "name": "Fresh Basil", "category": "vegetables" },
    { "name": "Tomato Sauce", "category": "sauce" }
  ]
}
```

### Create Non-Pizza Product
```javascript
POST /api/v1/products
{
  "name": "Garlic Bread",
  "description": "Toasted bread with garlic butter and herbs",
  "category": "sides",
  "pricing": 149,
  "imageUrl": "https://example.com/garlic-bread.jpg",
  "isVegetarian": true
}
```

### Get Products with Filters
```javascript
GET /api/v1/products?category=pizza&isVegetarian=true&sortBy=rating
GET /api/v1/products?category=beverages&isAvailable=true&sortBy=price
GET /api/v1/products?sortBy=popular  // Sort by salesCount
```

### Update Product
```javascript
PATCH /api/v1/products/:id
{
  "pricing": {
    "small": 349,
    "medium": 549,
    "large": 749
  },
  "discountPercent": 20
}
```

## Validation Rules

### Pricing Validation
- **Pizza**: Must be object with at least one valid size key (`small`, `medium`, `large`)
- **Others**: Must be positive number
- All prices must be greater than 0

### Toppings Validation
- Only allowed for `category: 'pizza'`
- Each topping must have `name` and `category`
- Category must be: `vegetables`, `meat`, `cheese`, or `sauce`

### Field Constraints
- `name`: 2-100 characters
- `description`: 10-500 characters
- `imageUrl`: Must be valid HTTP/HTTPS URL
- `preparationTime`: Minimum 5 minutes
- `discountPercent`: 0-100
- `rating`: 0-5

## Pre-Save Hooks

The schema includes several pre-save hooks that run automatically:

1. **Preparation Time**: Sets based on category
2. **Discount Percent**: Randomly generates 10-25% for new products
3. **Base Price**: Calculates from pricing structure
4. **Toppings Cleanup**: Clears toppings array for non-pizza items

## Indexes

Optimized queries with the following indexes:
- `{ category: 1, isAvailable: 1 }` - Filter by category and availability
- `{ basePrice: 1 }` - Sort by price
- `{ rating: -1 }` - Sort by rating (descending)
- `{ salesCount: -1 }` - Sort by popularity (descending)

## Migration Notes

If you have existing products with the old schema:
1. Old `price` field → New `pricing` field (number)
2. Old `image` field → New `imageUrl` field
3. Category values updated: `drinks` → `beverages`
4. New fields will auto-generate on first save

## Usage in Orders

When creating orders, use the appropriate price:
```javascript
// For pizza orders
const price = product.getDiscountedPrice(selectedSize);

// For other items
const price = product.getDiscountedPrice();

// Record the sale after order completion
await product.incrementSales(price);
```

## Frontend Integration

The frontend should:
1. Display all available sizes for pizza products
2. Show single price for non-pizza products
3. Calculate and display discounted prices
4. Show preparation time estimates
5. Display ratings and popularity indicators
6. Filter products by category, vegetarian status, and availability

## Error Handling

Common validation errors:
- `"Pizza pricing must be an object..."` - Pizza product with number pricing
- `"Pricing must be a positive number..."` - Non-pizza product with object pricing
- `"Only pizza products can have toppings"` - Toppings on non-pizza item
- `"Invalid size: xl"` - Invalid size key in pricing object
- `"Image URL must be a valid HTTP/HTTPS URL"` - Invalid imageUrl format

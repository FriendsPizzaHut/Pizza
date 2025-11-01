import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

// Items from batch 5 - Special Combos and Non-Veg Pizzas
const oldMenuItems = [
  // Special Combos
  {
    name: "Non veg burger combo",
    description: "Chicken burger + fries + 500 ml cold drink",
    price: 150,
    category: "Special Combo",
    foodType: "Non-Veg",
    isVeg: false,
    popular: true
  },
  {
    name: "Veg burger combo",
    description: "Potato party Burger + fries + 500ml coke",
    price: 120,
    category: "Special Combo",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Non veg pizza combo",
    description: "Chicken pizza + chicken burger+ small fries + 750 ml coke",
    price: 300,
    category: "Special Combo",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Veg pizza combo",
    description: "Veg burger+ veg pizza+ small fries+ 750 ml coke",
    price: 250,
    category: "Special Combo",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Domestic combo",
    description: "2 pcs domestic + fries + 500 ml coke",
    price: 199,
    category: "Special Combo",
    foodType: "Non-Veg",
    isVeg: false
  },
  // Non-Veg Pizzas (multi-size)
  {
    name: "Peri peri chips pizza",
    description: "Capsicum+ chicken pizza",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    popular: true,
    hasMultipleSizes: true,
    pricing: {
      small: 150,
      medium: 250,
      large: 350
    }
  },
  {
    name: "Chicken Sausage",
    description: "Only chicken sausage",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    popular: true,
    hasMultipleSizes: true,
    pricing: {
      small: 160,
      medium: 260,
      large: 360
    }
  },
  {
    name: "Sausage Capsicum",
    description: "Capsicum+ sausage",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    popular: true,
    hasMultipleSizes: true,
    pricing: {
      small: 160,
      medium: 260,
      large: 360
    }
  },
  {
    name: "Peri peri chicken",
    description: "Capsicum+ peri peri",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    hasMultipleSizes: true,
    pricing: {
      small: 150,
      medium: 250,
      large: 350
    }
  },
  {
    name: "Chicken Hawaiian",
    description: "Onion + Capsicum+ chicken",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    hasMultipleSizes: true,
    pricing: {
      small: 150,
      medium: 250,
      large: 350
    }
  },
  {
    name: "BBQ Chicken pizza",
    description: "Onion capsicum+ BBQ Chicken",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    hasMultipleSizes: true,
    pricing: {
      small: 160,
      medium: 260,
      large: 360
    }
  },
  {
    name: "Dragon Kiss",
    description: "With vegetables chilli chicken",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    hasMultipleSizes: true,
    pricing: {
      small: 170,
      medium: 270,
      large: 370
    }
  },
  {
    name: "The Friends Overloaded Non veg",
    description: "Full chicken",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    hasMultipleSizes: true,
    pricing: {
      small: 180,
      medium: 280,
      large: 400
    }
  },
  {
    name: "Italian style non veg pizza",
    description: "Onion + capsicum+ chicken sausage",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    popular: true,
    hasMultipleSizes: true,
    pricing: {
      small: 160,
      medium: 260,
      large: 360
    }
  },
  {
    name: "Classic Chicken pizza",
    description: "Onion + tomato+ chicken",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    hasMultipleSizes: true,
    pricing: {
      small: 150,
      medium: 250,
      large: 350
    }
  },
  {
    name: "Grilled Spicy Chicken",
    description: "Onion + Jalapeno + grilled chicken",
    category: "Pizza",
    foodType: "Non-Veg",
    isVeg: false,
    hasMultipleSizes: true,
    pricing: {
      small: 160,
      medium: 260,
      large: 360
    }
  }
];

// Enhanced descriptions for better user experience
const enhancedDescriptions = {
  // Special Combos
  "Non veg burger combo": "The perfect meal deal! Get a juicy chicken burger, crispy golden fries, and a refreshing 500ml cold drink - all at an unbeatable combo price. Satisfying, delicious, and great value!",

  "Veg burger combo": "A complete vegetarian feast! Our popular Potato Party burger paired with crispy fries and a 500ml Coca-Cola. Everything you need for a satisfying meal at a special combo price.",

  "Non veg pizza combo": "Feed your cravings with this ultimate non-veg combo! Includes a mouth-watering chicken pizza, a crispy chicken burger, small portion of golden fries, and a 750ml Coca-Cola. Perfect for one hungry person or sharing!",

  "Veg pizza combo": "A vegetarian's dream combo! Get a delicious veg pizza, a tasty veg burger, small fries, and a 750ml Coca-Cola - all in one amazing deal. Great for lunch or dinner!",

  "Domestic combo": "A chicken lover's delight! Two pieces of our signature domestic chicken drumsticks (marinated in traditional Indian spices and fried to crispy perfection), served with golden fries and a 500ml Coca-Cola. Finger-licking good!",

  // Non-Veg Pizzas
  "Peri peri chips pizza": "Feel the heat! Our signature pizza loaded with spicy peri peri seasoned chicken, crispy potato chips for extra crunch, fresh capsicum, and melted mozzarella cheese. A unique fusion of flavors that's both spicy and addictive!",

  "Chicken Sausage": "Pure sausage paradise! This pizza is generously topped with premium chicken sausages, mozzarella cheese, and our signature pizza sauce. Perfect for sausage lovers who want nothing but the best!",

  "Sausage Capsicum": "A classic combination! Juicy chicken sausages paired with fresh, crunchy capsicum and melted mozzarella cheese on our hand-tossed crust. Simple, flavorful, and always satisfying!",

  "Peri peri chicken": "Spice up your pizza experience! Tender chicken pieces coated in fiery peri peri seasoning, combined with fresh capsicum and melted cheese. For those who like their pizza with a kick!",

  "Chicken Hawaiian": "Tropical flavors meet savory goodness! Succulent chicken pieces, sweet pineapple chunks, fresh onions, crisp capsicum, and melted mozzarella create a perfect sweet-and-savory harmony. A Friends Pizza Hut favorite!",

  "BBQ Chicken pizza": "Smoky, tangy, and absolutely delicious! Tender BBQ-glazed chicken, caramelized onions, fresh capsicum, and mozzarella cheese on our signature crust. The BBQ sauce adds a rich, smoky-sweet flavor that's irresistible!",

  "Dragon Kiss": "Experience the dragon's fire! Spicy Indo-Chinese style chilli chicken loaded with colorful vegetables, finished with melted cheese on our crispy pizza base. A fusion masterpiece that brings together two favorite cuisines!",

  "The Friends Overloaded Non veg": "Our most loaded pizza! Piled high with an abundance of chicken in multiple styles - grilled, spiced, and sausage - along with vegetables and extra cheese. Only for those with the biggest appetites! This is the ultimate non-veg feast!",

  "Italian style non veg pizza": "Authentic Italian flavors! Premium chicken sausages, sautéed onions, fresh capsicum, Italian herbs, and melted mozzarella on our traditional hand-tossed crust. A taste of Italy with every bite!",

  "Classic Chicken pizza": "Sometimes simple is best! Tender chicken pieces, fresh onions, juicy tomatoes, and melted mozzarella cheese. This timeless combination never goes out of style. Perfect for those who love traditional pizza flavors!",

  "Grilled Spicy Chicken": "For those who like it hot! Smoky grilled chicken, fiery jalapeños, caramelized onions, and melted cheese create a spicy sensation. Each bite delivers the perfect balance of heat and flavor!"
};

// Transform old format to new schema format
function transformMenuItem(oldItem) {
  // Map old category names to new schema categories
  const categoryMap = {
    'Special Combo': 'special-combo',
    'Pizza': 'pizza'
  };

  const transformed = {
    name: oldItem.name,
    description: enhancedDescriptions[oldItem.name] || oldItem.description,
    category: categoryMap[oldItem.category] || oldItem.category.toLowerCase().replace(/\s+/g, '-'),
    imageUrl: 'https://res.cloudinary.com/dm38ptmzl/image/upload/v1753889000/placeholder.jpg', // Placeholder image
    available: true,
    popular: oldItem.popular || false,
    foodType: oldItem.foodType,
    isVeg: oldItem.isVeg,
    rating: 4.0,
    hasMultipleSizes: oldItem.hasMultipleSizes || false,
    hasAddOns: false
  };

  // Handle pricing based on whether it has multiple sizes
  if (oldItem.hasMultipleSizes && oldItem.pricing) {
    transformed.pricing = oldItem.pricing; // Object with small, medium, large
  } else {
    transformed.pricing = oldItem.price; // Single number
  }

  return transformed;
}

// Main migration function
async function migrateMenuItems() {
  try {
    console.log('🚀 Starting menu items migration (Batch 5 - Combos & Non-Veg Pizzas)...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pizza-delivery';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each item
    for (const oldItem of oldMenuItems) {
      try {
        // Check if item already exists
        const existingItem = await Product.findOne({ name: oldItem.name });

        if (existingItem) {
          console.log(`⏭️  Skipping "${oldItem.name}" - already exists`);
          skippedCount++;
          continue;
        }

        // Transform and create new item
        const transformedItem = transformMenuItem(oldItem);
        const newProduct = new Product(transformedItem);
        await newProduct.save();

        if (oldItem.hasMultipleSizes) {
          console.log(`✅ Added: ${oldItem.name} (${transformedItem.category}) - Multi-size pizza`);
        } else {
          console.log(`✅ Added: ${oldItem.name} (${transformedItem.category}) - ₹${oldItem.price}`);
        }
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error processing "${oldItem.name}":`, error.message);
        errorCount++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully inserted: ${insertedCount} items`);
    console.log(`⏭️  Skipped (duplicates): ${skippedCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    console.log(`📝 Total processed: ${oldMenuItems.length} items`);
    console.log('='.repeat(60) + '\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('🎉 Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateMenuItems();

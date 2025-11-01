import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

// Items from batch 3 - Rice items, Cold drinks, Milkshakes, and Snacks
const oldMenuItems = [
  {
    name: "Mushroom fried rice",
    description: "Mushroom + vegetable+ fried rice",
    price: 120,
    category: "Rice Item",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Chicken seekh kabab fried rice",
    description: "Fried rice + fried chicken seekh kabab",
    price: 180,
    category: "Rice Item",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Paneer fried rice",
    description: "Paneer + vegetable + rice",
    price: 130,
    category: "Rice Item",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Fanta",
    description: "750 ml",
    price: 45,
    category: "Cold Drink",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Sprite",
    description: "750 ml",
    price: 45,
    category: "Cold Drink",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Thumbs up",
    description: "750 ml",
    price: 45,
    category: "Cold Drink",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Coca cola",
    description: "750 ml",
    price: 45,
    category: "Cold Drink",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Pineapple Shake",
    description: "Milk shake",
    price: 80,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Strawberry Shake",
    description: "Milk shake",
    price: 80,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Black currant shake",
    description: "Milk shake",
    price: 110,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Oreo shake",
    description: "Oreo",
    price: 90,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Chocolate Shake",
    description: "Milk shake",
    price: 90,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Blueberry Shake",
    description: "Blueberry",
    price: 110,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Vanilla Shake",
    description: "Milk shake",
    price: 80,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Mango Shake",
    description: "Milk Shake",
    price: 80,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Butterscotch shake",
    description: "Milk shake",
    price: 80,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Kit Kat Shake",
    description: "Kit kat",
    price: 110,
    category: "Milkshake",
    foodType: "Not Applicable",
    isVeg: false
  },
  {
    name: "Peri Peri cheese fries",
    description: "Peri peri masala + liquid cheese + mozzarella cheese",
    price: 150,
    category: "Snacks",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Peri peri fries",
    description: "Peri peri spicy masala fries",
    price: 110,
    category: "Snacks",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Salted Cheese fries",
    description: "Cheese fries",
    price: 140,
    category: "Snacks",
    foodType: "Veg",
    isVeg: true
  }
];

// Enhanced descriptions for better user experience
const enhancedDescriptions = {
  "Mushroom fried rice": "A delicious fusion of earthy mushrooms, fresh vegetables, and perfectly seasoned fried rice. Each grain is coated with aromatic spices and wok-tossed to perfection, creating a satisfying vegetarian meal that's both flavorful and wholesome.",

  "Chicken seekh kabab fried rice": "An indulgent combination of fragrant fried rice topped with succulent, spice-marinated chicken seekh kababs. The smoky, tender kababs perfectly complement the aromatic rice, making this a hearty and protein-rich meal.",

  "Paneer fried rice": "Fresh cubes of soft paneer (Indian cottage cheese) stir-fried with colorful vegetables and aromatic rice. Seasoned with Indo-Chinese spices, this vegetarian delight offers a perfect balance of textures and flavors in every bite.",

  "Fanta": "Refresh yourself with this iconic orange-flavored carbonated soft drink. Served ice-cold in a 750ml bottle, it's the perfect sweet and tangy companion to your meal.",

  "Sprite": "Crisp, clean, and refreshing! This lemon-lime flavored carbonated beverage comes in a 750ml bottle and offers the perfect palate cleanser with its clear, bubbly taste.",

  "Thumbs up": "Experience the bold, intense cola flavor with a strong fizz! This 750ml bottle of India's favorite strong cola is perfect for those who like their drinks with an extra kick.",

  "Coca cola": "The world's most popular cola! Enjoy the classic, refreshing taste of Coca-Cola in a 750ml bottle - the perfect accompaniment to pizzas, burgers, and all your favorite foods.",

  "Pineapple Shake": "Tropical paradise in a glass! Our creamy pineapple milkshake blends fresh pineapple flavor with rich, cold milk, creating a sweet and tangy treat that's both refreshing and indulgent.",

  "Strawberry Shake": "Sweet, fruity, and utterly delicious! This classic strawberry milkshake combines the fresh taste of strawberries with creamy milk, creating a pink-hued beverage that's as beautiful as it is tasty.",

  "Black currant shake": "Rich, deep, and luxuriously flavored! Our black currant milkshake features the distinctive sweet-tart taste of black currants blended with creamy milk, offering a sophisticated and refreshing beverage experience.",

  "Oreo shake": "Cookie lovers' dream! Crushed Oreo cookies blended into thick, creamy milk create this indulgent shake. Each sip delivers chunks of chocolatey cookie goodness - a dessert and drink in one!",

  "Chocolate Shake": "Pure chocolate bliss! Rich, velvety chocolate blended with cold milk creates this classic shake that satisfies every chocolate craving. Thick, creamy, and absolutely irresistible.",

  "Blueberry Shake": "Antioxidant-rich and delicious! Our blueberry milkshake combines the sweet-tart flavor of blueberries with creamy milk, creating a beautiful purple beverage that's both healthy and indulgent.",

  "Vanilla Shake": "Simple perfection! This classic vanilla milkshake features the pure, sweet taste of vanilla blended with rich, cold milk. Sometimes the simplest flavors are the most satisfying.",

  "Mango Shake": "The king of fruits meets creamy milk! Our mango shake captures the tropical sweetness and rich flavor of ripe mangoes, creating a thick, golden beverage that's like summer in a glass.",

  "Butterscotch shake": "Sweet, buttery, and caramel-flavored perfection! This butterscotch milkshake combines the rich taste of butterscotch with creamy milk, offering a nostalgic and indulgent treat.",

  "Kit Kat Shake": "Give yourself a break with this chocolatey delight! Real Kit Kat chocolate wafer bars blended into thick, creamy milk create a crunchy, smooth shake that's pure indulgence.",

  "Peri Peri cheese fries": "The ultimate loaded fries experience! Crispy golden fries generously topped with our signature peri peri spice blend, drizzled with liquid cheese sauce, and finished with melted mozzarella. Spicy, cheesy, and absolutely addictive!",

  "Peri peri fries": "Turn up the heat! Our perfectly crispy french fries are tossed in authentic peri peri spice blend, delivering a fiery kick with every bite. For those who like their snacks with a spicy twist!",

  "Salted Cheese fries": "Classic comfort food elevated! Golden, crispy fries topped with melted cheese and a sprinkle of salt. Simple, satisfying, and cheesy goodness in every bite - perfect for sharing (or not!)."
};

// Transform old format to new schema format
function transformMenuItem(oldItem) {
  // Map old category names to new schema categories
  const categoryMap = {
    'Rice Item': 'rice-items',
    'Cold Drink': 'cold-drinks',
    'Milkshake': 'milkshakes',
    'Snacks': 'snacks'
  };

  const transformed = {
    name: oldItem.name,
    description: enhancedDescriptions[oldItem.name] || oldItem.description,
    category: categoryMap[oldItem.category] || oldItem.category.toLowerCase().replace(/\s+/g, '-'),
    imageUrl: 'https://res.cloudinary.com/dm38ptmzl/image/upload/v1753889000/placeholder.jpg', // Placeholder image
    pricing: oldItem.price, // Single price for non-pizza items
    available: true,
    popular: false,
    foodType: oldItem.foodType,
    isVeg: oldItem.isVeg,
    rating: 4.0,
    hasMultipleSizes: false,
    hasAddOns: false
  };

  return transformed;
}

// Main migration function
async function migrateMenuItems() {
  try {
    console.log('🚀 Starting menu items migration (Batch 3)...\n');

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

        console.log(`✅ Added: ${oldItem.name} (${transformedItem.category}) - ₹${oldItem.price}`);
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

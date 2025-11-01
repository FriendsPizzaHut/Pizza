import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

// Items from batch 4 - Snacks, Noodles, and Pasta
const oldMenuItems = [
  {
    name: "Classic salted fries",
    description: "Salt fries",
    price: 100,
    category: "Snacks",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Chilli chicken",
    description: "Chicken + chilli",
    price: 250,
    category: "Snacks",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Chicken Manchurian",
    description: "Chicken Manchurian",
    price: 250,
    category: "Snacks",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Cheese chilli",
    description: "Cheese + chilli",
    price: 250,
    category: "Snacks",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Cheese finger",
    description: "Cheese",
    price: 180,
    category: "Snacks",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Honey chilli potato",
    description: "Honey + chilli",
    price: 200,
    category: "Snacks",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Veg noodles",
    description: "Noodles",
    price: 100,
    category: "Noodles",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Veg hakka noodles",
    description: "Hakka noodles",
    price: 100,
    category: "Noodles",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Chilli garlic noodles",
    description: "Chilli + garlic",
    price: 120,
    category: "Noodles",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Chilli garlic chicken noodles",
    description: "Chicken + chilli + garlic",
    price: 170,
    category: "Noodles",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Chicken hakka noodles",
    description: "This is not spicy",
    price: 150,
    category: "Noodles",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Chicken noodles",
    description: "Chicken",
    price: 150,
    category: "Noodles",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Non veg arabita pasta",
    description: "Pasta + chicken + red sauce gravy + cheese",
    price: 150,
    category: "Pasta",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Veg arabita pasta",
    description: "Red sauce gravy + cheese + Vegetables + pasta",
    price: 120,
    category: "Pasta",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Veg Alfredo pasta",
    description: "Pasta + vegetables + white sauce gravy + cheese",
    price: 120,
    category: "Pasta",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Non veg Alfredo pasta",
    description: "Pasta + chicken + white sauce gravy + cheese",
    price: 150,
    category: "Pasta",
    foodType: "Non-Veg",
    isVeg: false
  },
  {
    name: "Veg makhani pasta",
    description: "Pasta + vegetables + makhani gravy + cheese",
    price: 150,
    category: "Pasta",
    foodType: "Veg",
    isVeg: true
  },
  {
    name: "Chicken makhani pasta",
    description: "Chicken + makhani gravy + cheese",
    price: 170,
    category: "Pasta",
    foodType: "Non-Veg",
    isVeg: false
  }
];

// Enhanced descriptions for better user experience
const enhancedDescriptions = {
  "Classic salted fries": "The timeless classic! Golden, crispy french fries cooked to perfection and lightly seasoned with just the right amount of salt. Simple, satisfying, and always a crowd favorite. Perfect as a side or a snack on their own.",

  "Chilli chicken": "A fiery Indo-Chinese favorite! Tender chicken pieces marinated and deep-fried, then tossed in a spicy, tangy sauce with bell peppers, onions, and green chilies. The perfect balance of heat and flavor that will leave you wanting more.",

  "Chicken Manchurian": "A beloved Indo-Chinese classic! Juicy chicken pieces coated in a flavorful batter, deep-fried until crispy, and tossed in a rich, savory Manchurian sauce with hints of soy, garlic, and ginger. A perfect blend of sweet, sour, and spicy notes.",

  "Cheese chilli": "For vegetarians who love bold flavors! Crispy fried cheese cubes tossed in a spicy, tangy Indo-Chinese sauce with bell peppers, onions, and green chilies. A vegetarian twist on the classic chilli recipe that's equally delicious and addictive.",

  "Cheese finger": "Crispy golden goodness! Sticks of creamy mozzarella cheese coated in a seasoned batter and deep-fried until the outside is crunchy and the inside is melted perfection. Serve with your favorite dipping sauce for the ultimate comfort snack.",

  "Honey chilli potato": "A sweet and spicy sensation! Crispy fried potato strips tossed in a glossy honey-chilli glaze that perfectly balances sweetness with a kick of heat. Garnished with sesame seeds and spring onions, this Indo-Chinese favorite is irresistibly addictive.",

  "Veg noodles": "A vegetarian delight! Fresh vegetables stir-fried with perfectly cooked noodles in a light soy-based sauce. Simple, wholesome, and satisfying - this classic dish is comfort food at its finest.",

  "Veg hakka noodles": "Authentic Indo-Chinese style! Traditional hakka noodles tossed with crisp vegetables, aromatic garlic, and savory sauces. Each strand is perfectly coated with flavor, making this a restaurant favorite you can enjoy any time.",

  "Chilli garlic noodles": "For those who like it hot! Noodles stir-fried with a generous amount of fresh garlic and fiery red chillies, creating a spicy, aromatic dish that's bold and flavorful. Every bite packs a punch of garlic and heat.",

  "Chilli garlic chicken noodles": "The ultimate spicy noodle experience! Tender chicken pieces and vegetables tossed with noodles in a fiery chilli-garlic sauce. This protein-packed dish delivers intense flavors and satisfying heat in every forkful.",

  "Chicken hakka noodles": "Classic comfort food! Tender chicken pieces and fresh vegetables stir-fried with hakka noodles in a mild, savory sauce. Not spicy, just perfectly flavored - ideal for those who prefer milder tastes without compromising on taste.",

  "Chicken noodles": "Simple and delicious! Juicy chicken pieces tossed with soft noodles and vegetables in a light, savory sauce. A protein-rich meal that's satisfying, flavorful, and never goes out of style.",

  "Non veg arabita pasta": "Italian meets Indian! Al dente pasta coated in a rich, spicy tomato-based arrabbiata sauce, loaded with tender chicken pieces and topped with melted cheese. This fusion dish brings the best of both worlds to your plate.",

  "Veg arabita pasta": "Spicy Italian perfection! Pasta tossed in a zesty red sauce with fresh vegetables and generous amounts of cheese. The arrabbiata sauce brings just the right amount of heat, making every bite exciting and flavorful.",

  "Veg Alfredo pasta": "Creamy indulgence! Pasta enveloped in a rich, velvety white Alfredo sauce made with cream, butter, and cheese, mixed with fresh vegetables. This Italian classic is comfort food at its most luxurious.",

  "Non veg Alfredo pasta": "Decadent and satisfying! Tender chicken pieces and pasta swimming in a luscious, creamy Alfredo sauce, finished with a generous topping of melted cheese. Pure comfort in every creamy, cheesy bite.",

  "Veg makhani pasta": "An Indian twist on Italian! Pasta coated in a rich, buttery makhani gravy - the same delicious tomato-cream sauce used in butter chicken - loaded with vegetables and topped with cheese. A unique fusion that's absolutely delicious.",

  "Chicken makhani pasta": "The best of both cuisines! Succulent chicken pieces and pasta bathed in a creamy, aromatic makhani gravy with butter, tomatoes, and Indian spices, finished with melted cheese. This fusion dish is a flavor explosion you won't forget."
};

// Transform old format to new schema format
function transformMenuItem(oldItem) {
  // Map old category names to new schema categories
  const categoryMap = {
    'Snacks': 'snacks',
    'Noodles': 'noodles',
    'Pasta': 'pasta'
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
    console.log('🚀 Starting menu items migration (Batch 4 - Snacks, Noodles, Pasta)...\n');

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

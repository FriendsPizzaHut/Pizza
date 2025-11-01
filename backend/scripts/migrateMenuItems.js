/**
 * Menu Items Migration Script - Batch 2
 * 
 * This script migrates items 21-40 to the new database format.
 * It transforms the data structure to match the current Product model schema.
 * 
 * Usage: node migrateMenuItems.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';

dotenv.config();

// Menu items data (items 21-40)
const oldMenuItems = [
    {
        name: "Domestic",
        description: "4 pcs",
        category: "Sides",
        price: 220,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887229/menu-item.jpg"
    },
    {
        name: "Domestic combo",
        description: "2 pcs domestic+ fries + coke",
        category: "Sides",
        price: 190,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887270/menu-item.jpg"
    },
    {
        name: "Paneer tikka",
        description: "Paneer+ Onion",
        category: "Grilled Sandwich",
        price: 100,
        available: true,
        popular: true,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887564/menu-item.jpg"
    },
    {
        name: "Veg Cheese",
        description: "Onion + capsicum+ sweet corn+ mushroom+ cheese",
        category: "Grilled Sandwich",
        price: 80,
        available: true,
        popular: true,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887624/menu-item.jpg"
    },
    {
        name: "Paneer sweet corn",
        description: "Paneer+ sweet corn+ cheese",
        category: "Grilled Sandwich",
        price: 110,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887708/menu-item.jpg"
    },
    {
        name: "Mushroom and Cheese",
        description: "Mushroom+ onion + cheese",
        category: "Grilled Sandwich",
        price: 100,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887776/menu-item.jpg"
    },
    {
        name: "Chicken tikka cheese",
        description: "Roasted chicken+ paneer",
        category: "Grilled Sandwich",
        price: 100,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887841/menu-item.jpg"
    },
    {
        name: "Non veg Club",
        description: "3 bread",
        category: "Grilled Sandwich",
        price: 130,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887937/menu-item.jpg"
    },
    {
        name: "Veg club",
        description: "3 bread",
        category: "Grilled Sandwich",
        price: 120,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753887992/menu-item.jpg"
    },
    {
        name: "Eggs and chicken sandwich",
        description: "Chicken+ onion + egg",
        category: "Grilled Sandwich",
        price: 110,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888042/menu-item.jpg"
    },
    {
        name: "Bombay masala sandwich",
        description: "Friends pizza hut special",
        category: "Grilled Sandwich",
        price: 150,
        available: true,
        popular: true,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888097/menu-item.jpg"
    },
    {
        name: "Potato Party Burger",
        description: "Aloo tikki + veggies",
        category: "Burger",
        price: 50,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888191/menu-item.jpg"
    },
    {
        name: "Veggie lover cheese burger",
        description: "Aloo tikki + cheese + Veggies",
        category: "Burger",
        price: 60,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888264/menu-item.jpg"
    },
    {
        name: "Crispy chicken burger",
        description: "Chicken+ cheese+ veggies",
        category: "Burger",
        price: 120,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888329/menu-item.jpg"
    },
    {
        name: "Crispy cheese paneer burger",
        description: "Paneer tikki + cheese + veggies",
        category: "Burger",
        price: 100,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888384/menu-item.jpg"
    },
    {
        name: "Mushroom melt burger",
        description: "Cheese + mushroom+ aloo tikki",
        category: "Burger",
        price: 80,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888453/menu-item.jpg"
    },
    {
        name: "Chicken burger",
        description: "Chicken tikka+ cheese + veggies",
        category: "Burger",
        price: 100,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888508/menu-item.jpg"
    },
    {
        name: "Hot brownie",
        description: "Hot chocolate brownie",
        category: "Sweets",
        price: 60,
        available: true,
        popular: false,
        isVeg: true,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888580/menu-item.jpg"
    },
    {
        name: "Special big non veg combo",
        description: "1 large chicken pizza +2 chicken burgers+1 chicken sandwich+1 fries +coke",
        category: "Special Combo",
        price: 1000,
        available: true,
        popular: false,
        isVeg: false,
        image: "https://res.cloudinary.com/dm38ptmzl/image/upload/v1753888645/menu-item.jpg"
    }
];

// Enhanced descriptions for each item
const enhancedDescriptions = {
    "Domestic": "Four pieces of succulent chicken drumsticks, marinated in traditional Indian spices and deep-fried to crispy perfection. Each piece is golden brown on the outside while remaining juicy and tender inside. A perfect appetizer or side dish for chicken lovers!",

    "Domestic combo": "The perfect value meal! Two pieces of our signature domestic chicken drumsticks paired with crispy golden french fries and a chilled Coca-Cola. This combo is designed to satisfy your cravings without breaking the bank. Great for a quick lunch or snack!",

    "Paneer tikka": "Grilled to perfection! Fresh cubes of Indian cottage cheese (paneer) marinated in aromatic tandoori spices, layered with caramelized onions between perfectly toasted bread. The smoky flavors of the grill combined with the creamy paneer create an irresistible sandwich experience.",

    "Veg Cheese": "A vegetarian's dream sandwich! Loaded with fresh onions, colorful bell peppers, sweet corn kernels, and earthy mushrooms, all smothered in melted cheese and grilled between crispy bread slices. Each bite delivers a perfect crunch with a medley of flavors and textures.",

    "Paneer sweet corn": "A delightful combination of protein-rich paneer cubes and sweet American corn, generously layered with melted cheese. This sandwich offers a perfect balance of savory and slightly sweet flavors, all pressed between golden-grilled bread. Nutritious and delicious!",

    "Mushroom and Cheese": "For mushroom enthusiasts! Sautéed button mushrooms combined with caramelized onions and multiple layers of gooey cheese, all pressed between crispy grilled bread. The earthy mushroom flavor melds beautifully with the rich, creamy cheese for a sophisticated sandwich experience.",

    "Chicken tikka cheese": "Tender pieces of tandoori chicken tikka, marinated in aromatic spices and grilled to smoky perfection, combined with fresh paneer and melted cheese. This fusion sandwich brings together the best of Indian flavors with Western sandwich convenience. Protein-packed and absolutely delicious!",

    "Non veg Club": "A towering triple-decker sandwich for serious appetites! Three slices of toasted bread layered with grilled chicken, crispy bacon, fresh lettuce, juicy tomatoes, eggs, and mayonnaise. This classic club sandwich is a complete meal in itself, perfect for when you're really hungry!",

    "Veg club": "The vegetarian version of the classic club sandwich! Three layers of toasted bread filled with fresh vegetables, cheese, lettuce, tomatoes, cucumbers, and our special mayonnaise spread. Each layer offers different flavors and textures, making every bite interesting and satisfying.",

    "Eggs and chicken sandwich": "A protein powerhouse! Grilled chicken pieces combined with fluffy scrambled eggs and caramelized onions, all pressed between toasted bread. This hearty sandwich is perfect for breakfast, lunch, or any time you need a filling, nutritious meal.",

    "Bombay masala sandwich": "Our signature creation! A Friends Pizza Hut exclusive featuring a medley of boiled potatoes, onions, tomatoes, and capsicum, all mashed and seasoned with our secret Bombay masala spice blend. Loaded with chutneys and grilled to crispy perfection. This iconic street-food-inspired sandwich is bursting with bold, tangy flavors!",

    "Potato Party Burger": "Budget-friendly and delicious! A crispy aloo (potato) tikki patty, perfectly seasoned and fried until golden, served in a soft bun with fresh lettuce, tomatoes, onions, and our special sauce. This vegetarian burger proves that simple ingredients can create amazing flavors. Perfect for kids and adults alike!",

    "Veggie lover cheese burger": "Take the potato party to the next level! Our signature aloo tikki patty topped with a generous slice of melted cheese, fresh crisp vegetables, and creamy sauces, all sandwiched in a toasted bun. The combination of crispy patty, gooey cheese, and crunchy veggies creates texture heaven!",

    "Crispy chicken burger": "A classic done right! Juicy chicken breast fillet, coated in our special crispy batter and deep-fried to golden perfection. Topped with melted cheese, fresh lettuce, tomatoes, onions, and pickles, all dressed with our signature burger sauce. Every bite is an explosion of flavor and crunch!",

    "Crispy cheese paneer burger": "Indian flavors meet burger perfection! A crispy-fried paneer tikki patty seasoned with aromatic spices, topped with melted cheese and fresh vegetables, served in a toasted bun with mint and tamarind chutneys. This fusion burger is uniquely delicious and surprisingly addictive!",

    "Mushroom melt burger": "A gourmet vegetarian burger! Crispy aloo tikki topped with sautéed mushrooms, multiple layers of melted cheese, caramelized onions, and garlic mayo. The umami-rich mushrooms combined with creamy cheese create a sophisticated flavor profile that rivals any meat burger.",

    "Chicken burger": "Simple yet spectacular! Tender chicken tikka pieces marinated in Indian spices, grilled to smoky perfection, and topped with cheese, fresh veggies, and our special tandoori mayo. This burger brings authentic Indian flavors to the classic burger format. Juicy, spicy, and utterly satisfying!",

    "Hot brownie": "Indulge in chocolatey heaven! A warm, freshly baked chocolate brownie with a crispy exterior and a fudgy, molten center. Rich, decadent, and incredibly satisfying. Serve it warm with a scoop of vanilla ice cream for the ultimate dessert experience. Perfect for chocolate lovers!",

    "Special big non veg combo": "The ultimate feast for groups! This massive combo includes one large chicken pizza loaded with your favorite toppings, two crispy chicken burgers, one grilled chicken sandwich, a generous portion of golden french fries, and refreshing Coca-Cola. Perfect for family gatherings, parties, or when you're seriously hungry. Best value for money!"
};

// Transform old item to new format
function transformMenuItem(oldItem) {
    const category = oldItem.category.toLowerCase().replace(' ', '-');

    // Generate pricing based on category
    let pricing;
    if (category === 'pizza') {
        // Multi-size pricing for pizzas
        pricing = {
            small: 99,
            medium: 149,
            large: 199
        };
    } else {
        // Single price for non-pizza items
        pricing = oldItem.price || 150;
    }

    // Get enhanced description
    const enhancedDesc = enhancedDescriptions[oldItem.name] || oldItem.description;

    // Transform to new format
    const newItem = {
        name: oldItem.name,
        description: enhancedDesc,
        category: category,
        pricing: pricing,
        imageUrl: oldItem.image,
        isVegetarian: oldItem.isVeg || false,
        isAvailable: oldItem.available !== false,
    };

    return newItem;
}

// Main migration function
async function migrateMenuItems() {
    try {
        console.log('🔄 Starting menu items migration (Batch 2: Items 21-40)...');
        console.log('📡 Connecting to MongoDB...');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check existing count
        const existingCount = await Product.countDocuments({});
        console.log(`📊 Existing products in database: ${existingCount}`);

        console.log('\n🔄 Transforming menu items...');
        const transformedItems = oldMenuItems.map(transformMenuItem);

        console.log(`📝 Transformed ${transformedItems.length} items`);

        // Check for duplicates by name
        console.log('\n🔍 Checking for duplicate items...');
        const itemNames = transformedItems.map(item => item.name);
        const existingItems = await Product.find({ name: { $in: itemNames } });
        const existingNames = existingItems.map(item => item.name);

        // Filter out duplicates
        const newItems = transformedItems.filter(item => !existingNames.includes(item.name));

        if (existingNames.length > 0) {
            console.log(`⚠️  Found ${existingNames.length} duplicate items (will skip):`);
            existingNames.forEach(name => console.log(`   - ${name}`));
        }

        if (newItems.length === 0) {
            console.log('\n✅ All items already exist in database. Nothing to migrate.');
            console.log('💡 If you want to re-import, delete existing products first.');
            return;
        }

        console.log(`\n✅ ${newItems.length} new items to insert`);
        console.log('\n📦 Sample transformed item:');
        console.log(JSON.stringify(newItems[0], null, 2));

        console.log('\n💾 Inserting items into database...');
        const insertedItems = await Product.insertMany(newItems);

        console.log(`✅ Successfully inserted ${insertedItems.length} menu items!`);

        // Display summary
        console.log('\n📊 Migration Summary:');
        console.log(`   Total items migrated: ${insertedItems.length}`);

        const grilledSandwichCount = insertedItems.filter(item => item.category === 'grilled-sandwich').length;
        const burgerCount = insertedItems.filter(item => item.category === 'burger').length;
        const sidesCount = insertedItems.filter(item => item.category === 'sides').length;
        const sweetsCount = insertedItems.filter(item => item.category === 'sweets').length;
        const comboCount = insertedItems.filter(item => item.category === 'special-combo').length;
        const vegCount = insertedItems.filter(item => item.isVegetarian).length;
        const nonVegCount = insertedItems.filter(item => !item.isVegetarian).length;

        console.log(`   Grilled Sandwiches: ${grilledSandwichCount}`);
        console.log(`   Burgers: ${burgerCount}`);
        console.log(`   Sides: ${sidesCount}`);
        console.log(`   Sweets: ${sweetsCount}`);
        console.log(`   Special Combos: ${comboCount}`);
        console.log(`   Vegetarian: ${vegCount}`);
        console.log(`   Non-Vegetarian: ${nonVegCount}`);

        console.log('\n✨ Migration completed successfully!');
        console.log(`📈 Total products now in database: ${existingCount + insertedItems.length}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run migration
console.log('🚀 Friends Pizza Hub - Menu Items Migration (Batch 2)');
console.log('===================================================\n');

migrateMenuItems();

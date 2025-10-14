/**
 * WhatsApp Helper Utility
 * 
 * Formats order details for sharing via WhatsApp
 * Used to share order information with kitchen staff
 */

import { Linking, Alert } from 'react-native';

/**
 * Format order details for WhatsApp message
 * @param order - Order object from API
 * @returns Formatted WhatsApp message string
 */
export const formatOrderForWhatsApp = (order: any): string => {
    try {
        const customerName = order.user?.name || 'Unknown Customer';
        const customerPhone = order.user?.phone || order.contactPhone || 'N/A';
        const orderNumber = order.orderNumber || order._id || 'N/A';
        const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';

        // Format delivery address
        const address = order.deliveryAddress
            ? `${order.deliveryAddress.street || ''}\n${order.deliveryAddress.city || ''}, ${order.deliveryAddress.zipCode || ''}`.trim()
            : 'N/A';

        // Format items list
        const items = (order.items || []).map((item: any, index: number) => {
            // Use correct API field structure
            const productSnapshot = item.productSnapshot || item.product || {};
            const itemName = productSnapshot.name || item.name || 'Unknown Item';
            const quantity = item.quantity || 1;
            const size = item.size ? item.size.charAt(0).toUpperCase() + item.size.slice(1) : null;

            // Use selectedPrice (per unit) and subtotal from API
            const itemPrice = item.selectedPrice || productSnapshot.basePrice || 0;
            const subtotal = item.subtotal || 0;

            let itemText = `${index + 1}. ${quantity}x ${itemName}`;
            if (size) {
                itemText += ` (${size})`;
            }
            itemText += ` - ₹${itemPrice.toFixed(0)} each`;

            // Add custom toppings if present (correct field name from API)
            const customToppings = item.customToppings || [];
            if (customToppings.length > 0) {
                const toppingsText = customToppings.map((topping: any) =>
                    `   • ${topping.name}${topping.price > 0 ? ` (+₹${topping.price.toFixed(0)})` : ''}`
                ).join('\n');
                itemText += '\n' + toppingsText;
            }

            // Add special instructions if present
            if (item.specialInstructions) {
                itemText += `\n   📝 ${item.specialInstructions}`;
            }

            // Add item subtotal
            itemText += `\n   Subtotal: ₹${subtotal.toFixed(0)}`;

            return itemText;
        }).join('\n\n');

        // Calculate totals
        const subtotal = order.subtotal || 0;
        const deliveryFee = order.deliveryFee || 0;
        const tax = order.tax || 0;
        const discount = order.discount || 0;
        const total = order.totalAmount || order.total || 0;

        // Build the message
        const message = `
🍕 *NEW ORDER ALERT!* 🍕
━━━━━━━━━━━━━━━━━━━━

📋 *Order ID:* ${orderNumber}
⏰ *Time:* ${createdAt}

👤 *Customer Details:*
Name: ${customerName}
Phone: ${customerPhone}

📍 *Delivery Address:*
${address}

🍴 *Order Items:*
${items}

💰 *Payment Summary:*
Subtotal: ₹${subtotal.toFixed(0)}
Delivery Fee: ₹${deliveryFee.toFixed(0)}
Tax: ₹${tax.toFixed(0)}
${discount > 0 ? `Discount: -₹${discount.toFixed(0)}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
*Total: ₹${total.toFixed(0)}*

💳 *Payment:* ${order.paymentMethod || 'Cash'}

${order.specialInstructions ? `📝 *Special Instructions:*\n${order.specialInstructions}\n\n` : ''}━━━━━━━━━━━━━━━━━━━━
⚡ *Please prepare this order ASAP!*
        `.trim();

        return message;
    } catch (error) {
        console.error('Error formatting order for WhatsApp:', error);
        return 'Error formatting order details';
    }
};

/**
 * Open WhatsApp with pre-filled message
 * @param phoneNumber - WhatsApp number (with country code, without +)
 * @param message - Pre-filled message text
 */
export const shareOnWhatsApp = async (phoneNumber: string, message: string): Promise<boolean> => {
    try {
        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);

        // WhatsApp URL with phone number
        const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;

        // Check if WhatsApp can be opened
        const canOpen = await Linking.canOpenURL(whatsappUrl);

        if (!canOpen) {
            Alert.alert(
                'WhatsApp Not Found',
                'WhatsApp is not installed on this device. Please install WhatsApp to share order details.',
                [{ text: 'OK' }]
            );
            return false;
        }

        // Open WhatsApp
        await Linking.openURL(whatsappUrl);
        console.log('✅ WhatsApp opened successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Error opening WhatsApp:', error);
        Alert.alert(
            'Error',
            'Failed to open WhatsApp. Please try again.',
            [{ text: 'OK' }]
        );
        return false;
    }
};

/**
 * Share order to kitchen via WhatsApp
 * @param order - Order object from API
 * @param kitchenPhoneNumber - Kitchen staff WhatsApp number (default: 919060557296)
 */
export const shareOrderToKitchen = async (order: any, kitchenPhoneNumber: string = '919060557296'): Promise<boolean> => {
    try {
        console.log('📱 Sharing order to kitchen via WhatsApp');
        console.log('  - Order ID:', order.orderNumber || order._id);
        console.log('  - Kitchen Number:', kitchenPhoneNumber);

        // Format the message
        const message = formatOrderForWhatsApp(order);

        // Open WhatsApp
        const success = await shareOnWhatsApp(kitchenPhoneNumber, message);

        if (success) {
            console.log('✅ Order shared to kitchen successfully');
        }

        return success;
    } catch (error) {
        console.error('❌ Error sharing order to kitchen:', error);
        return false;
    }
};

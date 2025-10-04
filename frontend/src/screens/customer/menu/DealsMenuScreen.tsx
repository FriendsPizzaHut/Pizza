import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function DealsMenuScreen() {
    const deals = [
        {
            id: 1,
            name: 'Family Feast',
            description: '2 Large Pizzas + Garlic Bread + 2L Coke',
            originalPrice: 54.97,
            dealPrice: 39.99,
            savings: 14.98,
            image: '🍕🍕',
            validUntil: '2024-02-29',
            isPopular: true,
        },
        {
            id: 2,
            name: 'Pizza & Wings Combo',
            description: 'Large Pizza + 8 Buffalo Wings + Medium Drink',
            originalPrice: 32.97,
            dealPrice: 24.99,
            savings: 7.98,
            image: '🍕🍗',
            validUntil: '2024-02-15',
            isPopular: false,
        },
        {
            id: 3,
            name: 'Student Special',
            description: 'Medium Pizza + Garlic Bread + Small Drink',
            originalPrice: 23.97,
            dealPrice: 16.99,
            savings: 6.98,
            image: '🎓🍕',
            validUntil: '2024-03-31',
            isPopular: true,
        },
        {
            id: 4,
            name: 'Date Night Deal',
            description: '2 Personal Pizzas + 2 Drinks + Dessert',
            originalPrice: 28.97,
            dealPrice: 21.99,
            savings: 6.98,
            image: '💕🍕',
            validUntil: '2024-02-14',
            isPopular: false,
        },
        {
            id: 5,
            name: 'Weekend Warriors',
            description: '3 Large Pizzas + 3 Sides + 3L Drinks',
            originalPrice: 79.97,
            dealPrice: 59.99,
            savings: 19.98,
            image: '🎉🍕',
            validUntil: '2024-02-28',
            isPopular: true,
        },
        {
            id: 6,
            name: 'Lunch Express',
            description: 'Personal Pizza + Side + Drink',
            originalPrice: 16.97,
            dealPrice: 11.99,
            savings: 4.98,
            image: '⚡🍕',
            validUntil: '2024-02-29',
            isPopular: false,
        },
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateSavingsPercentage = (original: number, deal: number) => {
        return Math.round(((original - deal) / original) * 100);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🔥 Special Deals</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryDescription}>
                        Limited time offers - save big on your favorite combinations!
                    </Text>
                </View>

                {deals.map((deal) => (
                    <TouchableOpacity key={deal.id} style={styles.dealCard}>
                        {deal.isPopular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>🔥 POPULAR</Text>
                            </View>
                        )}

                        <View style={styles.dealImage}>
                            <Text style={styles.dealEmoji}>{deal.image}</Text>
                        </View>

                        <View style={styles.dealInfo}>
                            <Text style={styles.dealName}>{deal.name}</Text>
                            <Text style={styles.dealDescription}>{deal.description}</Text>

                            <View style={styles.priceSection}>
                                <View style={styles.priceInfo}>
                                    <Text style={styles.originalPrice}>${deal.originalPrice}</Text>
                                    <Text style={styles.dealPrice}>${deal.dealPrice}</Text>
                                </View>

                                <View style={styles.savingsInfo}>
                                    <Text style={styles.savingsAmount}>Save ${deal.savings}</Text>
                                    <Text style={styles.savingsPercentage}>
                                        {calculateSavingsPercentage(deal.originalPrice, deal.dealPrice)}% OFF
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.validitySection}>
                                <Text style={styles.validityText}>
                                    Valid until: {formatDate(deal.validUntil)}
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.orderButton}>
                                <Text style={styles.orderButtonText}>Order Now</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.termsSection}>
                    <Text style={styles.termsTitle}>📋 Deal Terms</Text>
                    <Text style={styles.termsText}>
                        • Deals cannot be combined with other offers{'\n'}
                        • Prices may vary by location{'\n'}
                        • Limited time offers subject to availability{'\n'}
                        • Delivery charges apply separately
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#FF6B6B',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    categoryInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    dealCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        position: 'relative',
    },
    popularBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#ff4444',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        zIndex: 1,
    },
    popularText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dealImage: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#f8f8f8',
    },
    dealEmoji: {
        fontSize: 40,
    },
    dealInfo: {
        padding: 20,
    },
    dealName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    dealDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 18,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    priceInfo: {
        flex: 1,
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    dealPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    savingsInfo: {
        alignItems: 'flex-end',
    },
    savingsAmount: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    savingsPercentage: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    validitySection: {
        marginBottom: 15,
    },
    validityText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    orderButton: {
        backgroundColor: '#FF6B6B',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    orderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    termsSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    termsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    termsText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
});
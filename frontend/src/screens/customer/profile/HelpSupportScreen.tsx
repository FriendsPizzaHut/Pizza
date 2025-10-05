import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HelpSupportScreen() {
    const navigation = useNavigation();
    const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

    const faqs = [
        {
            id: 1,
            question: 'How do I track my order?',
            answer: 'You can track your order in real-time from the \'My Orders\' section. You\'ll receive push notifications about order status updates including preparation, dispatch, and delivery.',
        },
        {
            id: 2,
            question: 'What are your delivery charges?',
            answer: 'Free delivery on orders above ₹199. Below that, delivery charges of ₹29 apply. No delivery charges for pickup orders.',
        },
        {
            id: 3,
            question: 'Can I modify my order after placing it?',
            answer: 'You can modify your order within 2 minutes of placing it from the order confirmation screen. After that, please contact our support team for assistance.',
        },
        {
            id: 4,
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards, UPI payments, net banking, mobile wallets like Paytm & GPay, and cash on delivery for your convenience.',
        },
        {
            id: 5,
            question: 'Do you offer vegetarian and vegan options?',
            answer: 'Yes! We have extensive vegetarian options and select vegan pizzas. Look for the green dot (veg) and \'V\' symbol (vegan) on menu items.',
        },
        {
            id: 6,
            question: 'What\'s your refund policy?',
            answer: 'Full refund is provided if order is cancelled within 5 minutes of placing. For quality issues, we offer full refund, store credit, or replacement based on the situation.',
        },
    ];

    const contactOptions = [
        {
            icon: 'phone',
            title: 'Call Us',
            subtitle: '+91 98765 43210',
            description: 'Available 24/7 for urgent matters',
            color: '#4CAF50',
        },
        {
            icon: 'email',
            title: 'Email Support',
            subtitle: 'support@friendspizzahut.com',
            description: 'We respond within 4 hours',
            color: '#FF9800',
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" backgroundColor="#fff" />

            {/* Clean Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Help & Support</Text>
                    <View style={styles.placeholder} />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Contact Section */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#4CAF50', '#45A049']}
                        style={styles.sectionHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="support-agent" size={20} color="white" />
                        <Text style={styles.sectionTitle}>Quick Contact</Text>
                    </LinearGradient>

                    <View style={styles.sectionContent}>
                        {contactOptions.map((option, index) => (
                            <TouchableOpacity key={index} style={styles.contactCard}>
                                <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                                    <MaterialIcons name={option.icon as any} size={24} color={option.color} />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactTitle}>{option.title}</Text>
                                    <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                                    <Text style={styles.contactDescription}>{option.description}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#2196F3', '#1976D2']}
                        style={styles.sectionHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="help-outline" size={20} color="white" />
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    </LinearGradient>

                    <View style={styles.sectionContent}>
                        {faqs.map((faq) => (
                            <View key={faq.id} style={styles.faqCard}>
                                <TouchableOpacity
                                    style={styles.faqQuestion}
                                    onPress={() => setSelectedFaq(selectedFaq === faq.id ? null : faq.id)}
                                >
                                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                    <MaterialIcons
                                        name={selectedFaq === faq.id ? "expand-less" : "expand-more"}
                                        size={24}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                                {selectedFaq === faq.id && (
                                    <View style={styles.faqAnswer}>
                                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Additional Resources */}
                <View style={styles.section}>
                    <LinearGradient
                        colors={['#9C27B0', '#7B1FA2']}
                        style={styles.sectionHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="library-books" size={20} color="white" />
                        <Text style={styles.sectionTitle}>Additional Resources</Text>
                    </LinearGradient>

                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.resourceButton}>
                            <MaterialIcons name="description" size={20} color="#666" />
                            <Text style={styles.resourceButtonText}>Terms of Service</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resourceButton}>
                            <MaterialIcons name="privacy-tip" size={20} color="#666" />
                            <Text style={styles.resourceButtonText}>Privacy Policy</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resourceButton}>
                            <MaterialIcons name="help-center" size={20} color="#666" />
                            <Text style={styles.resourceButtonText}>App Tutorial</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingBottom: 20,
    },
    section: {
        marginTop: 16,
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        flex: 1,
    },
    sectionContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    contactSubtitle: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        marginBottom: 2,
    },
    contactDescription: {
        fontSize: 11,
        color: '#999',
    },
    faqCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    faqQuestionText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        marginRight: 12,
    },
    faqAnswer: {
        paddingBottom: 16,
        paddingRight: 36,
    },
    faqAnswerText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    resourceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    resourceButtonText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        fontWeight: '500',
    },
});
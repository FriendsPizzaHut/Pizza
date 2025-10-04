import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

export default function HelpSupportScreen() {
    const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
    const [message, setMessage] = useState('');

    const faqs = [
        {
            id: 1,
            question: 'How long does delivery take?',
            answer: 'Our standard delivery time is 25-35 minutes. During peak hours (lunch and dinner), it may take up to 45 minutes. You\'ll receive real-time updates on your order status.',
        },
        {
            id: 2,
            question: 'What are your delivery charges?',
            answer: 'Delivery is free for orders above $20. For orders below $20, we charge a $2.99 delivery fee. No hidden charges!',
        },
        {
            id: 3,
            question: 'Can I modify or cancel my order?',
            answer: 'You can modify or cancel your order within 5 minutes of placing it. After that, the preparation begins and changes aren\'t possible.',
        },
        {
            id: 4,
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and cash on delivery.',
        },
        {
            id: 5,
            question: 'Do you have vegan options?',
            answer: 'Yes! We offer vegan cheese and a variety of vegetable toppings. All our pizza doughs are vegan-friendly except the garlic bread crust.',
        },
    ];

    const contactOptions = [
        {
            title: '📞 Call Us',
            subtitle: '+1 (555) 123-PIZZA',
            description: 'Available 24/7 for urgent matters',
        },
        {
            title: '💬 Live Chat',
            subtitle: 'Chat with our support team',
            description: 'Mon-Sun: 9 AM - 11 PM',
        },
        {
            title: '📧 Email Support',
            subtitle: 'support@friendspizzahut.com',
            description: 'We respond within 4 hours',
        },
    ];

    const handleSendMessage = () => {
        if (message.trim()) {
            Alert.alert(
                'Message Sent!',
                'Thank you for contacting us. We\'ll get back to you within 4 hours.',
                [{ text: 'OK', onPress: () => setMessage('') }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>❓ Help & Support</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Quick Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Contact</Text>
                    {contactOptions.map((option, index) => (
                        <TouchableOpacity key={index} style={styles.contactCard}>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactTitle}>{option.title}</Text>
                                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                                <Text style={styles.contactDescription}>{option.description}</Text>
                            </View>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {faqs.map((faq) => (
                        <View key={faq.id} style={styles.faqCard}>
                            <TouchableOpacity
                                style={styles.faqQuestion}
                                onPress={() => setSelectedFaq(selectedFaq === faq.id ? null : faq.id)}
                            >
                                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                <Text style={[styles.faqArrow, selectedFaq === faq.id && styles.faqArrowOpen]}>
                                    {selectedFaq === faq.id ? '−' : '+'}
                                </Text>
                            </TouchableOpacity>
                            {selectedFaq === faq.id && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Contact Form */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Send us a Message</Text>
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Describe your issue or question..."
                            multiline
                            numberOfLines={6}
                            value={message}
                            onChangeText={setMessage}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                            <Text style={styles.sendButtonText}>Send Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Additional Resources */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Resources</Text>

                    <TouchableOpacity style={styles.resourceButton}>
                        <Text style={styles.resourceButtonText}>📋 Terms of Service</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resourceButton}>
                        <Text style={styles.resourceButtonText}>🔒 Privacy Policy</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resourceButton}>
                        <Text style={styles.resourceButtonText}>📱 App Tutorial</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
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
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginVertical: 8,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    contactCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    contactSubtitle: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '500',
        marginBottom: 2,
    },
    contactDescription: {
        fontSize: 12,
        color: '#666',
    },
    arrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    faqCard: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    faqQuestionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    faqArrow: {
        fontSize: 20,
        color: '#FF6B6B',
        fontWeight: 'bold',
        width: 25,
        textAlign: 'center',
    },
    faqArrowOpen: {
        transform: [{ rotate: '0deg' }],
    },
    faqAnswer: {
        paddingBottom: 15,
        paddingRight: 25,
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    formContainer: {
        marginTop: 10,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        minHeight: 120,
        marginBottom: 15,
    },
    sendButton: {
        backgroundColor: '#FF6B6B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resourceButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resourceButtonText: {
        fontSize: 16,
        color: '#333',
    },
});
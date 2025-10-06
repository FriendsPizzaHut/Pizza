import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddOfferScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute();
    const params = route.params as { offer?: any } | undefined;
    const editingOffer = params?.offer;

    // Form state based on HomeOfferItem structure
    const [badge, setBadge] = useState(''); // e.g., "50% OFF", "₹100 OFF"
    const [title, setTitle] = useState(''); // e.g., "Mega Pizza Sale"
    const [subtitle, setSubtitle] = useState(''); // e.g., "Get 50% off on all large pizzas Min order: ₹299"
    const [code, setCode] = useState(''); // e.g., "PIZZA50"
    const [selectedTheme, setSelectedTheme] = useState(0);

    // Color themes matching HomeScreen
    const offerThemes = [
        {
            name: 'Orange',
            bgColor: '#FF5722',
            gradientColors: ['#FF9800', '#FF5722'] as const,
        },
        {
            name: 'Blue',
            bgColor: '#2196F3',
            gradientColors: ['#03A9F4', '#1976D2'] as const,
        },
        {
            name: 'Green',
            bgColor: '#4CAF50',
            gradientColors: ['#8BC34A', '#388E3C'] as const,
        },
        {
            name: 'Purple',
            bgColor: '#9C27B0',
            gradientColors: ['#BA68C8', '#7B1FA2'] as const,
        },
        {
            name: 'Red',
            bgColor: '#F44336',
            gradientColors: ['#FF5252', '#D32F2F'] as const,
        },
    ];

    // Load offer data for editing
    useEffect(() => {
        if (editingOffer) {
            setBadge(editingOffer.badge || '');
            setTitle(editingOffer.title || '');
            setSubtitle(editingOffer.subtitle || '');
            setCode(editingOffer.code || '');

            // Find theme index based on bgColor
            const themeIndex = offerThemes.findIndex(
                theme => theme.bgColor === editingOffer.bgColor
            );
            if (themeIndex !== -1) {
                setSelectedTheme(themeIndex);
            }
        }
    }, [editingOffer]);

    const validateForm = () => {
        if (!badge.trim()) {
            Alert.alert('Validation Error', 'Please enter a badge text (e.g., "50% OFF")');
            return false;
        }
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Please enter an offer title');
            return false;
        }
        if (!subtitle.trim()) {
            Alert.alert('Validation Error', 'Please enter offer description/subtitle');
            return false;
        }
        if (!code.trim()) {
            Alert.alert('Validation Error', 'Please enter an offer code');
            return false;
        }
        return true;
    };

    const handleSaveOffer = () => {
        if (!validateForm()) return;

        const offerData = {
            id: editingOffer?.id || Date.now().toString(),
            badge: badge.trim(),
            title: title.trim(),
            subtitle: subtitle.trim(),
            code: code.trim().toUpperCase(),
            bgColor: offerThemes[selectedTheme].bgColor,
            gradientColors: offerThemes[selectedTheme].gradientColors,
        };

        // TODO: Save to API or storage
        console.log(editingOffer ? 'Updated Offer:' : 'New Offer:', offerData);

        Alert.alert(
            'Success',
            editingOffer ? 'Offer updated successfully!' : 'Offer created successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f2" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#2d2d2d" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Preview Card */}
                    <View style={styles.previewSection}>
                        <Text style={styles.sectionTitle}>Preview</Text>
                        <View style={styles.previewCard}>
                            <LinearGradient
                                colors={offerThemes[selectedTheme].gradientColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.previewGradient}
                            >
                                {/* Badge */}
                                <View style={styles.previewBadge}>
                                    <Text style={styles.previewBadgeText}>
                                        {badge || 'BADGE'}
                                    </Text>
                                </View>

                                {/* Content */}
                                <View style={styles.previewContent}>
                                    <Text style={styles.previewTitle}>
                                        {title || 'Offer Title'}
                                    </Text>
                                    <Text style={styles.previewSubtitle}>
                                        {subtitle || 'Offer description goes here'}
                                    </Text>
                                </View>

                                {/* Code Section */}
                                <View style={styles.previewCodeSection}>
                                    <View style={styles.previewDottedBorder}>
                                        <Text style={styles.previewCodeLabel}>USE CODE</Text>
                                        <Text style={styles.previewCodeValue}>
                                            {code || 'CODE'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Decorative Pizza */}
                                <Text style={styles.previewDecorPizza}>🍕</Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Form Inputs */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Offer Details</Text>

                        {/* Badge Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Badge Text *</Text>
                            <Text style={styles.inputHint}>e.g., "50% OFF", "₹100 OFF", "BUY 1 GET 1"</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter badge text"
                                placeholderTextColor="#999"
                                value={badge}
                                onChangeText={setBadge}
                            />
                        </View>

                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Offer Title *</Text>
                            <Text style={styles.inputHint}>e.g., "Mega Pizza Sale"</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter offer title"
                                placeholderTextColor="#999"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Subtitle Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description *</Text>
                            <Text style={styles.inputHint}>Include minimum order value and terms</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="e.g., Get 50% off on all large pizzas Min order: ₹299"
                                placeholderTextColor="#999"
                                value={subtitle}
                                onChangeText={setSubtitle}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Code Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Offer Code *</Text>
                            <Text style={styles.inputHint}>Uppercase alphanumeric code</Text>
                            <TextInput
                                style={[styles.input, styles.codeInput]}
                                placeholder="e.g., PIZZA50"
                                placeholderTextColor="#999"
                                value={code}
                                onChangeText={(text) => setCode(text.toUpperCase())}
                                autoCapitalize="characters"
                            />
                        </View>

                        {/* Theme Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Theme Color *</Text>
                            <Text style={styles.inputHint}>Choose a color theme for the offer</Text>
                            <View style={styles.themeGrid}>
                                {offerThemes.map((theme, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.themeOption,
                                            selectedTheme === index && styles.themeOptionSelected,
                                        ]}
                                        onPress={() => setSelectedTheme(index)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={theme.gradientColors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.themeGradient}
                                        >
                                            {selectedTheme === index && (
                                                <MaterialIcons name="check" size={24} color="#fff" />
                                            )}
                                        </LinearGradient>
                                        <Text style={styles.themeName}>{theme.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <View style={styles.buttonSection}>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveOffer}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons
                                name={editingOffer ? "save" : "add-circle"}
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.saveButtonText}>
                                {editingOffer ? 'Update Offer' : 'Create Offer'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f2',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 50,
        backgroundColor: '#f4f4f2',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F8F8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d2d2d',
    },
    placeholder: {
        width: 40,
    },

    // Preview Section
    previewSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2d2d2d',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    previewCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    previewGradient: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        minHeight: 200,
        justifyContent: 'space-between',
        position: 'relative',
    },
    previewBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    previewBadgeText: {
        fontSize: 13,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    previewContent: {
        zIndex: 1,
    },
    previewTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    previewSubtitle: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.95,
        lineHeight: 18,
        marginBottom: 16,
    },
    previewCodeSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
    },
    previewDottedBorder: {
        borderWidth: 1,
        borderColor: '#fff',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    previewCodeLabel: {
        fontSize: 10,
        color: '#fff',
        opacity: 0.8,
        fontWeight: '600',
        marginBottom: 4,
    },
    previewCodeValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    previewDecorPizza: {
        position: 'absolute',
        fontSize: 80,
        opacity: 0.15,
        right: -10,
        top: 40,
    },

    // Form Section
    formSection: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d2d2d',
        marginBottom: 4,
    },
    inputHint: {
        fontSize: 12,
        color: '#8E8E93',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#2d2d2d',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    codeInput: {
        fontWeight: '700',
        letterSpacing: 1,
    },

    // Theme Selection
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    themeOption: {
        width: 60,
        alignItems: 'center',
    },
    themeOptionSelected: {
        transform: [{ scale: 1.05 }],
    },
    themeGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    themeName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginTop: 6,
        textAlign: 'center',
    },

    // Buttons
    buttonSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    saveButton: {
        backgroundColor: '#cb202d',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#cb202d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 12,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },

    bottomSpacing: {
        height: 40,
    },
});

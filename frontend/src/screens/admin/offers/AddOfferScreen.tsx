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
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '../../../api/axiosInstance';

export default function AddOfferScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute();
    const params = route.params as { offer?: any } | undefined;
    const editingOffer = params?.offer;

    // Form state - mapping to backend Offer model
    const [badge, setBadge] = useState(''); // Maps to badge field
    const [title, setTitle] = useState(''); // Maps to title field
    const [description, setDescription] = useState(''); // Maps to description field (was subtitle)
    const [code, setCode] = useState(''); // Maps to code field
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [minOrderValue, setMinOrderValue] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

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
            setDescription(editingOffer.description || editingOffer.subtitle || '');
            setCode(editingOffer.code || '');
            setDiscountType(editingOffer.discountType || 'percentage');
            setDiscountValue(editingOffer.discountValue?.toString() || '');
            setMaxDiscount(editingOffer.maxDiscount?.toString() || '');
            setMinOrderValue(editingOffer.minOrderValue?.toString() || '');
            setUsageLimit(editingOffer.usageLimit?.toString() || '');
            setIsActive(editingOffer.isActive !== false);

            // Parse dates if available
            if (editingOffer.validFrom) {
                const date = new Date(editingOffer.validFrom);
                setValidFrom(date.toISOString().split('T')[0]);
            }
            if (editingOffer.validUntil) {
                const date = new Date(editingOffer.validUntil);
                setValidUntil(date.toISOString().split('T')[0]);
            }

            // Find theme index based on bgColor
            const themeIndex = offerThemes.findIndex(
                theme => theme.bgColor === editingOffer.bgColor
            );
            if (themeIndex !== -1) {
                setSelectedTheme(themeIndex);
            }
        } else {
            // Set default dates for new offer
            const today = new Date();
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            setValidFrom(today.toISOString().split('T')[0]);
            setValidUntil(nextMonth.toISOString().split('T')[0]);
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
        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter offer description');
            return false;
        }
        if (!code.trim()) {
            Alert.alert('Validation Error', 'Please enter an offer code');
            return false;
        }
        if (!discountValue || parseFloat(discountValue) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid discount value');
            return false;
        }
        if (discountType === 'percentage' && parseFloat(discountValue) > 100) {
            Alert.alert('Validation Error', 'Percentage discount cannot exceed 100%');
            return false;
        }
        if (!minOrderValue || parseFloat(minOrderValue) < 0) {
            Alert.alert('Validation Error', 'Please enter a valid minimum order value');
            return false;
        }
        if (!validFrom || !validUntil) {
            Alert.alert('Validation Error', 'Please select validity dates');
            return false;
        }
        if (new Date(validUntil) <= new Date(validFrom)) {
            Alert.alert('Validation Error', 'End date must be after start date');
            return false;
        }
        return true;
    };

    const handleSaveOffer = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Prepare data for backend API
            const offerData = {
                title: title.trim(),
                description: description.trim(),
                code: code.trim().toUpperCase(),
                badge: badge.trim(),
                discountType,
                discountValue: parseFloat(discountValue),
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
                minOrderValue: parseFloat(minOrderValue),
                validFrom,
                validUntil,
                usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
                gradientColors: offerThemes[selectedTheme].gradientColors,
                bgColor: offerThemes[selectedTheme].bgColor,
                isActive,
            };

            let response;
            if (editingOffer && editingOffer._id) {
                // Update existing offer
                response = await axiosInstance.patch(
                    `/offers/admin/${editingOffer._id}`,
                    offerData
                );
            } else {
                // Create new offer
                response = await axiosInstance.post('/offers/admin', offerData);
            }

            if (response.data.success) {
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
            }
        } catch (error: any) {
            console.error('Save offer error:', error);
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to save offer. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
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
                                        {description || 'Offer description goes here'}
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

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description *</Text>
                            <Text style={styles.inputHint}>Include minimum order value and terms</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="e.g., Get 50% off on all large pizzas Min order: ₹299"
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={setDescription}
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

                        {/* Discount Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Discount Type *</Text>
                            <View style={styles.discountTypeContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.discountTypeButton,
                                        discountType === 'percentage' && styles.discountTypeButtonActive,
                                    ]}
                                    onPress={() => setDiscountType('percentage')}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons
                                        name="percent"
                                        size={20}
                                        color={discountType === 'percentage' ? '#fff' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            styles.discountTypeText,
                                            discountType === 'percentage' && styles.discountTypeTextActive,
                                        ]}
                                    >
                                        Percentage
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.discountTypeButton,
                                        discountType === 'fixed' && styles.discountTypeButtonActive,
                                    ]}
                                    onPress={() => setDiscountType('fixed')}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons
                                        name="currency-rupee"
                                        size={20}
                                        color={discountType === 'fixed' ? '#fff' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            styles.discountTypeText,
                                            discountType === 'fixed' && styles.discountTypeTextActive,
                                        ]}
                                    >
                                        Fixed Amount
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Discount Value */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                {discountType === 'percentage' ? 'Discount Percentage *' : 'Discount Amount *'}
                            </Text>
                            <Text style={styles.inputHint}>
                                {discountType === 'percentage'
                                    ? 'Enter value between 1-100'
                                    : 'Fixed amount in ₹'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={discountType === 'percentage' ? 'e.g., 50' : 'e.g., 100'}
                                placeholderTextColor="#999"
                                value={discountValue}
                                onChangeText={setDiscountValue}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Max Discount (only for percentage) */}
                        {discountType === 'percentage' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Maximum Discount Cap (Optional)</Text>
                                <Text style={styles.inputHint}>Maximum discount amount in ₹</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 200"
                                    placeholderTextColor="#999"
                                    value={maxDiscount}
                                    onChangeText={setMaxDiscount}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}

                        {/* Min Order Value */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Minimum Order Value *</Text>
                            <Text style={styles.inputHint}>Minimum cart value required in ₹</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 299"
                                placeholderTextColor="#999"
                                value={minOrderValue}
                                onChangeText={setMinOrderValue}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Valid From */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Valid From *</Text>
                            <Text style={styles.inputHint}>Start date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2025-10-19"
                                placeholderTextColor="#999"
                                value={validFrom}
                                onChangeText={setValidFrom}
                            />
                        </View>

                        {/* Valid Until */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Valid Until *</Text>
                            <Text style={styles.inputHint}>End date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2025-12-31"
                                placeholderTextColor="#999"
                                value={validUntil}
                                onChangeText={setValidUntil}
                            />
                        </View>

                        {/* Usage Limit */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Usage Limit (Optional)</Text>
                            <Text style={styles.inputHint}>Maximum number of times this offer can be used</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 100"
                                placeholderTextColor="#999"
                                value={usageLimit}
                                onChangeText={setUsageLimit}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Active Toggle */}
                        <View style={styles.inputGroup}>
                            <View style={styles.toggleRow}>
                                <View>
                                    <Text style={styles.inputLabel}>Active Status</Text>
                                    <Text style={styles.inputHint}>Make this offer immediately available</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.toggle, isActive && styles.toggleActive]}
                                    onPress={() => setIsActive(!isActive)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.toggleThumb, isActive && styles.toggleThumbActive]} />
                                </TouchableOpacity>
                            </View>
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
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSaveOffer}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <MaterialIcons
                                        name={editingOffer ? "save" : "add-circle"}
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.saveButtonText}>
                                        {editingOffer ? 'Update Offer' : 'Create Offer'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                            disabled={loading}
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

    // Discount Type
    discountTypeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    discountTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    discountTypeButtonActive: {
        backgroundColor: '#cb202d',
        borderColor: '#cb202d',
    },
    discountTypeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
    },
    discountTypeTextActive: {
        color: '#fff',
    },

    // Toggle
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggle: {
        width: 56,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E0E0E0',
        padding: 2,
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: '#4CAF50',
    },
    toggleThumb: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleThumbActive: {
        transform: [{ translateX: 24 }],
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
    saveButtonDisabled: {
        opacity: 0.6,
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

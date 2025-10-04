import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

export default function StaffManagementScreen() {
    const [selectedTab, setSelectedTab] = useState('staff');

    const staffMembers = [
        {
            id: '1',
            name: 'John Smith',
            role: 'Manager',
            phone: '+1 (555) 123-4567',
            email: 'john.smith@pizzahut.com',
            status: 'Active',
            shift: 'Day Shift',
            joinDate: '2023-01-15',
            permissions: ['Orders', 'Menu', 'Staff', 'Reports'],
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            role: 'Kitchen Staff',
            phone: '+1 (555) 234-5678',
            email: 'sarah.johnson@pizzahut.com',
            status: 'Active',
            shift: 'Day Shift',
            joinDate: '2023-03-22',
            permissions: ['Orders'],
        },
        {
            id: '3',
            name: 'Mike Brown',
            role: 'Cashier',
            phone: '+1 (555) 345-6789',
            email: 'mike.brown@pizzahut.com',
            status: 'Active',
            shift: 'Evening Shift',
            joinDate: '2023-05-10',
            permissions: ['Orders', 'Menu'],
        },
        {
            id: '4',
            name: 'Emma Wilson',
            role: 'Delivery Driver',
            phone: '+1 (555) 456-7890',
            email: 'emma.wilson@pizzahut.com',
            status: 'On Leave',
            shift: 'Night Shift',
            joinDate: '2023-02-28',
            permissions: ['Orders'],
        },
    ];

    const roles = [
        { name: 'Manager', permissions: ['Orders', 'Menu', 'Staff', 'Reports', 'Settings'] },
        { name: 'Assistant Manager', permissions: ['Orders', 'Menu', 'Reports'] },
        { name: 'Kitchen Staff', permissions: ['Orders'] },
        { name: 'Cashier', permissions: ['Orders', 'Menu'] },
        { name: 'Delivery Driver', permissions: ['Orders'] },
    ];

    const handleAddStaff = () => {
        // Handle add staff
        console.log('Add staff');
    };

    const handleEditStaff = (staffId: string) => {
        // Handle edit staff
        console.log('Edit staff:', staffId);
    };

    const handleToggleStatus = (staffId: string) => {
        Alert.alert(
            'Change Status',
            'Are you sure you want to change this staff member\'s status?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => console.log('Status changed for:', staffId) },
            ]
        );
    };

    const renderStaffView = () => (
        <View>
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{staffMembers.length}</Text>
                    <Text style={styles.statLabel}>Total Staff</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{staffMembers.filter(s => s.status === 'Active').length}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{roles.length}</Text>
                    <Text style={styles.statLabel}>Roles</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>Shifts</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
                <Text style={styles.addButtonText}>➕ Add New Staff Member</Text>
            </TouchableOpacity>

            {staffMembers.map((staff) => (
                <View key={staff.id} style={styles.staffCard}>
                    <View style={styles.staffHeader}>
                        <View style={styles.staffInfo}>
                            <Text style={styles.staffName}>{staff.name}</Text>
                            <Text style={styles.staffRole}>{staff.role}</Text>
                        </View>
                        <View style={styles.staffStatus}>
                            <Text style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: staff.status === 'Active' ? '#4CAF50' : '#FF9800',
                                    color: '#fff'
                                }
                            ]}>
                                {staff.status}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.staffDetails}>
                        <Text style={styles.staffContact}>📧 {staff.email}</Text>
                        <Text style={styles.staffContact}>📞 {staff.phone}</Text>
                        <Text style={styles.staffShift}>🕐 {staff.shift}</Text>
                        <Text style={styles.staffJoinDate}>📅 Joined: {staff.joinDate}</Text>
                    </View>

                    <View style={styles.staffPermissions}>
                        <Text style={styles.permissionsTitle}>Permissions:</Text>
                        <View style={styles.permissionsTags}>
                            {staff.permissions.map((permission, index) => (
                                <View key={index} style={styles.permissionTag}>
                                    <Text style={styles.permissionText}>{permission}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.staffActions}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditStaff(staff.id)}
                        >
                            <Text style={styles.editButtonText}>✏️ Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                { backgroundColor: staff.status === 'Active' ? '#FF9800' : '#4CAF50' }
                            ]}
                            onPress={() => handleToggleStatus(staff.id)}
                        >
                            <Text style={styles.statusButtonText}>
                                {staff.status === 'Active' ? '⏸️ Suspend' : '▶️ Activate'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderRolesView = () => (
        <View>
            <TouchableOpacity style={styles.addButton} onPress={() => console.log('Add role')}>
                <Text style={styles.addButtonText}>➕ Add New Role</Text>
            </TouchableOpacity>

            {roles.map((role, index) => (
                <View key={index} style={styles.roleCard}>
                    <View style={styles.roleHeader}>
                        <Text style={styles.roleName}>{role.name}</Text>
                        <Text style={styles.roleStaffCount}>
                            {staffMembers.filter(s => s.role === role.name).length} staff members
                        </Text>
                    </View>

                    <View style={styles.rolePermissions}>
                        <Text style={styles.permissionsTitle}>Permissions:</Text>
                        <View style={styles.permissionsTags}>
                            {role.permissions.map((permission, permIndex) => (
                                <View key={permIndex} style={styles.permissionTag}>
                                    <Text style={styles.permissionText}>{permission}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editRoleButton}
                        onPress={() => console.log('Edit role:', role.name)}
                    >
                        <Text style={styles.editRoleButtonText}>✏️ Edit Role</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );

    const renderScheduleView = () => (
        <View>
            <View style={styles.shiftStats}>
                <View style={styles.shiftCard}>
                    <Text style={styles.shiftTitle}>☀️ Day Shift</Text>
                    <Text style={styles.shiftTime}>8:00 AM - 4:00 PM</Text>
                    <Text style={styles.shiftStaff}>
                        {staffMembers.filter(s => s.shift === 'Day Shift').length} staff
                    </Text>
                </View>
                <View style={styles.shiftCard}>
                    <Text style={styles.shiftTitle}>🌅 Evening Shift</Text>
                    <Text style={styles.shiftTime}>4:00 PM - 12:00 AM</Text>
                    <Text style={styles.shiftStaff}>
                        {staffMembers.filter(s => s.shift === 'Evening Shift').length} staff
                    </Text>
                </View>
                <View style={styles.shiftCard}>
                    <Text style={styles.shiftTitle}>🌙 Night Shift</Text>
                    <Text style={styles.shiftTime}>12:00 AM - 8:00 AM</Text>
                    <Text style={styles.shiftStaff}>
                        {staffMembers.filter(s => s.shift === 'Night Shift').length} staff
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>📅 This Week's Schedule</Text>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <View key={index} style={styles.daySchedule}>
                    <Text style={styles.dayName}>{day}</Text>
                    <View style={styles.dayShifts}>
                        <Text style={styles.dayShiftInfo}>Day: 3 staff</Text>
                        <Text style={styles.dayShiftInfo}>Evening: 2 staff</Text>
                        <Text style={styles.dayShiftInfo}>Night: 1 staff</Text>
                    </View>
                    <TouchableOpacity style={styles.editScheduleButton}>
                        <Text style={styles.editScheduleText}>✏️</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>👥 Staff Management</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'staff' && styles.activeTab]}
                    onPress={() => setSelectedTab('staff')}
                >
                    <Text style={[styles.tabText, selectedTab === 'staff' && styles.activeTabText]}>
                        👤 Staff
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'roles' && styles.activeTab]}
                    onPress={() => setSelectedTab('roles')}
                >
                    <Text style={[styles.tabText, selectedTab === 'roles' && styles.activeTabText]}>
                        🎭 Roles
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'schedule' && styles.activeTab]}
                    onPress={() => setSelectedTab('schedule')}
                >
                    <Text style={[styles.tabText, selectedTab === 'schedule' && styles.activeTabText]}>
                        📅 Schedule
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {selectedTab === 'staff' && renderStaffView()}
                {selectedTab === 'roles' && renderRolesView()}
                {selectedTab === 'schedule' && renderScheduleView()}
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
        backgroundColor: '#607D8B',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#607D8B',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#607D8B',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        minWidth: '22%',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#607D8B',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#607D8B',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    staffCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    staffHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    staffInfo: {
        flex: 1,
    },
    staffName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    staffRole: {
        fontSize: 16,
        color: '#607D8B',
        fontWeight: '600',
    },
    staffStatus: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        fontSize: 12,
        fontWeight: 'bold',
    },
    staffDetails: {
        marginBottom: 15,
        gap: 5,
    },
    staffContact: {
        fontSize: 14,
        color: '#666',
    },
    staffShift: {
        fontSize: 14,
        color: '#666',
    },
    staffJoinDate: {
        fontSize: 14,
        color: '#666',
    },
    staffPermissions: {
        marginBottom: 15,
    },
    permissionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    permissionsTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    permissionTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    permissionText: {
        fontSize: 12,
        color: '#666',
    },
    staffActions: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statusButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
    },
    statusButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    roleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    roleHeader: {
        marginBottom: 15,
    },
    roleName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    roleStaffCount: {
        fontSize: 14,
        color: '#666',
    },
    rolePermissions: {
        marginBottom: 15,
    },
    editRoleButton: {
        backgroundColor: '#607D8B',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    editRoleButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    shiftStats: {
        gap: 15,
        marginBottom: 25,
    },
    shiftCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    shiftTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    shiftTime: {
        fontSize: 16,
        color: '#607D8B',
        marginBottom: 5,
    },
    shiftStaff: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    daySchedule: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    dayName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        width: 80,
    },
    dayShifts: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dayShiftInfo: {
        fontSize: 12,
        color: '#666',
    },
    editScheduleButton: {
        padding: 8,
    },
    editScheduleText: {
        fontSize: 16,
        color: '#607D8B',
    },
});
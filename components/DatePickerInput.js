import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, RADIUS, SPACING } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DatePickerInput({ label, value, onChange, placeholder = "Tarih Seçin", minimumDate, maximumDate }) {
    const { colors } = useTheme();
    const [show, setShow] = useState(false);

    // value is expected to be a Date object.
    const dateValue = value || new Date();

    const handleChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const formatDate = (d) => {
        if (!value) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            {Platform.OS === 'web' ? (
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="calendar" size={20} color="#FF6B6B" style={styles.icon} />
                    {React.createElement('input', {
                        type: "date",
                        value: value ? value.toISOString().split('T')[0] : '',
                        onChange: (e) => {
                            const dateStr = e.target.value;
                            if (dateStr) {
                                onChange(new Date(dateStr));
                            }
                        },
                        style: {
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: '#FFFFFF',
                            fontSize: '15px',
                            fontFamily: 'inherit',
                            padding: '12px 0',
                            cursor: 'pointer'
                        },
                        min: minimumDate ? minimumDate.toISOString().split('T')[0] : undefined,
                        max: maximumDate ? maximumDate.toISOString().split('T')[0] : undefined
                    })}
                </View>
            ) : (
                <>
                    <TouchableOpacity 
                        activeOpacity={0.7} 
                        style={styles.inputContainer}
                        onPress={() => setShow(true)}
                    >
                        <MaterialCommunityIcons name="calendar" size={20} color="#FF6B6B" style={styles.icon} />
                        <Text style={[styles.dateText, { color: value ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }]}>
                            {value ? formatDate(value) : placeholder}
                        </Text>
                    </TouchableOpacity>

                    {show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dateValue}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleChange}
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                        />
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        marginLeft: 4,
        color: 'rgba(255,255,255,0.65)',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    dateText: {
        fontSize: 15,
        flex: 1,
    }
});

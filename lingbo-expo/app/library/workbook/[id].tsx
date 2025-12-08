import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { WORKBOOKS } from '@/constants';

const { width, height } = Dimensions.get('window');

export default function WorkbookViewer() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const book = WORKBOOKS.find(w => w.id === id);
    const [page, setPage] = useState(1);

    if (!book) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Workbook not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.pageIndicator}>{page} / {book.pages}</Text>
            </View>

            {/* Page Viewer */}
            <View style={styles.pageContainer}>
                <View style={styles.pageCard}>
                    <Text style={styles.pageNumber}>Page {page}</Text>
                    <View style={styles.contentPlaceholder}>
                        <Text style={styles.placeholderText}>Worksheet content would appear here</Text>
                    </View>
                </View>

                {/* Navigation Arrows */}
                {page > 1 && (
                    <TouchableOpacity
                        onPress={() => setPage(p => p - 1)}
                        style={[styles.navButton, styles.navButtonLeft]}
                    >
                        <ChevronLeft size={32} color="white" />
                    </TouchableOpacity>
                )}
                {page < book.pages && (
                    <TouchableOpacity
                        onPress={() => setPage(p => p + 1)}
                        style={[styles.navButton, styles.navButtonRight]}
                    >
                        <ChevronRight size={32} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1f2937',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginHorizontal: 16,
    },
    pageIndicator: {
        fontSize: 14,
        color: '#9ca3af',
    },
    pageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    pageCard: {
        width: width - 32,
        maxWidth: 400,
        aspectRatio: 0.75,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    pageNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 24,
    },
    contentPlaceholder: {
        flex: 1,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#d1d5db',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#9ca3af',
        textAlign: 'center',
    },
    navButton: {
        position: 'absolute',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 32,
    },
    navButtonLeft: {
        left: 16,
    },
    navButtonRight: {
        right: 16,
    },
});

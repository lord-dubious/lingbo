import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Layout from '@/components/Layout';
import { LIBRARY_BOOKS, WORKBOOKS } from '@/constants';

export default function Library() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'books' | 'workbooks'>('books');

    return (
        <Layout title="Library" showBack>
            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setActiveTab('books')}
                    style={[styles.tab, activeTab === 'books' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, activeTab === 'books' && styles.tabTextActive]}>
                        Story Books
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('workbooks')}
                    style={[styles.tab, activeTab === 'workbooks' && styles.tabActive]}
                >
                    <Text style={[styles.tabText, activeTab === 'workbooks' && styles.tabTextActive]}>
                        Workbooks
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {activeTab === 'books' ? (
                    <View style={styles.grid}>
                        {LIBRARY_BOOKS.map((book, i) => (
                            <View key={i} style={styles.bookCard}>
                                <View style={styles.bookCover}>
                                    <Image
                                        source={{ uri: book.cover }}
                                        style={styles.coverImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                                    <View style={styles.bookType}>
                                        <Text style={styles.bookTypeText}>{book.type}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {WORKBOOKS.map((wb) => (
                            <TouchableOpacity
                                key={wb.id}
                                onPress={() => router.push(`/library/workbook/${wb.id}` as any)}
                                style={styles.bookCard}
                            >
                                <View style={styles.bookCover}>
                                    <Image
                                        source={{ uri: wb.cover }}
                                        style={styles.coverImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.newBadge}>
                                        <Text style={styles.newBadgeText}>NEW</Text>
                                    </View>
                                </View>
                                <View style={styles.bookInfo}>
                                    <Text style={styles.bookTitle} numberOfLines={2}>{wb.title}</Text>
                                    <Text style={styles.pageCount}>{wb.pages} Pages</Text>
                                </View>
                                <ChevronRight size={20} color="#f97316" style={styles.chevron} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb',
        padding: 4,
        borderRadius: 12,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#f97316',
    },
    content: {
        paddingBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    bookCard: {
        width: '47%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bookCover: {
        aspectRatio: 0.75,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    newBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#facc15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#713f12',
    },
    bookInfo: {
        gap: 4,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
        lineHeight: 18,
    },
    bookType: {
        backgroundColor: '#f3f4f6',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bookTypeText: {
        fontSize: 11,
        color: '#6b7280',
    },
    pageCount: {
        fontSize: 12,
        color: '#9ca3af',
    },
    chevron: {
        position: 'absolute',
        bottom: 12,
        right: 12,
    },
});

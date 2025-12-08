import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LIBRARY_BOOKS, VIDEO_RESOURCES } from '../../constants';
import { BookOpen, Play, ChevronLeft } from 'lucide-react-native';

const MediaLibraryScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('books');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Media Library</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'books' && styles.tabActive]}
          onPress={() => setActiveTab('books')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'books' && styles.tabTextActive,
            ]}
          >
            Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.tabActive]}
          onPress={() => setActiveTab('videos')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'videos' && styles.tabTextActive,
            ]}
          >
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'books' && (
          <View>
            {LIBRARY_BOOKS.map((book) => (
              <TouchableOpacity key={book.id} style={styles.bookCard}>
                <Image source={{ uri: book.cover }} style={styles.bookCover} />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookType}>{book.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'videos' && (
          <View>
            {VIDEO_RESOURCES.map((video) => (
              <TouchableOpacity key={video.id} style={styles.videoCard}>
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.videoThumbnail}
                />
                <View style={styles.playOverlay}>
                  <Play size={32} color="#fff" fill="#fff" />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <View style={styles.videoMeta}>
                    <Text style={styles.videoDuration}>{video.duration}</Text>
                    <Text style={styles.videoCategory}>{video.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bookCover: {
    width: 80,
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  bookInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  bookType: {
    fontSize: 12,
    color: '#999',
  },
  videoCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  videoDuration: {
    fontSize: 12,
    color: '#999',
  },
  videoCategory: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '500',
  },
});

export default MediaLibraryScreen;

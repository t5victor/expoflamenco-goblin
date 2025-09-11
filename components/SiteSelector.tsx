import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';

interface Site {
  id: string;
  name: string;
  url: string;
  language: string;
  flag: string;
  status: 'active' | 'maintenance' | 'inactive';
  subscribers: number;
}

const mockSites: Site[] = [
  {
    id: 'com',
    name: 'Expoflamenco.com',
    url: 'expoflamenco.com',
    language: 'Main Site',
    flag: '🌍',
    status: 'active',
    subscribers: 15438,
  },
  {
    id: 'agenda',
    name: 'Agenda',
    url: 'agenda.expoflamenco.com',
    language: 'Events & Shows',
    flag: '📅',
    status: 'active',
    subscribers: 3247,
  },
  {
    id: 'espacio',
    name: 'Espacio',
    url: 'espacio.expoflamenco.com',
    language: 'Cultural Space',
    flag: '🏛️',
    status: 'active',
    subscribers: 2891,
  },
  {
    id: 'comunidad',
    name: 'Comunidad',
    url: 'comunidad.expoflamenco.com',
    language: 'Community',
    flag: '👥',
    status: 'active',
    subscribers: 4523,
  },
  {
    id: 'revista',
    name: 'Revista',
    url: 'revista.expoflamenco.com',
    language: 'Magazine',
    flag: '📰',
    status: 'active',
    subscribers: 2156,
  },
  {
    id: 'academia',
    name: 'Academia',
    url: 'academia.expoflamenco.com',
    language: 'Learning',
    flag: '🎓',
    status: 'active',
    subscribers: 1893,
  },
  {
    id: 'podcast',
    name: 'Podcast',
    url: 'podcast.expoflamenco.com',
    language: 'Audio Content',
    flag: '🎙️',
    status: 'active',
    subscribers: 967,
  },
  {
    id: 'tv',
    name: 'TV',
    url: 'tv.expoflamenco.com',
    language: 'Video Content',
    flag: '📺',
    status: 'active',
    subscribers: 761,
  },
];

interface SiteSelectorProps {
  selectedSite: string;
  onSiteChange: (siteId: string) => void;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({ selectedSite, onSiteChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';
  
  const currentSite = mockSites.find(site => site.id === selectedSite) || mockSites[0];

  const handleSiteChange = (siteId: string) => {
    onSiteChange(siteId);
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'maintenance': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.trigger,
          { 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderColor: isDark ? '#374151' : '#D1D5DB'
          }
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.flag}>{currentSite.flag}</Text>
        <View style={styles.siteInfo}>
          <Text style={[
            styles.siteName,
            { color: isDark ? '#FFFFFF' : '#374151' }
          ]}>
            {currentSite.name}
          </Text>
          <Text style={[
            styles.siteDescription,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            {currentSite.language}
          </Text>
        </View>
        <View style={[
          styles.statusDot,
          { backgroundColor: getStatusColor(currentSite.status) }
        ]} />
        <Feather 
          name="chevron-down" 
          size={16} 
          color={isDark ? '#9CA3AF' : '#6B7280'} 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[
            styles.dropdown,
            { 
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#374151' : '#E5E7EB'
            }
          ]}>
            <View style={styles.dropdownHeader}>
              <Text style={[
                styles.dropdownTitle,
                { color: isDark ? '#FFFFFF' : '#111827' }
              ]}>
                Select Site
              </Text>
            </View>
            
            <ScrollView style={styles.sitesList} showsVerticalScrollIndicator={false}>
              {mockSites.map((site) => (
                <TouchableOpacity
                  key={site.id}
                  style={[
                    styles.siteOption,
                    selectedSite === site.id && styles.selectedSiteOption,
                    selectedSite === site.id && { 
                      backgroundColor: isDark ? '#374151' : '#F3F4F6' 
                    }
                  ]}
                  onPress={() => handleSiteChange(site.id)}
                >
                  <Text style={styles.flag}>{site.flag}</Text>
                  <View style={styles.siteDetails}>
                    <View style={styles.siteNameRow}>
                      <Text style={[
                        styles.siteOptionName,
                        { color: isDark ? '#FFFFFF' : '#111827' }
                      ]}>
                        {site.name}
                      </Text>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(site.status) }
                      ]} />
                    </View>
                    <View style={styles.siteStats}>
                      <Text style={[
                        styles.subscriberCount,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {site.subscribers.toLocaleString()} subscribers
                      </Text>
                      <Text style={[
                        styles.siteLanguage,
                        { color: isDark ? '#9CA3AF' : '#6B7280' }
                      ]}>
                        {site.language}
                      </Text>
                    </View>
                  </View>
                  {selectedSite === site.id && (
                    <Feather 
                      name="check" 
                      size={18} 
                      color={isDark ? '#10B981' : '#059669'} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    minWidth: 280,
    height: 44,
  },
  flag: {
    fontSize: 20,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  siteDescription: {
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    width: 400,
    maxHeight: 500,
  },
  dropdownHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sitesList: {
    maxHeight: 400,
  },
  siteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  selectedSiteOption: {
    backgroundColor: '#F3F4F6',
  },
  siteDetails: {
    flex: 1,
  },
  siteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  siteOptionName: {
    fontSize: 15,
    fontWeight: '600',
  },
  siteOptionUrl: {
    fontSize: 13,
    marginBottom: 6,
  },
  siteStats: {
    flexDirection: 'row',
    gap: 16,
  },
  subscriberCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  siteLanguage: {
    fontSize: 12,
  },
});

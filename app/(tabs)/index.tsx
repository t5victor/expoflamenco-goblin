import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { 
  Dimensions, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface ActionItemProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  accentColor: string;
}

const ActionItem: React.FC<ActionItemProps> = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  accentColor 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.cardWrapper}>
      <View style={[
        styles.shadowCard,
        { backgroundColor: isDark ? '#333' : '#E5E5E5' }
      ]} />
      <TouchableOpacity style={[
        styles.actionItem,
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : '#E0E0E0',
        }
      ]} onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={[
            styles.actionTitle,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {title}
          </Text>
          <Feather name="more-horizontal" size={20} color={isDark ? '#666' : '#999'} />
        </View>
        <View style={styles.cardContent}>
          <Feather name={icon} size={32} color={accentColor} />
          <View style={styles.textContent}>
            <Text style={[
              styles.actionDescription,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function ExpoFlamencoCommandCenter() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const isMobile = screenWidth < 768;

  const actionItems = [
    {
      icon: 'trending-up',
      title: 'Analytics Dashboard', 
      description: 'View detailed analytics and website insights',
      onPress: () => router.push('/(tabs)/analytics'),
      accentColor: '#4CAF50'
    },
    {
      icon: 'monitor',
      title: 'Admin Console',
      description: 'Manage system settings and configurations', 
      onPress: () => router.push('/(tabs)/admin'),
      accentColor: '#2196F3'
    },
    {
      icon: 'user',
      title: 'User Management',
      description: 'View and manage user accounts and permissions',
      onPress: () => router.push('/(tabs)/users'),
      accentColor: '#FF9800'
    },
    {
      icon: 'dollar-sign',
      title: 'Subscriptions',
      description: 'Monitor subscription metrics and billing',
      onPress: () => router.push('/(tabs)/subscriptions'),
      accentColor: '#9C27B0'
    },
    {
      icon: 'tool',
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      onPress: () => router.push('/(tabs)/explore'),
      accentColor: '#607D8B'
    }
  ];

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F5F5F5' }
    ]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={[
          styles.heroSection,
          { paddingHorizontal: isWeb && !isMobile ? 40 : 20 }
        ]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/EF512.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.heroTextContainer}>
            <Text style={[
              styles.heroTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              ExpoFlamenco Command Center
            </Text>
            <Text style={[
              styles.heroSubtitle,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              Professional analytics and management platform for your flamenco business
            </Text>
          </View>
        </View>

        {/* Action Items Grid */}
        <View style={[
          styles.actionsSection,
          { paddingHorizontal: isWeb && !isMobile ? 40 : 20 }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Quick Actions
          </Text>
          
          <View style={[
            styles.actionsGrid,
            isWeb && !isMobile && styles.actionsGridDesktop
          ]}>
            {actionItems.map((item, index) => (
              <ActionItem
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                onPress={item.onPress}
                accentColor={item.accentColor}
              />
            ))}
          </View>
        </View>

        {/* Status Card */}
        <View style={[
          styles.statusSection,
          { paddingHorizontal: isWeb && !isMobile ? 40 : 20 }
        ]}>
          <View style={[
            styles.statusCard,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor: isDark ? '#333' : '#E0E0E0',
            }
          ]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
              <Text style={[
                styles.statusTitle,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                System Status
              </Text>
            </View>
            <Text style={[
              styles.statusDescription,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              All systems operational. Ready to manage your flamenco platform.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  heroLogo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  heroTextContainer: {
    alignItems: 'center',
    maxWidth: 600,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  actionsSection: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  actionsGrid: {
    gap: 20,
  },
  actionsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    position: 'relative',
    ...Platform.select({
      web: {
        maxWidth: '48%',
      },
    }),
  },
  shadowCard: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: 16,
    zIndex: 0,
  },
  actionItem: {
    position: 'relative',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 1,
    minHeight: 120,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textContent: {
    flex: 1,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionDescription: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  statusSection: {
    paddingBottom: 20,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});

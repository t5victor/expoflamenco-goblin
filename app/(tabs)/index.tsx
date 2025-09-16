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

// Puzzle-style card sizing for desktop
const getPuzzleCardStyle = (size: string = 'medium', index: number) => {
  const baseStyle = {
    position: 'absolute' as const,
  };
  
  switch (size) {
    case 'large':
      return {
        ...baseStyle,
        width: '63%',
        height: 180,
        top: 0,
        left: 0,
      };
    case 'medium':
      if (index === 1) { // Admin Console - top right
        return {
          ...baseStyle,
          width: '35%',
          height: 120,
          top: 0,
          right: 0,
        };
      } else { // Subscriptions - bottom left
        return {
          ...baseStyle,
          width: '31%',
          height: 130,
          top: 200,
          left: 0,
        };
      }
    case 'small':
      if (index === 2) { // User Management - middle right
        return {
          ...baseStyle,
          width: '35%',
          height: 190, // Align with bottom of Subs/Settings (200 + 130 - 140 = 190)
          top: 140,
          right: 0,
        };
      } else { // System Settings - bottom right
        return {
          ...baseStyle,
          width: '31%',
          height: 130, // Match Subscriptions height
          top: 200,
          left: '32%', // Moved left to align right edge with Analytics
        };
      }
    default:
      return baseStyle;
  }
};

interface ActionItemProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  accentColor: string;
  size?: 'small' | 'medium' | 'large';
}

const ActionItem: React.FC<ActionItemProps> = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  accentColor,
  size 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const isMobile = screenWidth < 768;

  // Mobile: Simple horizontal layout (NO gray backgrounds, NO card headers)
  if (!isWeb || (isWeb && isMobile)) {
    return (
      <TouchableOpacity style={[
        styles.actionItemMobile,
        {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderColor: isDark ? '#333' : '#E0E0E0',
        }
      ]} onPress={onPress}>
        <Feather name={icon} size={28} color={accentColor} />
        <View style={styles.actionContentMobile}>
          <Text style={[
            styles.actionTitleMobile,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.actionDescriptionMobile,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {description}
          </Text>
        </View>
        <Feather 
          name="chevron-right" 
          size={20} 
          color={isDark ? '#666' : '#999'} 
        />
      </TouchableOpacity>
    );
  }

  // Desktop: Puzzle layout with gray backgrounds and card headers
  return (
    <>
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
    </>
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
      accentColor: '#4CAF50',
      size: 'large' // Takes more space
    },
    {
      icon: 'monitor',
      title: 'Admin Console',
      description: 'Manage system settings and configurations', 
      onPress: () => router.push('/(tabs)/admin'),
      accentColor: '#2196F3',
      size: 'medium'
    },
    {
      icon: 'user',
      title: 'User Management',
      description: 'View and manage user accounts and permissions',
      onPress: () => router.push('/(tabs)/users'),
      accentColor: '#FF9800',
      size: 'small'
    },
    {
      icon: 'dollar-sign',
      title: 'Subscriptions',
      description: 'Monitor subscription metrics and billing',
      onPress: () => router.push('/(tabs)/subscriptions'),
      accentColor: '#9C27B0',
      size: 'medium'
    },
    {
      icon: 'tool',
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      onPress: () => router.push('/(tabs)/explore'),
      accentColor: '#607D8B',
      size: 'small'
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
              style={{width: 250, height: 250}}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.heroTextContainer}>
            <Text style={[
              styles.heroTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Command Center
            </Text>
            <Text style={[
              styles.heroSubtitle,
              { color: isDark ? '#CCCCCC' : '#666666' }
            ]}>
              Seguimiento de estadísticas y datos.
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
            {actionItems.map((item, index) => {
              // Mobile: No wrapper needed, ActionItem handles its own layout
              if (!isWeb || (isWeb && isMobile)) {
                return (
                  <ActionItem
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    onPress={item.onPress}
                    accentColor={item.accentColor}
                    size={item.size}
                  />
                );
              }
              
              // Desktop: Use puzzle wrapper
              return (
                <View key={index} style={getPuzzleCardStyle(item.size, index)}>
                  <ActionItem
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    onPress={item.onPress}
                    accentColor={item.accentColor}
                    size={item.size}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Status Card - Removed (16/09/2025) */}
        
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
    position: 'relative',
    height: 370, // Fixed height to contain the puzzle layout with extended cards
    width: '100%',
  },
  cardWrapper: {
    position: 'relative',
  },
  cardWrapperMobile: {
    width: '100%',
    marginBottom: 8,
  },
  // Mobile styles (simple horizontal layout)
  actionItemMobile: {
    flexDirection: 'row',
    alignItems: 'center',
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
    minHeight: 80,
    gap: 16,
  },
  actionContentMobile: {
    flex: 1,
  },
  actionTitleMobile: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescriptionMobile: {
    fontSize: 14,
    lineHeight: 20,
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
    height: '100%', // Fill the puzzle container
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

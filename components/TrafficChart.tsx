import { Platform } from 'react-native';

// Platform-specific conditional exports
if (Platform.OS === 'web') {
  // For web platform, use recharts
  module.exports = require('./TrafficChart.web');
} else {
  // For native platforms (iOS/Android), use react-native-chart-kit e
  module.exports = require('./TrafficChart.native');
}

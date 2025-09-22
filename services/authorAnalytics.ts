import { createApiUsers, ApiUsers, UserStatsSummary, PostLite, DateRange } from './apiUsers';
import { Platform } from 'react-native';

// Simple historical data storage - only use localStorage on web
const getComparisonData = async (userId: number, timePeriod: string, currentMetrics: any) => {
  try {
    // Skip localStorage on native platforms to avoid errors
    if (Platform.OS !== 'web') {
      return {
        views: { percentage: '0%', trend: 'neutral' },
        posts: { percentage: '0%', trend: 'neutral' },
        engagement: { percentage: '0%', trend: 'neutral' }
      };
    }

    const key = `author_historical_${userId}_${timePeriod}`;
    const stored = localStorage.getItem(key);
    const previous = stored ? JSON.parse(stored) : { views: 0, posts: 0, engagement: 0 };

    // Calculate percentage changes
    const calculatePercentage = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - prev) / prev) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const comparison = {
      views: {
        percentage: calculatePercentage(currentMetrics.views, previous.views),
        trend: currentMetrics.views > previous.views ? 'up' :
               currentMetrics.views < previous.views ? 'down' : 'neutral'
      },
      posts: {
        percentage: calculatePercentage(currentMetrics.posts, previous.posts),
        trend: currentMetrics.posts > previous.posts ? 'up' :
               currentMetrics.posts < previous.posts ? 'down' : 'neutral'
      },
      engagement: {
        percentage: calculatePercentage(currentMetrics.engagement, previous.engagement),
        trend: currentMetrics.engagement > previous.engagement ? 'up' :
               currentMetrics.engagement < previous.engagement ? 'down' : 'neutral'
      }
    };

    // Store current data for next comparison (only on web)
    localStorage.setItem(key, JSON.stringify(currentMetrics));

    console.log(`📊 Author comparison for user ${userId} (${timePeriod}):`, comparison);
    return comparison;

  } catch (error) {
    console.error('📊 Author comparison error:', error);
    return {
      views: { percentage: '0%', trend: 'neutral' },
      posts: { percentage: '0%', trend: 'neutral' },
      engagement: { percentage: '0%', trend: 'neutral' }
    };
  }
};

export interface AuthorAnalytics {
  userId: number;
  userName: string;
  userEmail: string;
  totalViews: number;
  totalPosts: number;
  avgViewsPerPost: number;
  topPosts: Array<{
    post: PostLite;
    views: number;
    engagement: number;
  }>;
  recentPosts: PostLite[];
  comparison: {
    views: { percentage: string; trend: 'up' | 'down' | 'neutral' };
    posts: { percentage: string; trend: 'up' | 'down' | 'neutral' };
    engagement: { percentage: string; trend: 'up' | 'down' | 'neutral' };
  };
  timePeriod: string;
  dateRange?: DateRange;
}

export class AuthorAnalyticsService {
  private apiUsers: ApiUsers;

  constructor() {
    this.apiUsers = createApiUsers();
  }

  /**
   * Get comprehensive analytics for a specific author
   */
  async getAuthorAnalytics(
    userId: number,
    timePeriod: string = '30d',
    token: string,
    dateRange?: DateRange
  ): Promise<AuthorAnalytics> {
    try {
      console.log(`🔍 Fetching analytics for author ${userId} on revista...`);

      // Get user stats summary from revista
      const userStats = await this.apiUsers.getUserStatsSummary(
        'revista',
        userId,
        dateRange,
        { limitTop: 10 }
      );

      // Get recent posts
      const recentPosts = await this.apiUsers.fetchPostsByAuthor(
        'revista',
        userId,
        { perPage: 20, page: 1 }
      );

      // Calculate engagement score (views per post as percentage of author's average)
      const avgViewsPerPost = userStats.postsCount > 0 ? userStats.totalViews / userStats.postsCount : 0;

      const topPostsWithEngagement = userStats.topPosts.map(post => ({
        post: post.post,
        views: post.views,
        engagement: avgViewsPerPost > 0 ? (post.views / avgViewsPerPost) * 100 : 0
      }));

      // Prepare current metrics for comparison
      const currentMetrics = {
        views: userStats.totalViews,
        posts: userStats.postsCount,
        engagement: avgViewsPerPost
      };

      // Get comparison data
      const comparison = await getComparisonData(userId, timePeriod, currentMetrics);

      // Get user info from token validation (we need to extend this)
      // For now, we'll use placeholder - you might want to add user info endpoint
      const userName = `Author ${userId}`; // TODO: Get from user endpoint
      const userEmail = `author${userId}@expoflamenco.com`; // TODO: Get from user endpoint

      const analytics: AuthorAnalytics = {
        userId,
        userName,
        userEmail,
        totalViews: userStats.totalViews,
        totalPosts: userStats.postsCount,
        avgViewsPerPost,
        topPosts: topPostsWithEngagement,
        recentPosts: recentPosts.slice(0, 10),
        comparison,
        timePeriod,
        dateRange
      };

      console.log(`✅ Analytics loaded for author ${userId}:`, {
        totalViews: analytics.totalViews,
        totalPosts: analytics.totalPosts,
        avgViews: analytics.avgViewsPerPost.toFixed(1),
        topPostsCount: analytics.topPosts.length
      });

      return analytics;

    } catch (error: any) {
      console.error(`🚨 Author analytics error for user ${userId}:`, error?.message || error);

      // Return error state
      return {
        userId,
        userName: `Author ${userId}`,
        userEmail: `author${userId}@expoflamenco.com`,
        totalViews: 0,
        totalPosts: 0,
        avgViewsPerPost: 0,
        topPosts: [],
        recentPosts: [],
        comparison: {
          views: { percentage: 'ERROR', trend: 'neutral' },
          posts: { percentage: 'ERROR', trend: 'neutral' },
          engagement: { percentage: 'ERROR', trend: 'neutral' }
        },
        timePeriod
      };
    }
  }

  /**
   * Get detailed analytics for a specific post
   */
  async getPostAnalytics(
    postId: number,
    token: string,
    dateRange?: DateRange
  ): Promise<{
    postId: number;
    views: number;
    engagement: number;
    dateRange?: DateRange;
  }> {
    try {
      const views = await this.apiUsers.fetchViewsForPost('revista', postId, dateRange);

      return {
        postId,
        views: views.views,
        engagement: views.views, // Could be enhanced with likes/comments if available
        dateRange
      };
    } catch (error) {
      console.error(`Error fetching post analytics for ${postId}:`, error);
      return {
        postId,
        views: 0,
        engagement: 0,
        dateRange
      };
    }
  }

  /**
   * Get author's posts with analytics
   */
  async getAuthorPostsWithAnalytics(
    userId: number,
    token: string,
    params?: { page?: number; perPage?: number; after?: string; before?: string }
  ): Promise<Array<PostLite & { views: number; engagement: number }>> {
    try {
      const posts = await this.apiUsers.fetchPostsByAuthor('revista', userId, params);

      // Get views for each post
      const postsWithAnalytics = await Promise.all(
        posts.map(async (post) => {
          const analytics = await this.getPostAnalytics(post.id, token);
          return {
            ...post,
            views: analytics.views,
            engagement: analytics.engagement
          };
        })
      );

      return postsWithAnalytics.sort((a, b) => b.views - a.views);
    } catch (error) {
      console.error(`Error fetching author posts with analytics for ${userId}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const authorAnalyticsService = new AuthorAnalyticsService();

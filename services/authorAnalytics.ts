import { createApiUsers, ApiUsers, UserStatsSummary, PostLite, DateRange, PostDetail, PostHitEntry, PostReferrerEntry } from './apiUsers';
import { Platform } from 'react-native';
import { getDateRangeFromTimeFilter } from '@/utils/timeFilters';

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
      // Get user stats summary from revista
      const userStats = await this.apiUsers.getUserStatsSummary(
        'revista',
        userId,
        dateRange,
        { limitTop: 10, token }
      );

      // Get recent posts (filtered by date range if provided)
      const allPosts = await this.apiUsers.fetchPostsByAuthor(
        'revista',
        userId,
        { perPage: 100 }
      );

      const recentPosts = dateRange
        ? allPosts.filter(post => {
            const postDate = new Date(post.date);
            const fromDate = dateRange.from ? new Date(dateRange.from + 'T00:00:00') : null;
            const toDate = dateRange.to ? new Date(dateRange.to + 'T23:59:59') : null;
            return (!fromDate || postDate >= fromDate) && (!toDate || postDate <= toDate);
          })
        : allPosts;

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

      return analytics;

    } catch (error: any) {
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
      const views = await this.apiUsers.fetchViewsForPost('revista', postId, dateRange, token);

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
  ): Promise<Array<PostLite & { views: number; engagement: number; viewShare: number; viewsPerDay: number }>> {
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

      const totalViews = postsWithAnalytics.reduce((sum, item) => sum + (item.views || 0), 0);
      const averageViews = postsWithAnalytics.length > 0 ? totalViews / postsWithAnalytics.length : 0;

      const normalized = postsWithAnalytics.map((item) => {
        const publishedAt = new Date(item.date);
        const daysSincePublished = Math.max(
          1,
          (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...item,
          engagement: averageViews > 0 ? (item.views / averageViews) * 100 : 0,
          viewShare: totalViews > 0 ? (item.views / totalViews) * 100 : 0,
          viewsPerDay: item.views / daysSincePublished,
        };
      });

      return normalized.sort((a, b) => b.views - a.views);
    } catch (error) {
      console.error(`Error fetching author posts with analytics for ${userId}:`, error);
      return [];
    }
  }

  async getPostDetailAnalytics(
    postId: number,
    timePeriod: string,
    token: string
  ): Promise<{
    post: PostDetail;
    totalViews: number;
    dailyViews: PostHitEntry[];
    referrers: PostReferrerEntry[];
    timePeriod: string;
  }> {
    const dateRange = getDateRangeFromTimeFilter(timePeriod as any) ?? undefined;

    const post = await this.apiUsers.fetchPostById('revista', postId);
    const views = await this.apiUsers.fetchViewsForPost('revista', postId, dateRange, token, 'revista');
    const dailyViews = await this.apiUsers.fetchPostHits('revista', postId, dateRange);
    const referrers = await this.apiUsers.fetchPostReferrers('revista', postId, dateRange);

    return {
      post,
      totalViews: views.views,
      dailyViews,
      referrers,
      timePeriod,
    };
  }
}

// Export singleton instance
export const authorAnalyticsService = new AuthorAnalyticsService();

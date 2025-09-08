const API_BASE_URL = 'https://expoflamenco.com/wp-json';

interface ApiConfig {
  headers: {
    'Authorization': string;
    'Content-Type': string;
  };
}

export const apiConfig: ApiConfig = {
  headers: {
    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_WP_JWT_TOKEN || ''}`,
    'Content-Type': 'application/json',
  },
};

export const endpoints = {
  // core
  // pending
  
  // ms?
  analytics: `${API_BASE_URL}/monsterinsights/v1/reports`,
  
  // fluent
  subscribers: `${API_BASE_URL}/fluent-crm/v2/subscribers`,
  campaigns: `${API_BASE_URL}/fluent-crm/v2/campaigns`,
  
  // pmpro
  memberships: `${API_BASE_URL}/pmpro/v1/memberships`,
  orders: `${API_BASE_URL}/pmpro/v1/orders`,
};

export const fetchSiteData = async (siteId: string) => {
  try {
    const [analytics, subscribers, memberships] = await Promise.all([
      fetch(`${endpoints.analytics}?site=${siteId}`, apiConfig),
      fetch(`${endpoints.subscribers}?site=${siteId}`, apiConfig),
      fetch(`${endpoints.memberships}?site=${siteId}`, apiConfig),
    ]);

    return {
      analytics: await analytics.json(),
      subscribers: await subscribers.json(),
      memberships: await memberships.json(),
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

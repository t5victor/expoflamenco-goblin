// Translation keys and structure
export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    logout: 'Logout',

    // Auth
    auth: {
      loginTitle: 'Expoflamenco Analytics',
      loginSubtitle: 'Access your personal performance statistics',
      username: 'Username',
      password: 'Password',
      loginButton: 'Sign In',
      diagnosticButton: 'Diagnose Server',
      authError: 'Authentication Error',
      loginError: 'Login Error',
      credentialsError: 'Incorrect credentials',
      serverError: 'Server error. Please try again.',
      jwtError: 'JWT plugin not found. Please install "JWT Authentication for WP REST API".',
      networkError: 'Network error. Check your connection.',
    },

    // Navigation
    nav: {
      analytics: 'Analytics',
      articles: 'Articles',
      profile: 'Profile',
      settings: 'Settings',
    },

    // Dashboard
    dashboard: {
      title: 'Analytics Dashboard',
      subtitle: 'Your performance metrics on Expoflamenco Revista',
      welcome: 'Welcome',
      totalViews: 'Total Views',
      viewsTotal: 'Total views',
      postsCount: 'Posts Count',
      postsTotal: 'Total published articles',
      postsTotalDesc: 'Total articles published',
      avgViewsPerPost: 'Avg Views/Post',
      avgViewsDesc: 'Average views per article',
      topPostViews: 'Top Post Views',
      topPostDesc: 'Best performing article',
      articlesRecent: 'Recent Articles',
      articlesRecentDesc: 'Recently published articles',
      articlesRecentTitle: 'Recent Articles',
      articlesRecentSubtitle: 'Recently published',
      topPositionTitle: 'Top Position',
      topPositionSubtitle: 'Article ranking',
      statsSummary: 'Author Statistics',
      articlesCount: 'articles published',
      totalViewsCount: 'total views',
      avgViewsPerArticle: 'average views per article',
    },

    // Articles
    articles: {
      title: 'My Articles',
      subtitle: 'Performance and statistics of your publications',
      sortByViews: 'Most Viewed',
      sortByDate: 'Most Recent',
      sortByEngagement: 'Best Engagement',
      noArticles: 'No articles found',
      noArticlesDesc: 'You haven\'t published any articles in the magazine yet.',
      views: 'views',
      engagement: 'engagement',
      viewArticle: 'View Article',
      refreshing: 'Refreshing...',
      refresh: 'Refresh',
    },

    // Time periods
    timePeriods: {
      '24h': '24h',
      '7d': '7d',
      '30d': '30d',
      '90d': '90d',
    },

    // Trends
    trends: {
      up: '↗',
      down: '↘',
      neutral: '→',
      increased: 'increased',
      decreased: 'decreased',
      unchanged: 'unchanged',
    },

    // Languages
    languages: {
      english: 'English',
      spanish: 'Español',
      selectLanguage: 'Select Language',
      languageSettings: 'Language Settings',
    },

    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Configure your preferences',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?',
    },

  },

  es: {
    // Common
    loading: 'Cargando...',
    error: 'Error',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    refresh: 'Actualizar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    logout: 'Cerrar Sesión',

    // Auth
    auth: {
      loginTitle: 'Expoflamenco Analytics',
      loginSubtitle: 'Accede a tus estadísticas personales de rendimiento',
      username: 'Usuario',
      password: 'Contraseña',
      loginButton: 'Iniciar Sesión',
      diagnosticButton: 'Diagnosticar Servidor',
      authError: 'Error de Autenticación',
      loginError: 'Error de Inicio de Sesión',
      credentialsError: 'Credenciales incorrectas',
      serverError: 'Error del servidor. Inténtalo de nuevo.',
      jwtError: 'Plugin JWT no encontrado. Instala "JWT Authentication for WP REST API".',
      networkError: 'Error de red. Verifica tu conexión.',
    },

    // Navigation
    nav: {
      analytics: 'Analíticas',
      articles: 'Artículos',
      profile: 'Perfil',
      settings: 'Ajustes',
    },

    // Dashboard
    dashboard: {
      title: 'Panel de Analytics',
      subtitle: 'Tus métricas de rendimiento en Expoflamenco Revista',
      welcome: 'Bienvenido',
      totalViews: 'Vistas Totales',
      viewsTotal: 'Vistas totales',
      postsCount: 'Artículos',
      postsTotal: 'Total de artículos publicados',
      postsTotalDesc: 'Total artículos publicados',
      avgViewsPerPost: 'Promedio por Artículo',
      avgViewsDesc: 'Promedio de vistas por artículo',
      topPostViews: 'Mejor Artículo',
      topPostDesc: 'Artículo con mejor rendimiento',
      articlesRecent: 'Artículos Recientes',
      articlesRecentDesc: 'Artículos publicados recientemente',
      articlesRecentTitle: 'Artículos Recientes',
      articlesRecentSubtitle: 'Publicados recientemente',
      topPositionTitle: 'Mejor Posición',
      topPositionSubtitle: 'Ranking de artículos',
      statsSummary: 'Estadísticas del Autor',
      articlesCount: 'artículos publicados',
      totalViewsCount: 'vistas totales',
      avgViewsPerArticle: 'vistas promedio por artículo',
    },

    // Articles
    articles: {
      title: 'Mis Artículos',
      subtitle: 'Rendimiento y estadísticas de tus publicaciones',
      sortByViews: 'Más Vistos',
      sortByDate: 'Más Recientes',
      sortByEngagement: 'Mejor Engagement',
      noArticles: 'No hay artículos',
      noArticlesDesc: 'Aún no has publicado ningún artículo en la revista.',
      views: 'vistas',
      engagement: 'engagement',
      viewArticle: 'Ver Artículo',
      refreshing: 'Actualizando...',
      refresh: 'Actualizar',
    },

    // Time periods
    timePeriods: {
      '24h': '24h',
      '7d': '7d',
      '30d': '30d',
      '90d': '90d',
    },

    // Trends
    trends: {
      up: '↗',
      down: '↘',
      neutral: '→',
      increased: 'incrementado',
      decreased: 'decrementado',
      unchanged: 'sin cambios',
    },

    // Languages
    languages: {
      english: 'English',
      spanish: 'Español',
      selectLanguage: 'Seleccionar Idioma',
      languageSettings: 'Configuración de Idioma',
    },

    // Settings
    settings: {
      title: 'Settings',
      subtitle: 'Configure your preferences',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?',
    },

  },

  es: {
    // Common
    loading: 'Cargando...',
    error: 'Error',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    refresh: 'Actualizar',
    settings: 'Configuración',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    logout: 'Cerrar Sesión',

    // Languages
    languages: {
      english: 'English',
      spanish: 'Español',
      selectLanguage: 'Seleccionar Idioma',
      languageSettings: 'Configuración de Idioma',
    },

    // Auth
    auth: {
      loginTitle: 'Expoflamenco Analytics',
      loginSubtitle: 'Accede a tus estadísticas personales de rendimiento',
      username: 'Usuario',
      password: 'Contraseña',
      loginButton: 'Iniciar Sesión',
      loginError: 'Error de inicio de sesión',
      serverError: 'Error del servidor. Inténtalo de nuevo.',
      jwtError: 'Plugin JWT no encontrado. Instala "JWT Authentication for WP REST API".',
      networkError: 'Error de red. Verifica tu conexión.',
    },

    // Navigation
    nav: {
      analytics: 'Analíticas',
      articles: 'Artículos',
      profile: 'Perfil',
      settings: 'Ajustes',
    },

    // Dashboard
    dashboard: {
      title: 'Panel de Analytics',
      subtitle: 'Tus métricas de rendimiento en Expoflamenco Revista',
      welcome: 'Bienvenido',
      totalViews: 'Vistas Totales',
      viewsTotal: 'Vistas totales',
      postsCount: 'Artículos',
      postsTotal: 'Total de artículos publicados',
      postsTotalDesc: 'Total artículos publicados',
      avgViewsPerPost: 'Promedio por Artículo',
      avgViewsDesc: 'Promedio de vistas por artículo',
      topPostViews: 'Mejor Artículo',
      topPostDesc: 'Tu artículo más visto',
    },

    // Articles
    articles: {
      title: 'Mis Artículos',
      subtitle: 'Gestiona y analiza el rendimiento de tus artículos',
      noArticles: 'No se encontraron artículos',
      noArticlesDesc: 'No tienes artículos publicados aún',
      sortBy: 'Ordenar por',
      mostViewed: 'Más Vistos',
      mostRecent: 'Más Recientes',
      bestEngagement: 'Mejor Interacción',
      views: 'vistas',
      published: 'Publicado',
      readMore: 'Leer más',
      articleStats: 'Estadísticas del Artículo',
    },

    // Time Periods
    timePeriods: {
      '24h': '24h',
      '7d': '7d',
      '30d': '30d',
      '90d': '90d',
    },

    // Trends
    trends: {
      up: '↗',
      down: '↘',
      neutral: '→',
      increased: 'incrementado',
      decreased: 'decrementado',
      unchanged: 'sin cambios',
    },

    // Settings
    settings: {
      title: 'Configuración',
      subtitle: 'Configura tus preferencias',
      logout: 'Cerrar Sesión',
      logoutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
    },

  },
};

// Helper function to get translations
export const getTranslation = (language: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
};

// Default language
export const defaultLanguage: Language = 'es';

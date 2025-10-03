// services/apiUsers.ts
// Cliente de usuario/autenticación y estadísticas por autor (JWT + WP REST + WP-Statistics)

export type SiteKey = "root" | "revista" | "espacio" | "agenda" | "academia" | "comunidad" | "podcast";

export interface ApiUsersConfig {
  baseUrls: Record<SiteKey, string>; // p.ej. { root: "https://expoflamenco.com", revista: "https://expoflamenco.com/revista", academia: "https://expoflamenco.com/academia" }
  timeoutMs?: number;                // por defecto 15000
  statsRoutes?: Partial<StatsRoutes>;
}

export interface JwtAuthToken {
  token?: string;
  access_token?: string;  // Algunos plugins usan este campo
  jwt?: string;           // Otro nombre posible
  user_email?: string;
  user_display_name?: string;
  user_id?: number;
  user_nicename?: string;
  /** Campos adicionales que pueden variar por plugin */
  [k: string]: unknown;
}

export interface AuthSession {
  token: string;
  userId: number;
  name: string;
  email: string | null;
  roles?: string[];
  avatar?: string | null;
}

export interface DateRange {
  from?: string; // ISO 8601 "YYYY-MM-DD"
  to?: string;   // ISO 8601 "YYYY-MM-DD"
}

const extractAvatar = (payload?: {
  avatar_urls?: Record<string, string>;
  simple_local_avatar?: { full?: string; [key: string]: any };
}): string | null => {
  if (!payload) return null;
  const fromAvatar = payload.avatar_urls?.['96'] || payload.avatar_urls?.['72'] || payload.avatar_urls?.['48'] || payload.avatar_urls?.['24'];
  const fromSimple =
    (typeof payload.simple_local_avatar?.['96'] === 'string' && (payload.simple_local_avatar?.['96'] as string)) ||
    (typeof payload.simple_local_avatar?.full === 'string' && payload.simple_local_avatar?.full) ||
    null;
  return fromAvatar || fromSimple || null;
};

export interface PostLite {
  id: number;
  date: string;
  modified: string;
  slug: string;
  title: { rendered: string };
  link: string;
}

export interface PostDetail extends PostLite {
  excerpt?: string;
  authorName?: string;
}

export interface PostHitEntry {
  date: string;
  views: number;
}

export interface PostReferrerEntry {
  title: string;
  count: number;
  url?: string;
}

export interface PostViewStat {
  postId: number;
  views: number;
}

export interface UserStatsSummary {
  userId: number;
  totalViews: number;
  postsCount: number;
  topPosts: Array<{ post: PostLite; views: number }>;
  range?: DateRange;
}

type HttpMethod = "GET" | "POST" | "HEAD";

type StatsRoutes = {
  /** Ruta por post. Ajusta si tu WP-Statistics usa otro namespace o parámetros. */
  viewsByPost: (postId: number, range?: DateRange) => string;
  /**
   * Opcional: si tienes un endpoint agregado/propio por autor, configúralo aquí.
   * Si no existe, el cliente agregará por post.
   */
  aggregateByAuthor?: (authorId: number, range?: DateRange) => string;
};

/** Defaults conservadores, edítalos si tu WP-Statistics expone otras rutas. */
const defaultStatsRoutes: StatsRoutes = {
  viewsByPost: (postId: number, range?: DateRange) => {
    const qs = new URLSearchParams();
    if (range?.from) qs.set('rangestartdate', range.from);
    if (range?.to) qs.set('rangeenddate', range.to);
    qs.set('object-id', String(postId));
    qs.set('page-type', 'post');
    return `/wp-json/wpstatistics/v1/pages?${qs.toString()}`;
  },
  aggregateByAuthor: undefined, // WP Statistics doesn't have an author aggregate endpoint
};

export class ApiUsers {
  private baseUrls: Record<SiteKey, string>;
  private timeoutMs: number;
  private statsRoutes: StatsRoutes;

  constructor(cfg: ApiUsersConfig) {
    this.baseUrls = cfg.baseUrls;
    this.timeoutMs = cfg.timeoutMs ?? 15000;
    this.statsRoutes = {
      ...defaultStatsRoutes,
      ...(cfg.statsRoutes ?? {}),
    };
  }

  /** Helper fetch con timeout y manejo de errores WP */
  private async jsonFetch<T>(
    site: SiteKey,
    path: string,
    opts: {
      method?: HttpMethod;
      token?: string;
      body?: unknown;
    } = {}
  ): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `${this.baseUrls[site]}${path}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

      const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // Si no es JSON, fuerza error con detalle
        throw new Error(`Respuesta no JSON desde ${url}: ${text?.slice(0, 200)}`);
      }

      if (!res.ok) {
        const message =
          data?.message ||
          data?.error ||
          `HTTP ${res.status} en ${url}`;
        const code = data?.code || "wp_error";
        const details = data?.data;
        const e = new Error(message) as any;
        e.code = code;
        e.details = details;
        throw e;
      }

      return data as T;
    } finally {
      clearTimeout(id);
    }
  }

  /** Diagnóstico de autenticación disponible */
  async diagnoseAuth(site: SiteKey): Promise<{
    jwtEndpoints: Record<string, boolean>;
    basicAuth: boolean;
    recommendations: string[];
  }> {
    const results = {
      jwtEndpoints: {} as Record<string, boolean>,
      basicAuth: false,
      recommendations: [] as string[]
    };

    // Verificar endpoints JWT
    const jwtEndpoints = [
      '/wp-json/jwt-auth/v1/token',
      '/wp-json/simple-jwt-login/v1/auth',
      '/wp-json/wp/v2/jwt-auth/token',
      '/wp-json/api/v1/token',
    ];

    for (const endpoint of jwtEndpoints) {
      try {
        await this.jsonFetch(site, endpoint.replace('/token', '').replace('/auth', '') + '/?test=1', {
          method: 'HEAD'
        });
        results.jwtEndpoints[endpoint] = true;
      } catch {
        results.jwtEndpoints[endpoint] = false;
      }
    }

    // Verificar si hay algún endpoint JWT disponible
    const hasJwt = Object.values(results.jwtEndpoints).some(available => available);
    if (!hasJwt) {
      results.recommendations.push('Instala un plugin JWT para WordPress: "JWT Authentication for WP REST API"');
    }

    return results;
  }

  /** Login JWT - intenta múltiples endpoints comunes */
  async login(site: SiteKey, username: string, password: string): Promise<AuthSession> {
    let tokenResp: JwtAuthToken | undefined;
    let usedEndpoint = '';

    // Intenta múltiples endpoints JWT comunes
    const jwtEndpoints = [
      '/wp-json/jwt-auth/v1/token',           // Plugin: JWT Authentication for WP REST API
      '/wp-json/simple-jwt-login/v1/auth',    // Plugin: Simple JWT Login
      '/wp-json/wp/v2/jwt-auth/token',        // Otro plugin común
      '/wp-json/api/v1/token',                // Variante
    ];

    let lastError: any = null;

    for (const endpoint of jwtEndpoints) {
      try {
        console.log(`🔐 Intentando login en ${endpoint}...`);
        tokenResp = await this.jsonFetch<JwtAuthToken>(site, endpoint, {
          method: "POST",
          body: { username, password },
        });

        // Verificar que tenemos un token válido
        const actualToken = tokenResp.token || tokenResp.access_token || tokenResp.jwt;
        if (!actualToken) {
          throw new Error('Respuesta de login no contiene token válido');
        }

        // Normalizar el token al campo 'token'
        tokenResp.token = actualToken;

        usedEndpoint = endpoint;
        console.log(`✅ Login exitoso usando ${endpoint}`);
        break;
      } catch (error: any) {
        console.log(`❌ Endpoint ${endpoint} falló:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!tokenResp) {
      console.error('🚨 Todos los endpoints JWT fallaron');
      console.error('Último error:', lastError);
      throw new Error(`No se pudo autenticar. Asegúrate de que tienes instalado un plugin JWT válido en WordPress. Último error: ${lastError?.message || 'Desconocido'}`);
    }

    // Validación del token (si está disponible)
    if (usedEndpoint.includes('jwt-auth') && tokenResp.token) {
      try {
        await this.jsonFetch(site, `/wp-json/jwt-auth/v1/token/validate`, {
          method: "POST",
          token: tokenResp.token,
        });
        console.log('✅ Token validado');
      } catch (_) {
        console.log('⚠️ No se pudo validar el token, continuando...');
      }
    }

    // Usuario real y roles via REST nativo
    type Me = {
      id: number;
      name: string;
      email?: string;
      roles?: string[];
      avatar_urls?: Record<string, string>;
      simple_local_avatar?: {
        full?: string;
        [key: string]: string | number | undefined;
      };
    };

    try {
      const me = await this.jsonFetch<Me>(site, `/wp-json/wp/v2/users/me?_fields=id,name,email,roles,avatar_urls,simple_local_avatar`, {
        token: tokenResp.token!,
      });

      return {
        token: tokenResp.token!,
        userId: me.id,
        name: me.name,
        email: me.email ?? null,
        roles: me.roles,
        avatar: extractAvatar(me),
      };
    } catch (meError) {
      // Si falla /users/me, intentamos obtener info del token
      console.log('⚠️ No se pudo obtener info de /users/me, usando datos del token');
      let fallbackAvatar: string | null = null;
      if (tokenResp.user_id) {
        try {
          const userFallback = await this.jsonFetch<Me>(site, `/wp-json/wp/v2/users/${tokenResp.user_id}?_fields=id,name,email,roles,avatar_urls,simple_local_avatar`, {
            token: tokenResp.token!,
          });
          fallbackAvatar = extractAvatar(userFallback);
        } catch (userFallbackError) {
          console.log('⚠️ No se pudo obtener avatar mediante /users/{id}', userFallbackError);
        }
      }
      return {
        token: tokenResp.token!,
        userId: tokenResp.user_id || 0,
        name: tokenResp.user_display_name || username,
        email: tokenResp.user_email || null,
        roles: [],
        avatar: fallbackAvatar,
      };
    }
  }

  async fetchUserProfile(
    site: SiteKey,
    token: string
  ): Promise<{ id: number; name?: string; email?: string | null; roles?: string[]; avatar?: string | null }> {
    type ProfileResponse = {
      id: number;
      name?: string;
      email?: string | null;
      roles?: string[];
      avatar_urls?: Record<string, string>;
      simple_local_avatar?: { full?: string; [key: string]: any };
    };

    const profile = await this.jsonFetch<ProfileResponse>(
      site,
      `/wp-json/wp/v2/users/me?_fields=id,name,email,roles,avatar_urls,simple_local_avatar`,
      { token }
    );

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email ?? null,
      roles: profile.roles,
      avatar: extractAvatar(profile),
    };
  }

  /** Posts del autor en REST nativo. Ajusta per_page según necesidades. */
  async fetchPostsByAuthor(
    site: SiteKey,
    authorId: number,
    params?: { page?: number; perPage?: number; after?: string; before?: string }
  ): Promise<PostLite[]> {
    const qs = new URLSearchParams();
    qs.set("author", String(authorId));
    qs.set("status", "publish");
    qs.set("per_page", String(params?.perPage ?? 50));
    qs.set("page", String(params?.page ?? 1));
    qs.set("_fields", "id,date,modified,slug,title,link");
    if (params?.after) qs.set("after", params.after);
    if (params?.before) qs.set("before", params.before);

    return this.jsonFetch<PostLite[]>(site, `/wp-json/wp/v2/posts?${qs.toString()}`);
  }

  async fetchPostById(site: SiteKey, postId: number): Promise<PostDetail> {
    const post = await this.jsonFetch<any>(
      site,
      `/wp-json/wp/v2/posts/${postId}?_embed=author&_fields=id,date,modified,slug,title,link,excerpt,_embedded`
    );

    const excerpt = typeof post?.excerpt?.rendered === 'string'
      ? post.excerpt.rendered.replace(/<[^>]+>/g, '').trim()
      : undefined;

    const authorName = post?._embedded?.author?.[0]?.name;

    return {
      id: post.id,
      date: post.date,
      modified: post.modified,
      slug: post.slug,
      title: post.title,
      link: post.link,
      excerpt,
      authorName,
    };
  }

  private computeDaysFromRange(range?: DateRange): number | undefined {
    if (!range?.from || !range?.to) return undefined;
    const from = new Date(`${range.from}T00:00:00`);
    const to = new Date(`${range.to}T23:59:59`);
    const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : undefined;
  }

  async fetchPostHits(
    site: SiteKey,
    postId: number,
    range?: DateRange
  ): Promise<PostHitEntry[]> {
    const params = new URLSearchParams();
    params.set('token_auth', '1805');
    params.set('page-type', 'post');
    params.set('object-id', String(postId));
    const days = this.computeDaysFromRange(range);
    if (days && !Number.isNaN(days)) {
      params.set('days', String(days));
    }

    const statsSites: SiteKey[] = site === 'root' ? ['root'] : [site, 'root'];

    for (const statsSite of statsSites) {
      try {
        const response = await this.jsonFetch<any>(statsSite, `/wp-json/wpstatistics/v1/hits?${params.toString()}`);
        if (Array.isArray(response)) {
          return response.map((entry) => ({
            date: String(entry?.date ?? ''),
            views: Number(entry?.visitor ?? entry?.count ?? entry?.views ?? entry?.visit ?? 0) || 0,
          }));
        }
      } catch (error) {
        continue;
      }
    }

    return [];
  }

  async fetchPostReferrers(
    site: SiteKey,
    postId: number,
    range?: DateRange
  ): Promise<PostReferrerEntry[]> {
    const params = new URLSearchParams();
    params.set('token_auth', '1805');
    params.set('object-id', String(postId));
    params.set('limit', '10');
    if (range?.from) params.set('rangestartdate', range.from);
    if (range?.to) params.set('rangeenddate', range.to);

    const statsSites: SiteKey[] = site === 'root' ? ['root'] : [site, 'root'];

    for (const statsSite of statsSites) {
      try {
        const response = await this.jsonFetch<any>(statsSite, `/wp-json/wpstatistics/v1/referrers?${params.toString()}`);
        if (Array.isArray(response)) {
          return response.map((entry) => ({
            title: String(entry?.title ?? entry?.referred ?? entry?.referrer ?? 'Unknown'),
            count: Number(entry?.count ?? entry?.number ?? entry?.total ?? 0) || 0,
            url: typeof entry?.link === 'string' ? entry.link : undefined,
          }));
        }
      } catch (error) {
        continue;
      }
    }

    return [];
  }

  /** Vistas por post - intenta múltiples fuentes */
  async fetchViewsForPost(
    site: SiteKey,
    postId: number,
    range?: DateRange,
    token?: string,
    metaSite?: SiteKey
  ): Promise<PostViewStat> {
    try {
      // First try: WP Statistics (prefer root site data)
      const path = this.statsRoutes.viewsByPost(postId, range);
      const fullPath = `${path}&token_auth=1805`;

      const parseWpStatsPayload = (payload: any): number => {
        if (Array.isArray(payload)) {
          return payload.reduce((sum, entry) => sum + Number(entry?.visitor ?? entry?.visit ?? entry?.count ?? entry?.views ?? 0), 0);
        }
        if (typeof payload === 'number') {
          return payload;
        }
        if (payload && typeof payload === 'object') {
          if (payload.visitor !== undefined) {
            return Number(payload.visitor) || 0;
          }
          if (payload.visit !== undefined) {
            return Number(payload.visit) || 0;
          }
          if (payload.count !== undefined) {
            return Number(payload.count) || 0;
          }
          if (payload.views !== undefined) {
            return Number(payload.views) || 0;
          }
        }
        return 0;
      };

      const statsSites: SiteKey[] = site === 'root' ? ['root'] : [site, 'root'];
      for (const statsSite of statsSites) {
        try {
          const raw = await this.jsonFetch<any>(statsSite, fullPath);
          const totalViews = parseWpStatsPayload(raw);
          if (totalViews > 0) {
            return { postId, views: totalViews };
          }
        } catch (wpStatsError) {
          // Keep trying other sources
        }
      }

      // Second try: WordPress post meta (JNews, Post Views Counter, etc.)
      const restSite: SiteKey = metaSite ?? site;
      try {
        const postData = await this.jsonFetch<any>(restSite, `/wp-json/wp/v2/posts/${postId}?_fields=id,meta`, {
          token: token // Use JWT token for authenticated access
        });

        // Check for JNews view counter
        if (postData?.meta?.jnews_override_counter?.view_counter_number) {
          const views = Number(postData.meta.jnews_override_counter.view_counter_number);
          if (!isNaN(views) && views > 0) {
            return { postId, views };
          }
        }

        // Check for common view counter plugins
        const viewKeys = ['_post_views_count', 'views', 'post_views_count', 'pageviews'];
        for (const key of viewKeys) {
          if (postData?.meta?.[key]) {
            const views = Number(postData.meta[key]);
            if (!isNaN(views) && views > 0) {
              return { postId, views };
            }
          }
        }
      } catch (metaError) {
        // Post meta access failed
      }

    } catch (error) {
      // All methods failed
    }

    // Fallback: return 0 views
    return { postId, views: 0 };
  }

  /**
   * Resumen agregado por autor combinando WP Statistics y metadatos REST.
   */
  async getUserStatsSummary(
    site: SiteKey,
    authorId: number,
    range?: DateRange,
    opts?: { limitTop?: number; token?: string }
  ): Promise<UserStatsSummary> {
    let posts = await this.fetchPostsByAuthor(site, authorId, { perPage: 100 });

    const postEntries = posts.filter((post) => {
      if (!range) return true;
      const postDate = new Date(post.date);
      const fromDate = range.from ? new Date(range.from + 'T00:00:00') : null;
      const toDate = range.to ? new Date(range.to + 'T23:59:59') : null;
      return (!fromDate || postDate >= fromDate) && (!toDate || postDate <= toDate);
    });

    const viewEntries: Array<{ post: PostLite; views: number }> = [];
    const chunkSize = 10;
    for (let index = 0; index < postEntries.length; index += chunkSize) {
      const chunk = postEntries.slice(index, index + chunkSize);
      const resolved = await Promise.all(
        chunk.map(async (post) => {
          try {
            const stat = await this.fetchViewsForPost(site, post.id, range, opts?.token, site === 'root' ? 'root' : site);
            return { post, views: stat?.views ?? 0 };
          } catch (error) {
            console.warn(`Failed to load views for post ${post.id}:`, error);
            return { post, views: 0 };
          }
        })
      );
      viewEntries.push(...resolved);
    }

    const totalViews = viewEntries.reduce((total, entry) => total + (entry.views || 0), 0);

    const topPosts = [...viewEntries]
      .sort((a, b) => {
        if (b.views !== a.views) {
          return b.views - a.views;
        }
        return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
      })
      .slice(0, opts?.limitTop ?? 10);

    return {
      userId: authorId,
      totalViews,
      postsCount: postEntries.length,
      topPosts,
      range,
    };
  }
}

/** Fábrica rápida con valores por defecto para Expoflamenco. */
export const createApiUsers = (overrides?: Partial<ApiUsersConfig>) =>
  new ApiUsers({
    baseUrls: {
      root: "https://expoflamenco.com",
      revista: "https://expoflamenco.com/revista",
      academia: "https://expoflamenco.com/academia",
      espacio: "https://expoflamenco.com/espacio",
      agenda: "https://expoflamenco.com/agenda",
      comunidad: "https://expoflamenco.com/comunidad",
      podcast: "https://expoflamenco.com/podcast",
    },
    timeoutMs: 15000,
    ...overrides,
  });

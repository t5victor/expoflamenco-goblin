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
}

export interface DateRange {
  from?: string; // ISO 8601 "YYYY-MM-DD"
  to?: string;   // ISO 8601 "YYYY-MM-DD"
}

export interface PostLite {
  id: number;
  date: string;
  modified: string;
  slug: string;
  title: { rendered: string };
  link: string;
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
    if (range?.from) qs.set("from", range.from);
    if (range?.to) qs.set("to", range.to);
    qs.set("post_id", String(postId));
    // Namespace habitual de add-ons REST; ajústalo si usas otro.
    return `/wp-json/wpstatistics/v1/page-views?${qs.toString()}`;
  },
  aggregateByAuthor: undefined,
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
    };

    try {
      const me = await this.jsonFetch<Me>(site, `/wp-json/wp/v2/users/me`, {
        token: tokenResp.token!,
      });

      return {
        token: tokenResp.token!,
        userId: me.id,
        name: me.name,
        email: me.email ?? null,
        roles: me.roles,
      };
    } catch (meError) {
      // Si falla /users/me, intentamos obtener info del token
      console.log('⚠️ No se pudo obtener info de /users/me, usando datos del token');
      return {
        token: tokenResp.token!,
        userId: tokenResp.user_id || 0,
        name: tokenResp.user_display_name || username,
        email: tokenResp.user_email || null,
        roles: [],
      };
    }
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

  /** Vistas por post desde WP-Statistics (ruta configurable). */
  async fetchViewsForPost(
    site: SiteKey,
    postId: number,
    range?: DateRange
  ): Promise<PostViewStat> {
    const path = this.statsRoutes.viewsByPost(postId, range);
    // Formato de respuesta depende del endpoint instalado; normalizamos.
    const raw = await this.jsonFetch<any>(site, path);

    // Intenta mapear formatos comunes: {views: number} o {data:{views}} o array…
    let views = 0;
    if (typeof raw === "number") {
      views = raw;
    } else if (raw?.views != null) {
      views = Number(raw.views);
    } else if (raw?.data?.views != null) {
      views = Number(raw.data.views);
    } else if (Array.isArray(raw) && raw.length) {
      // Si devuelve series temporales, suma.
      views = raw
        .map((r) => Number(r?.views ?? r?.count ?? 0))
        .reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
    }

    return { postId, views: Number.isFinite(views) ? views : 0 };
  }

  /**
   * Resumen agregado por autor.
   * Si existe una ruta aggregateByAuthor, la usa; si no, agrega por posts.
   */
  async getUserStatsSummary(
    site: SiteKey,
    authorId: number,
    range?: DateRange,
    opts?: { limitTop?: number }
  ): Promise<UserStatsSummary> {
    // 1) ¿Hay endpoint agregado por autor disponible?
    if (this.statsRoutes.aggregateByAuthor) {
      const path = this.statsRoutes.aggregateByAuthor(authorId, range);
      const raw = await this.jsonFetch<any>(site, path);

      // Normaliza posibles estructuras comunes
      const totalViews =
        Number(raw?.totalViews ?? raw?.views ?? raw?.data?.totalViews ?? 0) || 0;
      const postsArr: Array<{ id: number; views: number; title?: string; link?: string }> =
        raw?.topPosts ?? raw?.posts ?? [];

      const topPosts: Array<{ post: PostLite; views: number }> = postsArr.map((p) => ({
        post: {
          id: p.id,
          date: "",
          modified: "",
          slug: "",
          title: { rendered: p.title ?? "" },
          link: p.link ?? "",
        },
        views: Number(p.views ?? 0),
      }));

      return {
        userId: authorId,
        totalViews,
        postsCount: Number(raw?.postsCount ?? topPosts.length),
        topPosts: topPosts
          .sort((a, b) => b.views - a.views)
          .slice(0, opts?.limitTop ?? 10),
        range,
      };
    }

    // 2) Fallback: agrega por posts del autor.
    const posts = await this.fetchPostsByAuthor(site, authorId, {
      perPage: 100,
    });

    // En producciones con muchos posts, aquí conviene paginar/streaming; para el inicial, sencillo:
    const views = await Promise.all(
      posts.map((p) => this.fetchViewsForPost(site, p.id, range))
    );

    const byId = new Map(views.map((v) => [v.postId, v.views]));
    const topPosts = posts
      .map((p) => ({
        post: p,
        views: byId.get(p.id) ?? 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, opts?.limitTop ?? 10);

    const totalViews = views.reduce((acc, v) => acc + (v.views || 0), 0);

    return {
      userId: authorId,
      totalViews,
      postsCount: posts.length,
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

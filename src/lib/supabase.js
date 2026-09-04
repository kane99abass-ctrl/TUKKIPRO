/**
 * Client Supabase Tukkipro
 * Client léger et robuste utilisant l'API Fetch native de JavaScript
 * Compatible 100% avec les spécifications Supabase Auth, PostgREST et Storage.
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://yqhzxzbdxvnqwiptwqcs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaHp4emJkeHZucXdpcHR3cWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDQyNjAsImV4cCI6MjEwNDAyMDI2MH0.D0sdmFHhFt2lT61C7QEWVj1KDHPkvWG4YUCdUfXhgrk';

const STORAGE_KEY = 'tukkipro_supabase_session';

class SupabaseAuthClient {
  constructor() {
    this.session = this.loadSession();
    this.listeners = new Set();
  }

  loadSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveSession(session) {
    this.session = session;
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Erreur sauvegarde session:', e);
    }
    this.notify(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
  }

  notify(event, session) {
    this.listeners.forEach(cb => {
      try { cb(event, session); } catch (e) { console.error(e); }
    });
  }

  onAuthStateChange(callback) {
    this.listeners.add(callback);
    // Appel immédiat avec la session actuelle
    callback(this.session ? 'INITIAL_SESSION' : 'NO_SESSION', this.session);
    return {
      data: {
        subscription: {
          unsubscribe: () => this.listeners.delete(callback)
        }
      }
    };
  }

  async getSession() {
    return { data: { session: this.session }, error: null };
  }

  async getUser() {
    return { data: { user: this.session?.user || null }, error: null };
  }

  async signUp({ email, password, options = {} }) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email,
          password,
          data: options.data || {}
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: new Error(data.msg || data.error_description || data.message || 'Erreur inscription') };
      }

      const session = data.access_token ? data : null;
      if (session) this.saveSession(session);
      return { data: { user: data.user, session }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async signInWithPassword({ email, password }) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: new Error(data.error_description || data.msg || data.message || 'Identifiants invalides') };
      }

      this.saveSession(data);
      return { data: { user: data.user, session: data }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async signOut() {
    try {
      if (this.session?.access_token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${this.session.access_token}`
          }
        });
      }
    } catch {
      // Ignorer erreur logout réseau
    } finally {
      this.saveSession(null);
    }
    return { error: null };
  }
}

class QueryBuilder {
  constructor(table, authClient) {
    this.table = table;
    this.authClient = authClient;
    this.url = `${SUPABASE_URL}/rest/v1/${table}`;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Prefer': 'return=representation'
    };
    this.params = [];
    this.method = 'GET';
    this.body = null;
    this.singleMode = false;
  }

  _getAuthHeader() {
    const token = this.authClient.session?.access_token || SUPABASE_ANON_KEY;
    return `Bearer ${token}`;
  }

  select(columns = '*') {
    this.params.push(`select=${encodeURIComponent(columns)}`);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.params.push(`order=${column}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  limit(count) {
    this.params.push(`limit=${count}`);
    return this;
  }

  eq(column, value) {
    this.params.push(`${column}=eq.${encodeURIComponent(value)}`);
    return this;
  }

  neq(column, value) {
    this.params.push(`${column}=neq.${encodeURIComponent(value)}`);
    return this;
  }

  ilike(column, pattern) {
    this.params.push(`${column}=ilike.${encodeURIComponent(pattern)}`);
    return this;
  }

  or(conditions) {
    this.params.push(`or=(${conditions})`);
    return this;
  }

  single() {
    this.singleMode = true;
    this.headers['Accept'] = 'application/vnd.pgrst.object+json';
    return this;
  }

  insert(data) {
    this.method = 'POST';
    this.body = JSON.stringify(data);
    return this;
  }

  update(data) {
    this.method = 'PATCH';
    this.body = JSON.stringify(data);
    return this;
  }

  delete() {
    this.method = 'DELETE';
    return this;
  }

  async then(resolve, reject) {
    try {
      this.headers['Authorization'] = this._getAuthHeader();
      let queryUrl = this.url;
      if (this.params.length > 0) {
        queryUrl += `?${this.params.join('&')}`;
      }

      const res = await fetch(queryUrl, {
        method: this.method,
        headers: this.headers,
        body: this.body
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        const error = new Error(data?.message || data?.details || data?.hint || `Erreur requête (${res.status})`);
        resolve({ data: null, error });
        return;
      }

      resolve({ data, error: null });
    } catch (err) {
      resolve({ data: null, error: err });
    }
  }
}

class SupabaseStorageClient {
  constructor(authClient) {
    this.authClient = authClient;
  }

  from(bucket) {
    const authClient = this.authClient;
    return {
      async upload(path, file, options = {}) {
        try {
          const token = authClient.session?.access_token || SUPABASE_ANON_KEY;
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.message || 'Erreur upload fichier') };
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },

      async createSignedUrl(path, expiresIn = 60) {
        try {
          const token = authClient.session?.access_token || SUPABASE_ANON_KEY;
          const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${path}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ expiresIn })
          });

          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.message || 'Erreur URL signée') };
          return { data: { signedUrl: `${SUPABASE_URL}${data.signedURL}` }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },

      async remove(paths = []) {
        try {
          const token = authClient.session?.access_token || SUPABASE_ANON_KEY;
          const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ prefixes: paths })
          });
          const data = await res.json();
          if (!res.ok) return { data: null, error: new Error(data.message || 'Erreur suppression fichier') };
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    };
  }
}

class SupabaseClient {
  constructor() {
    this.auth = new SupabaseAuthClient();
    this.storage = new SupabaseStorageClient(this.auth);
  }

  from(table) {
    return new QueryBuilder(table, this.auth);
  }

  async rpc(functionName, params = {}) {
    try {
      const token = this.auth.session?.access_token || SUPABASE_ANON_KEY;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(params)
      });

      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!res.ok) {
        return { data: null, error: new Error(data?.message || data?.details || 'Erreur RPC') };
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
}

export const supabase = new SupabaseClient();
export default supabase;

// Utility goi API Backend bang fetch
const API_CLIENT = {
    getToken() {
        return localStorage.getItem(API_CONFIG.TOKEN_KEY);
    },

    setToken(token) {
        if (token) {
            localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
        }
    },

    clearToken() {
        localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    },

    buildUrl(endpoint) {
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }
        return `${API_CONFIG.BASE_URL}${endpoint}`;
    },

    buildHeaders(customHeaders = {}) {
        const headers = {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...customHeaders
        };

        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    },

    async request(endpoint, options = {}) {
        const response = await fetch(this.buildUrl(endpoint), {
            ...options,
            headers: this.buildHeaders(options.headers || {})
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = data && data.message ? data.message : 'Goi API that bai';
            throw new Error(message);
        }

        return data;
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'GET'
        });
    },

    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body || {})
        });
    },

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body || {})
        });
    },

    patch(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body || {})
        });
    },

    delete(endpoint, body = null, options = {}) {
        const requestOptions = {
            ...options,
            method: 'DELETE'
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        return this.request(endpoint, requestOptions);
    }
};


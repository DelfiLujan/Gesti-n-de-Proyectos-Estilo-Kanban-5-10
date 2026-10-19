/**
 * Servicio de Autenticación
 * Nota (según docs/BACKEND_CONTRACT.md):
 * El backend actual no incluye endpoints de autenticación (/api/auth).
 * Este servicio encapsula la sesión del cliente (localStorage) y provee métodos
 * estándar para que LoginPage y useAuth operen sin acoplamiento.
 */

const TOKEN_KEY = 'devboard_token';
const USER_KEY = 'devboard_user';

export const authService = {
  /**
   * Inicia sesión guardando credenciales y token simulado.
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<Object>} Usuario autenticado y token.
   */
  async login({ email, password }) {
    // Simulación de latencia de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!email || !password || email.trim() === '' || password.trim() === '') {
      const error = new Error('Email y contraseña requeridos');
      error.status = 400;
      error.data = { error: 'Email y contraseña requeridos' };
      throw error;
    }

    const mockUser = {
      id: 'user_devboard_1',
      name: email.split('@')[0] || 'Desarrollador',
      email: email.trim(),
    };
    const mockToken = `mock_jwt_token_${Date.now()}`;

    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

    return { user: mockUser, token: mockToken };
  },

  /**
   * Cierra la sesión activa y elimina las claves de almacenamiento.
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Obtiene el token de sesión actual.
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Obtiene el usuario autenticado actualmente.
   * @returns {Object|null}
   */
  getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Comprueba si existe una sesión activa válida.
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};

export default authService;

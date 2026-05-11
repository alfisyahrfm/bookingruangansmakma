const AUTH_KEY = 'smak_admin_auth';

export const login = (username: string, password: string): boolean => {
  if (username === 'admin' && password === 'rumahtangga26') {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  sessionStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
};

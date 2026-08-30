/**
 * Auth navigation helpers. The original template delegated login to an
 * external OAuth portal; this platform is fully self-hosted, so "login"
 * is simply the local /login page.
 */
export const startLogin = (): void => {
  window.location.href = "/login";
};


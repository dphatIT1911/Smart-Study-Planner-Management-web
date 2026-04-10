const config = {
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
  API_BASE_URL:
    import.meta.env.PROD
      ? import.meta.env.VITE_API_URL
      : 'http://localhost:8000',
};

export default config;
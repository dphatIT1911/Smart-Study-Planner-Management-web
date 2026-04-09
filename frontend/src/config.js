const config = {
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
  API_BASE_URL:
    import.meta.env.DEV
      ? import.meta.env.VITE_API_URL
      : 'https://abc.com',
};

export default config;

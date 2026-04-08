const config = {
  API_BASE_URL:
    import.meta.env.DEV
      ? import.meta.env.VITE_API_URL
      : 'https://study-planner-deploy-server-api.onrender.com',
};

export default config;

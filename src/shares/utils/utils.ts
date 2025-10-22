export const getApiUrl = (endpoint: string) => {
  return `${import.meta.env.VITE_API_URL}${endpoint}`;
};

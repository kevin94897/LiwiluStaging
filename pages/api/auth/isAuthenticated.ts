export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  
  const accessToken = localStorage.getItem("accessToken");
  return !!accessToken;
};
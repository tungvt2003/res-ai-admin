import { useAppSelector } from "../shares/stores";

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);

  return {
    accessToken: auth.accessToken,
    userId: auth.userId,
    role: auth.role,
    user: auth.user,
    isAuthenticated: !!auth.accessToken,
  };
};

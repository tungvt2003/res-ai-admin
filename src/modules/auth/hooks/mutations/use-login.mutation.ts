// src/hooks/auth/useLoginMutation.ts
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {
  AuthApi,
  LoginRequest,
  SuccessResponse,
  TokenResponse,
  ErrorResponse,
} from "../../apis/authApi";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { setTokens } from "../../../../shares/stores/authSlice";

type LoginOptions = Omit<
  UseMutationOptions<SuccessResponse<TokenResponse>, AxiosError<ErrorResponse>, LoginRequest>,
  "mutationFn"
>;

export function useLoginMutation(options?: LoginOptions) {
  const dispatch = useDispatch();

  return useMutation<SuccessResponse<TokenResponse>, AxiosError<ErrorResponse>, LoginRequest>({
    mutationFn: async (form: LoginRequest) => {
      return await AuthApi.login(form);
    },
    onSuccess: (res, variables, context) => {
      // Lưu access token và thông tin user vào redux
      dispatch(
        setTokens({
          accessToken: res.data?.accessToken || "",
          userId: res.data?.userId || "",
          role: res.data?.role || "",
          user: res.data?.user,
        }),
      );
      options?.onSuccess?.(res, variables, context);
    },
    onError: (err, variables, context) => {
      options?.onError?.(err, variables, context);
    },
  });
}

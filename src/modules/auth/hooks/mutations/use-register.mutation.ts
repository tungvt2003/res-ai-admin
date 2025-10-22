import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AuthApi, RegisterRequest, RegisterResponse, SuccessResponse } from "../../apis/authApi";
import { useDispatch } from "react-redux";
import { setTokens } from "../../../../shares/stores/authSlice";

type RegisterOptions = Omit<
  UseMutationOptions<SuccessResponse<RegisterResponse>, Error, RegisterRequest>,
  "mutationFn"
>;

function useRegisterMutation(options?: RegisterOptions) {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (form: RegisterRequest) => {
      const res = await AuthApi.register(form);
      return res;
    },
    onSuccess: (res, variables, context) => {
      // Lưu access token và thông tin user vào redux sau khi đăng ký thành công
      if (res.data) {
        dispatch(
          setTokens({
            accessToken: res.data.accessToken || "",
            userId: res.data.user?.id || "",
            role: res.data.user?.roles || "",
            user: res.data.user,
          }),
        );
      }
      options?.onSuccess?.(res, variables, context);
    },
    onError: (err, variables, context) => {
      options?.onError?.(err, variables, context);
    },
  });
}

export { useRegisterMutation };

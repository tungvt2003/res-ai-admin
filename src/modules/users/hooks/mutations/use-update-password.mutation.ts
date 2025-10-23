import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { UserApi } from "../../apis/userApi";
import { QueryKeyEnum } from "../../../../shares/enums/queryKey";
import { SuccessResponse } from "../../../auth/apis/authApi";
import { toast } from "react-toastify";

type UpdatePasswordBody = {
  userId: string;
  password: string;
};

type Options = Omit<UseMutationOptions<SuccessResponse, Error, UpdatePasswordBody>, "mutationFn">;

export function useUpdatePasswordMutation(options?: Options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, password }: UpdatePasswordBody) =>
      UserApi.updatePassword(userId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.User] });
      toast.success("Đổi mật khẩu thành công!");
    },
    onError: (error) => {
      toast.error(`Lỗi khi đổi mật khẩu: ${error.message}`);
    },
    ...options,
  });
}

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { SettingsApi } from "../../apis/settingsApi";
import { ApiResponse } from "../../../../shares/types/response";

type DeleteSettingsResponse = ApiResponse<null>;

type Options = Omit<UseMutationOptions<DeleteSettingsResponse, Error, string>, "mutationFn">;

export function useDeleteSettingsMutation(options?: Options) {
  return useMutation({
    mutationFn: (key: string) => SettingsApi.delete(key),
    ...options,
  });
}

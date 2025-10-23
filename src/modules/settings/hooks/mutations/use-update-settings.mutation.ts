import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { SettingsApi, UpdateSettingsBody, SettingsKey } from "../../apis/settingsApi";
import { ApiResponse } from "../../../shares/types/response";

type UpdateSettingsResponse = ApiResponse<SettingsKey>;

type Options = Omit<
  UseMutationOptions<UpdateSettingsResponse, Error, UpdateSettingsBody>,
  "mutationFn"
>;

export function useUpdateSettingsMutation(options?: Options) {
  return useMutation({
    mutationFn: (body: UpdateSettingsBody) => SettingsApi.update(body),
    ...options,
  });
}

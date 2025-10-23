import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { SettingsApi, CreateSettingsBody, SettingsKey } from "../../apis/settingsApi";
import { ApiResponse } from "../../../shares/types/response";

type CreateSettingsResponse = ApiResponse<SettingsKey>;

type Options = Omit<
  UseMutationOptions<CreateSettingsResponse, Error, CreateSettingsBody>,
  "mutationFn"
>;

export function useCreateSettingsMutation(options?: Options) {
  return useMutation({
    mutationFn: (body: CreateSettingsBody) => SettingsApi.create(body),
    ...options,
  });
}

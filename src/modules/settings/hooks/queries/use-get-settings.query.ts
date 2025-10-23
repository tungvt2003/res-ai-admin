import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { SettingsApi } from "../../apis/settingsApi";
import { SettingsKey } from "../../apis/settingsApi";

type Options = Omit<
  UseQueryOptions<SettingsKey[], Error, SettingsKey[], QueryKey>,
  "queryKey" | "queryFn"
>;

export function useGetSettingsQuery(options?: Options) {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await SettingsApi.getAll();
      return response.data || [];
    },
    ...options,
  });
}

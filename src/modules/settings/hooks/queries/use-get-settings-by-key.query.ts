import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { SettingsApi, SettingsKey } from "../../apis/settingsApi";

type Options = Omit<
  UseQueryOptions<SettingsKey, Error, SettingsKey, QueryKey>,
  "queryKey" | "queryFn"
>;

interface UseGetSettingsByKeyQueryParams extends Options {
  key: string;
}

export function useGetSettingsByKeyQuery({ key, ...options }: UseGetSettingsByKeyQueryParams) {
  return useQuery({
    queryKey: ["settings", key],
    queryFn: async () => {
      const res = await SettingsApi.getByKey(key);
      if (!res.data) {
        throw new Error("Settings not found");
      }
      return res.data;
    },
    ...options,
  });
}

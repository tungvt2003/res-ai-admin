import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ConfigurationApi } from "../../apis/configurationApi";
import { Configuration } from "../../types/configuration";

type Options = Omit<
  UseQueryOptions<Configuration, Error, Configuration, QueryKey>,
  "queryKey" | "queryFn"
>;

interface UseGetConfigurationQueryParams extends Options {
  key: string;
}

export function useGetConfigurationQuery({ key, ...options }: UseGetConfigurationQueryParams) {
  return useQuery({
    queryKey: ["configuration", key],
    queryFn: () => ConfigurationApi.getByKey(key),
    ...options,
  });
}

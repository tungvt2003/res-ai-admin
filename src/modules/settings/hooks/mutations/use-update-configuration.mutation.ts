import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { UpdateConfigurationResponse } from "../../types/response";
import { UpdateConfigurationBody } from "../../types/body";
import { ConfigurationApi } from "../../apis/configurationApi";

type Options = Omit<
  UseMutationOptions<UpdateConfigurationResponse, Error, UpdateConfigurationBody>,
  "mutationFn"
>;

function useUpdateConfigurationMutation(options?: Options) {
  return useMutation({
    mutationFn: (body: UpdateConfigurationBody) => ConfigurationApi.update(body),
    ...options,
  });
}

export { useUpdateConfigurationMutation };

import { ConfigurationData } from "./configuration";

export type UpdateConfigurationBody = {
  key: string;
  value: ConfigurationData;
};

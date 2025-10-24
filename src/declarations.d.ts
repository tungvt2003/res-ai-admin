declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.gif";
declare module "*.svg";

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
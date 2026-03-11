// Shared types used across multiple domains
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
};

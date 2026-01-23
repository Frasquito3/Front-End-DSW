import apiClient from '../apiClient';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface PreferenceResponse {
  preferenceId: string;
  initPoint: string;
}

const createPreference = async (courseId: string): Promise<PreferenceResponse> => {
  const payload = { courseId };
  
  const response = await apiClient.post<ApiResponse<PreferenceResponse>>(
    '/payments/create-preference',
    payload
  );
  
  return response.data.data;
};

export const paymentService = {
  createPreference,
};
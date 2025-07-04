import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
  message?: string;
  errors?: Array<{
    type: string;
    value: string;
    msg: string;
    path: string;
    location: string;
  }>;
}

export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    console.log(error);
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Login failed');
    }
    throw new Error('Error : ' + error);
  }
};

export const signup = async (userData: SignupData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Signup failed');
    }
    throw new Error('Network error');
  }
};

export const getProfile = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await api.get<AuthResponse>('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to get profile');
    }
    throw new Error('Network error');
  }
};

export const updateProfile = async (token: string, userData: Partial<SignupData>): Promise<AuthResponse> => {
  try {
    const response = await api.put<AuthResponse>('/auth/profile', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to update profile');
    }
    throw new Error('Network error');
  }
};

export const healthCheck = async (): Promise<{ success: boolean; message: string; timestamp: string }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Health check failed');
    }
    throw new Error('Network error');
  }
};

interface CourseData {
  name: string;
  description: string;
  chapters: number;
  includeVideos: boolean;
  category: string;
  difficulty: string;
  generatedChapters?: Array<{
    title: string;
    description: string;
    objectives: string[];
    videoKeywords?: string;
    order: number;
  }>;
}

interface CourseResponse {
  success: boolean;
  data: CourseData & {
    _id: string;
    createdBy: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
  errors?: Record<string, string>;
}

interface CoursesListResponse {
  success: boolean;
  data: CourseResponse['data'][];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
}

export const createCourse = async (token: string, courseData: CourseData): Promise<CourseResponse> => {
  try {
    const response = await api.post<CourseResponse>('/courses', courseData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to create course');
    }
    throw new Error('Network error');
  }
};

export const getCourses = async (token: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  difficulty?: string;
}): Promise<CoursesListResponse> => {
  try {
    const response = await api.get<CoursesListResponse>('/courses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to fetch courses');
    }
    throw new Error('Network error');
  }
};

export const getAllCourses = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  difficulty?: string;
  search?: string;
}): Promise<CoursesListResponse> => {
  try {
    const response = await api.get<CoursesListResponse>('/courses/explore', {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to fetch courses');
    }
    throw new Error('Network error');
  }
};

export const getCourseById = async (token: string, courseId: string): Promise<CourseResponse> => {
  try {
    const response = await api.get<CourseResponse>(`/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to fetch course');
    }
    throw new Error('Network error');
  }
};

export const updateCourse = async (token: string, courseId: string, courseData: Partial<CourseData>): Promise<CourseResponse> => {
  try {
    const response = await api.put<CourseResponse>(`/courses/${courseId}`, courseData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to update course');
    }
    throw new Error('Network error');
  }
};

export const deleteCourse = async (token: string, courseId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to delete course');
    }
    throw new Error('Network error');
  }
};

export const updateCourseStatus = async (token: string, courseId: string, status: string): Promise<CourseResponse> => {
  try {
    const response = await api.patch<CourseResponse>(`/courses/${courseId}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to update course status');
    }
    throw new Error('Network error');
  }
};

export type { LoginData, SignupData, AuthResponse, CourseData, CourseResponse, CoursesListResponse }; 
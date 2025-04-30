import api from '../services/api';

export interface SelfReviewInput {
  employeeId: string;
  cycleId: string;
  reviews: {
    kpiId: string;
    rating: number;
    comment: string;
  }[];
}

export interface SelfReview {
  id: string;
  employeeId: string;
  cycleId: string;
  reviews: {
    kpiId: string;
    rating: number;
    comment: string;
  }[];
  submittedAt: string;
}

export interface ManagerReviewInput {
  employeeId: string;
  cycleId: string;
  reviews: {
    kpiId: string;
    rating: number;
    comment: string;
  }[];
}

export interface ManagerReview {
  id: string;
  employeeId: string;
  cycleId: string;
  reviews: {
    kpiId: string;
    rating: number;
    comment: string;
  }[];
  submittedAt: string;
}

export const getSelfReview = async (employeeId: string, cycleId: string): Promise<SelfReview | null> => {
  try {
    const response = await api.get<SelfReview>('/reviews/self', {
      params: { employeeId, cycleId },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw new Error('Failed to fetch self-review');
  }
};

export const submitSelfReview = async (reviewData: SelfReviewInput): Promise<SelfReview> => {
  try {
    const response = await api.post<SelfReview>('/reviews/self', reviewData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit self-review');
  }
};

export const getManagerReview = async (employeeId: string, cycleId: string): Promise<ManagerReview | null> => {
  try {
    const response = await api.get<ManagerReview>('/reviews/manager', {
      params: { employeeId, cycleId },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw new Error('Failed to fetch manager review');
  }
};

export const submitManagerReview = async (reviewData: ManagerReviewInput): Promise<ManagerReview> => {
  try {
    const response = await api.post<ManagerReview>('/reviews/manager', reviewData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit manager review');
  }
};
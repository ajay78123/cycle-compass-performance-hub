import api from './api';
import { ReviewCycle, ReviewWindow } from '@/types';

export const getReviewCycles = () => api.get<ReviewCycle[]>('/review-cycles');
export const getReviewCycle = (id: string) => api.get<ReviewCycle>(`/review-cycles/${id}`);
export const createReviewCycle = (cycle: Omit<ReviewCycle, 'id'>) =>
  api.post<ReviewCycle>('/review-cycles', cycle);
export const updateReviewCycle = (id: string, cycle: Partial<ReviewCycle>) =>
  api.put<ReviewCycle>(`/review-cycles/${id}`, cycle);

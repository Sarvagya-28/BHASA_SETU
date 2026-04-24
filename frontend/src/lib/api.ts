import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const createSession = async () => {
  const response = await apiClient.post('/api/session');
  return response.data;
};

export const transcribeAudio = async (sessionId: number, file: File | Blob) => {
  const formData = new FormData();
  formData.append('session_id', sessionId.toString());
  formData.append('audio', file, 'audio.webm');
  
  const response = await apiClient.post('/api/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const interpretTranscript = async (sessionId: number, dialectHint?: string) => {
  const formData = new FormData();
  formData.append('session_id', sessionId.toString());
  if (dialectHint) formData.append('dialect_hint', dialectHint);
  
  const response = await apiClient.post('/api/interpret', formData);
  return response.data;
};

export const verifyResult = async (sessionId: number, result: 'correct' | 'partial' | 'incorrect') => {
  const formData = new FormData();
  formData.append('session_id', sessionId.toString());
  formData.append('verification_result', result);
  
  const response = await apiClient.post('/api/verify', formData);
  return response.data;
};

export const submitFeedback = async (
  sessionId: number, 
  data: { category?: string; location?: string; issue?: string; feedback_notes?: string; human_takeover: boolean }
) => {
  const formData = new FormData();
  formData.append('session_id', sessionId.toString());
  if (data.category) formData.append('category', data.category);
  if (data.location) formData.append('location', data.location);
  if (data.issue) formData.append('issue', data.issue);
  if (data.feedback_notes) formData.append('feedback_notes', data.feedback_notes);
  formData.append('human_takeover', data.human_takeover ? 'true' : 'false');
  
  const response = await apiClient.post('/api/feedback', formData);
  return response.data;
};

export const getSessions = async () => {
  const response = await apiClient.get('/api/sessions');
  return response.data;
};

export const getSessionById = async (id: number) => {
  const response = await apiClient.get(`/api/sessions/${id}`);
  return response.data;
};

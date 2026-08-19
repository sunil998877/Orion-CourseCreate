import { API_BASE } from '../utils/api';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const createCourse = async (courseData: any, token: string) => {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ courseData }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create course');
  return data;
};

export const deleteCourse = async (courseId: string, token: string) => {
  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to delete course');
  }
  return res;
};

export const generateCourseDescription = async (courseData: any, token: string) => {
  const res = await fetch(`${API_BASE}/generate-course-description`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ courseData }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Could not generate description');
  return data;
};

export const refineCourseDescription = async (
  currentDescription: string,
  prompt: string,
  token: string
) => {
  const res = await fetch(`${API_BASE}/refine-course-description`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ currentDescription, prompt }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Could not refine description');
  return data;
};

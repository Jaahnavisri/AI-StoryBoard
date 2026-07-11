const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  // DELETE returns 204 with no body
  return res.status === 204 ? null : res.json();
}

export const api = {
  getStories: (search) => request(`/stories${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createStory: (story) => request('/stories', { method: 'POST', body: JSON.stringify(story) }),
  updateStory: (id, changes) => request(`/stories/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  deleteStory: (id) => request(`/stories/${id}`, { method: 'DELETE' })
};

export { API_BASE };

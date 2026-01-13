import api from "./api";

// Generic API client functions for CRUD operations
export const apiClient = {
  // GET - List all
  getAll: async <T>(endpoint: string): Promise<T[]> => {
    const response = await api.get<T[]>(endpoint);
    return response.data;
  },

  // GET - Get by ID
  getById: async <T>(endpoint: string, id: string | number): Promise<T> => {
    const fullUrl = `${endpoint}/${id}`;
    const response = await api.get<T>(fullUrl);
    return response.data;
  },

  // POST - Create
  create: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  },

  // PUT - Update
  update: async <T>(endpoint: string, id: string | number, data: unknown): Promise<T> => {
    const fullUrl = `${endpoint}/${id}`;
    const response = await api.put<T>(fullUrl, data);
    return response.data;
  },

  // DELETE - Delete
  delete: async (endpoint: string, id: string | number): Promise<void> => {
    const fullUrl = `${endpoint}/${id}`;
    await api.delete(fullUrl);
  },

  // PATCH - Partial update
  patch: async <T>(endpoint: string, id: string | number, data: unknown): Promise<T> => {
    const fullUrl = `${endpoint}/${id}`;
    const response = await api.patch<T>(fullUrl, data);
    return response.data;
  },
};


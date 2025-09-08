// services/api.ts
import type { Starter, Feeding, Note } from "../types";

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8080")

class ApiService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage
    this.token = localStorage.getItem("auth_token");
  }

  // Method to update the token (called after login/register)
  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  // Method to check if we have a token
  public hasToken(): boolean {
    // Check both memory and localStorage
    return !!(this.token || localStorage.getItem("auth_token"));
  }

  // Method to get current token
  public getToken(): string | null {
    // Prefer memory token, fallback to localStorage
    if (!this.token) {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = this.getToken();
    console.log("Token being used for request:", token ? `${token.substring(0, 20)}...` : 'No token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      // Only throw error for non-auth endpoints
      console.error('No token available for protected endpoint:', endpoint);
      throw new Error('Authentication required. Please log in.');
    }

    console.log(`Making request to: ${API_BASE}${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers || {})
      },
    });

    if (response.status === 401) {
      // Token is invalid or expired
      this.setToken(null);
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Starters
  async getAllStarters(): Promise<Starter[]> {
    return this.request<Starter[]>("/starters");
  }

  async getStarter(id: number): Promise<Starter> {
    return this.request<Starter>(`/starters/${id}`);
  }

  async createStarter(data: {
    user_id: number;
    name: string;
    feedingSchedule?: number;
    created?: string;
    lastFed?: string;
  }): Promise<Starter> {
    return this.request<Starter>("/starters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateStarter(id: number, updates: Partial<Starter>): Promise<Starter> {
    return this.request<Starter>(`/starters/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteStarter(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/starters/${id}`, {
      method: "DELETE",
    });
  }

  // Feedings
  async addFeeding(
    starterId: number,
    feedingData: {
      flour: number;
      water: number;
      notes?: string;
      flourType?: string;
      temp?: number;
    }
  ): Promise<Starter> {
    return this.request<Starter>(`/starters/${starterId}/feedings`, {
      method: "POST",
      body: JSON.stringify(feedingData),
    });
  }

  async updateFeeding(
    starterId: number,
    feedingId: number,
    updates: Partial<Feeding>
  ): Promise<Starter> {
    return this.request<Starter>(
      `/starters/${starterId}/feedings/${feedingId}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteFeeding(starterId: number, feedingId: number): Promise<Starter> {
    return this.request<Starter>(
      `/starters/${starterId}/feedings/${feedingId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Notes
  async addNote(starterId: number, noteText: string): Promise<Starter> {
    return this.request<Starter>(`/starters/${starterId}/notes`, {
      method: "POST",
      body: JSON.stringify({ text: noteText }),
    });
  }

  async updateNote(
    starterId: number,
    noteId: number,
    noteText: string
  ): Promise<Starter> {
    return this.request<Starter>(`/starters/${starterId}/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ text: noteText }),
    });
  }

  async deleteNote(starterId: number, noteId: number): Promise<Starter> {
    return this.request<Starter>(`/starters/${starterId}/notes/${noteId}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
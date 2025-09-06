// services/api.ts
import type { Starter, Feeding, Note } from "../types";

// services/api.ts
const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8080")


class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem("auth_token");
    console.log("Token from localStorage:", token);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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

export default new ApiService();

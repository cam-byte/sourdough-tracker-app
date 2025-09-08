// services/api.ts
import type { Starter, Feeding, Recipe, NewBaking, Baking } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

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
    console.log(
      "Token being used for request:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (endpoint !== "/auth/login" && endpoint !== "/auth/register") {
      // Only throw error for non-auth endpoints
      console.error("No token available for protected endpoint:", endpoint);
      throw new Error("Authentication required. Please log in.");
    }

    console.log(`Making request to: ${API_BASE}${endpoint}`);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers || {}),
      },
    });

    if (response.status === 401) {
      // Token is invalid or expired
      this.setToken(null);
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
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
  async getRecipe(starterId: number): Promise<Recipe> {
    return this.request<Recipe>(`/starters/${starterId}/recipe`);
  }

  async updateRecipe(
    starterId: number,
    recipeData: {
      name: string;
      ingredients: string;
      instructions: string;
    }
  ): Promise<Recipe> {
    return this.request<Recipe>(`/starters/${starterId}/recipe`, {
      method: "PUT",
      body: JSON.stringify(recipeData),
    });
  }

  async deleteRecipe(starterId: number): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/starters/${starterId}/recipe`, {
        method: 'DELETE',
      })
    } catch (e) {
      // If server returns 404 when there is no recipe, treat as success
      if (e instanceof Error && /not found/i.test(e.message)) {
        return { message: 'No recipe to delete' }
      }
      throw e
    }
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return this.request<Recipe[]>("/recipes")
  }

  async addBaking(starterId: number, data: Omit<NewBaking, 'starterId'>) {
    // backend expects: { recipeId?, date, result, notes }
    const payload = {
      recipeId: data.recipeId ?? null,
      date: data.date,
      result: data.result,
      notes: data.notes,
    }
    return this.request<Baking>(`/starters/${starterId}/bakings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateBaking(starterId: number, bakingId: number, updates: Partial<NewBaking>) {
    const payload: any = {}
    if (updates.date !== undefined) payload.date = updates.date
    if (updates.result !== undefined) payload.result = updates.result
    if (updates.notes !== undefined) payload.notes = updates.notes
    return this.request<Baking>(`/starters/${starterId}/bakings/${bakingId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async deleteBaking(starterId: number, bakingId: number) {
    return this.request<{ message: string }>(`/starters/${starterId}/bakings/${bakingId}`, {
      method: 'DELETE',
    })
  }

  async listBakings(starterId: number): Promise<Baking[]> {
    return this.request<Baking[]>(`/starters/${starterId}/bakings`)
  }
  
  // list all
  async listAllBakings(): Promise<Baking[]> {
    return this.request<Baking[]>(`/bakings`)
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;


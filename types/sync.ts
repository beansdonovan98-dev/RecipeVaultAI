export interface RemoteRecipe {
  id: string;
  title: string;
  description: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: unknown;
  instructions: unknown;
  image_url: string | null;
  is_favorite: boolean;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface RemoteRecipeInput {
  id: string;
  title: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: unknown;
  instructions: unknown;
  imageUrl: string | null;
  isFavorite: boolean;
  author: string;
}

export interface RecipeSyncRecord {
  id: number;
  remoteId: string | null;
  title: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string;
  instructions: string;
  imageUri: string | null;
  isFavorite: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
  dirty: boolean;
  deleted: boolean;
  revision: number;
}

export interface RoomConfig {
  code: string;
  roomId: string;
}

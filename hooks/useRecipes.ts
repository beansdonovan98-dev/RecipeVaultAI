import { useState, useEffect, useCallback } from 'react';
import * as db from '@/db';
import { Recipe, RecipeInput } from '@/types/recipe';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await db.getAllRecipes();
      setRecipes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const addRecipe = useCallback(async (input: RecipeInput) => {
    try {
      const id = await db.addRecipe(input);
      await loadRecipes();
      return id;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add recipe');
      throw e;
    }
  }, [loadRecipes]);

  const updateRecipe = useCallback(async (id: number, input: RecipeInput) => {
    try {
      await db.updateRecipe(id, input);
      await loadRecipes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update recipe');
      throw e;
    }
  }, [loadRecipes]);

  const deleteRecipe = useCallback(async (id: number) => {
    try {
      await db.deleteRecipe(id);
      await loadRecipes();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete recipe');
      throw e;
    }
  }, [loadRecipes]);

  const toggleFavorite = useCallback(async (id: number, isFavorite: boolean) => {
    try {
      await db.toggleFavorite(id, isFavorite);
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, isFavorite } : r));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to toggle favorite');
    }
  }, []);

  const refresh = useCallback(() => {
    loadRecipes();
  }, [loadRecipes]);

  return {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    refresh,
  };
}

export function useRecipe(id: number | null) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await db.getRecipeById(id);
      setRecipe(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const toggleFavorite = useCallback(async (isFavorite: boolean) => {
    if (!id) return;
    await db.toggleFavorite(id, isFavorite);
    setRecipe(prev => prev ? { ...prev, isFavorite } : null);
  }, [id]);

  return { recipe, loading, error, toggleFavorite, refresh: loadRecipe };
}

export function useSearch() {
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const data = await db.searchRecipes(query);
      setResults(data);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}

export function useCategories() {
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getCategories();
      setCategories(data);
    } catch (e) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const getRecipesByCategory = useCallback(async (category: string) => {
    try {
      return await db.getRecipesByCategory(category);
    } catch (e) {
      return [];
    }
  }, []);

  return { categories, loading, loadCategories, getRecipesByCategory };
}

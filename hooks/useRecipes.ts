import { useState, useEffect, useCallback } from 'react';
import * as db from '@/db';
import { Recipe, RecipeInput } from '@/types/recipe';
import type { AuthorId } from '@/constants/authors';
import { captureException, recordBreadcrumb } from '@/services/crashTracker';
import { notifyDataChanged, subscribeToDataChanges } from '@/services/dataEvents';
import { syncRecipes } from '@/services/recipeSync';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncInBackground = useCallback(() => {
    syncRecipes().catch((syncError) => {
      console.warn('[SYNC] background sync failed', syncError);
      recordBreadcrumb('sync:background-failed');
    });
  }, []);

  const loadRecipes = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      setError(null);
      const data = await db.getAllRecipes();
      setRecipes(data);
    } catch (e) {
      captureException(e, { source: 'useRecipes.loadRecipes' });
      setError(e instanceof Error ? e.message : 'Failed to load recipes');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadRecipes().finally(() => {
      if (active) {
        syncInBackground();
      }
    });

    const unsubscribe = subscribeToDataChanges(() => {
      if (active) {
        loadRecipes(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadRecipes, syncInBackground]);

  const addRecipe = useCallback(async (input: RecipeInput, author?: AuthorId) => {
    try {
      const id = await db.addRecipe(input, author);
      notifyDataChanged();
      syncInBackground();
      return id;
    } catch (e) {
      captureException(e, { source: 'useRecipes.addRecipe' });
      setError(e instanceof Error ? e.message : 'Failed to add recipe');
      throw e;
    }
  }, [syncInBackground]);

  const updateRecipe = useCallback(async (id: number, input: RecipeInput) => {
    try {
      await db.updateRecipe(id, input);
      notifyDataChanged();
      syncInBackground();
    } catch (e) {
      captureException(e, { source: 'useRecipes.updateRecipe' });
      setError(e instanceof Error ? e.message : 'Failed to update recipe');
      throw e;
    }
  }, [syncInBackground]);

  const deleteRecipe = useCallback(async (id: number) => {
    try {
      await db.deleteRecipe(id);
      notifyDataChanged();
      syncInBackground();
    } catch (e) {
      captureException(e, { source: 'useRecipes.deleteRecipe' });
      setError(e instanceof Error ? e.message : 'Failed to delete recipe');
      throw e;
    }
  }, [syncInBackground]);

  const toggleFavorite = useCallback(async (id: number, isFavorite: boolean) => {
    try {
      await db.toggleFavorite(id, isFavorite);
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, isFavorite } : r));
      notifyDataChanged();
      syncInBackground();
    } catch (e) {
      captureException(e, { source: 'useRecipes.toggleFavorite' });
      setError(e instanceof Error ? e.message : 'Failed to toggle favorite');
    }
  }, [syncInBackground]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await syncRecipes();
    } catch (syncError) {
      console.warn('[SYNC] refresh sync failed', syncError);
      recordBreadcrumb('sync:refresh-failed');
    } finally {
      await loadRecipes(false);
      setLoading(false);
    }
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

  const loadRecipe = useCallback(async (showSpinner = true) => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      if (showSpinner) {
        setLoading(true);
      }
      setError(null);
      const data = await db.getRecipeById(id);
      setRecipe(data);
    } catch (e) {
      captureException(e, { source: 'useRecipe.loadRecipe', extra: { recipeId: id } });
      setError(e instanceof Error ? e.message : 'Failed to load recipe');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadRecipe();
    return subscribeToDataChanges(() => loadRecipe(false));
  }, [loadRecipe]);

  const toggleFavorite = useCallback(async (isFavorite: boolean) => {
    if (!id) return;
    try {
      await db.toggleFavorite(id, isFavorite);
      setRecipe(prev => prev ? { ...prev, isFavorite } : null);
      notifyDataChanged();
      syncRecipes().catch((syncError) => {
        console.warn('[SYNC] favorite sync failed', syncError);
        recordBreadcrumb('sync:favorite-failed');
      });
    } catch (e) {
      captureException(e, { source: 'useRecipe.toggleFavorite', extra: { recipeId: id } });
      throw e;
    }
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
      captureException(e, { source: 'useSearch.search', extra: { query } });
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

  const loadCategories = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      const data = await db.getCategories();
      setCategories(data);
    } catch (e) {
      captureException(e, { source: 'useCategories.loadCategories' });
      setCategories([]);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCategories();
    return subscribeToDataChanges(() => loadCategories(false));
  }, [loadCategories]);

  const getRecipesByCategory = useCallback(async (category: string) => {
    try {
      return await db.getRecipesByCategory(category);
    } catch (e) {
      captureException(e, { source: 'useCategories.getRecipesByCategory', extra: { category } });
      return [];
    }
  }, []);

  return { categories, loading, loadCategories, getRecipesByCategory };
}

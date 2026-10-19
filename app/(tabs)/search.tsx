import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSearch } from '@/hooks/useRecipes';
import { SearchBar } from '@/components/SearchBar';
import { RecipeCard } from '@/components/RecipeCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors, Spacing } from '@/constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const { results, loading, search } = useSearch();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={handleClear}
            autoFocus
          />
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : query.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="Search recipes"
            message="Enter a recipe name, ingredient, or category"
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon="sad-outline"
            title="No results found"
            message={`No recipes matching "${query}"`}
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() => router.push(`/recipe/${item.id}`)}
              />
            )}
          />
        )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});

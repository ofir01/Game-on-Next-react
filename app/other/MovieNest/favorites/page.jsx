import { Suspense } from 'react';
import MovieNestClient from '../MovieNestClient';

export default function MovieNestFavoritesPage() {
  return (
    <Suspense>
      <MovieNestClient view="favorites" />
    </Suspense>
  );
}
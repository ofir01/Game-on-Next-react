import { Suspense } from 'react';
import MovieNestClient from '../../MovieNestClient';

export default function MovieNestMoviePage() {
  return (
    <Suspense>
      <MovieNestClient view="movie" />
    </Suspense>
  );
}
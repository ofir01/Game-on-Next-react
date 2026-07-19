import { Suspense } from 'react';
import MovieNestClient from '../MovieNestClient';

export default function MovieNestSearchPage() {
  return (
    <Suspense>
      <MovieNestClient view="search" />
    </Suspense>
  );
}
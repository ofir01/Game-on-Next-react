import { Suspense } from 'react';
import MovieNestClient from './MovieNestClient';

export default function MovieNestPage() {
  return (
    <Suspense>
      <MovieNestClient view="home" />
    </Suspense>
  );
}
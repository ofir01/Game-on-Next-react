import { Suspense } from 'react';
import MovieNestClient from '../../MovieNestClient';

export default function MovieNestActorPage() {
  return (
    <Suspense>
      <MovieNestClient view="actor" />
    </Suspense>
  );
}
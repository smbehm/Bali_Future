import { lazy, Suspense } from 'react';

const DonationTreeExperience = lazy(() => import('../components/donation-tree/DonationTreeExperience'));

export default function TreeOfFuture() {
  return (
    <section id="tree-of-future">
      <Suspense fallback={null}>
        <DonationTreeExperience />
      </Suspense>
    </section>
  );
}

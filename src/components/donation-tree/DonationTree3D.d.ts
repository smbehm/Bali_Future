import type { FC } from 'react';

export type DonationTree3DProps = {
  amount: number;
  target: number;
  campaignName: string;
};

export const DonationTree3D: FC<DonationTree3DProps>;

import { useApp } from '@/state/store';

export type PlanId = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  /** Shown until the store returns localized prices. */
  displayPrice: string;
  period: 'month' | 'year';
}

/**
 * In-app purchase boundary. The real version uses the App Store / Google Play
 * through a purchases library, which also returns localized prices and receipts.
 */
export interface PurchaseService {
  plans(): Promise<Plan[]>;
  purchase(plan: PlanId): Promise<'purchased' | 'cancelled'>;
  /** Restores an existing subscription on a new device or after reinstalling. */
  restore(): Promise<boolean>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockPurchases: PurchaseService = {
  async plans() {
    return [
      { id: 'monthly', displayPrice: '¥480', period: 'month' },
      { id: 'yearly', displayPrice: '¥3,800', period: 'year' },
    ];
  },
  async purchase() {
    await wait(600);
    useApp.getState().setPlus(true);
    return 'purchased';
  },
  async restore() {
    await wait(600);
    return useApp.getState().plus;
  },
};

export const purchases: PurchaseService = mockPurchases;

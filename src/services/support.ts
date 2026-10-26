/** Support boundary: inquiries and account deletion. The real version calls the backend. */
export type InquiryKind = 'bug' | 'account' | 'payment' | 'safety' | 'other';

export interface SupportService {
  sendInquiry(input: { kind: InquiryKind; message: string; replyTo: string | null }): Promise<void>;
  /** Deletes the account and its data on the server. Subscriptions must be cancelled in the store separately. */
  deleteAccount(): Promise<void>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockSupport: SupportService = {
  async sendInquiry() {
    await wait(500);
  },
  async deleteAccount() {
    await wait(500);
  },
};

export const support: SupportService = mockSupport;

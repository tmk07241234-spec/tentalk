import { api } from './api';

/** Support boundary: the in-app contact form. Messages are kept on the server for operators. */
export type InquiryKind = 'bug' | 'account' | 'payment' | 'safety' | 'other';

export const support = {
  async sendInquiry(input: { kind: InquiryKind; message: string; replyTo: string | null }): Promise<void> {
    await api('/api/support', input);
  },
};

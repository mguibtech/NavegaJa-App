export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaAction: 'search' | 'url' | 'deeplink';
  ctaValue?: string;
  backgroundColor?: string;
  textColor: 'light' | 'dark';
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate: string;
}

export interface PromotionsResponse {
  promotions: Promotion[];
}

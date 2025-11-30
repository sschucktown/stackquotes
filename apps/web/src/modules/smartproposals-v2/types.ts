export type PackageTierId = "good" | "better" | "best";

export type VisualPackage = {
  id: PackageTierId;
  label: string;
  badgeLabel?: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  price: number;
  depositPercent?: number;
  depositAmount?: number;
  metricLabel?: string;
  metricValue?: string;
  imageUrl?: string | null;
  secondaryImageUrl?: string | null;
  isRecommended?: boolean;
};

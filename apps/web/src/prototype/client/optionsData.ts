export type Upgrade = {
  id: string;
  label: string;
  description: string;
  priceDelta: number;
  defaultOn?: boolean;
  image?: string;
};

export type ProposalOption = {
  id: string;
  label: string;
  tagline: string;
  badge?: string;
  basePrice: number;
  description: string;
  included: string[];
  upgrades: Upgrade[];
  baseImage: string;
};

export const optionsData: ProposalOption[] = [
  {
    id: "good",
    label: "Good",
    tagline: "Essential comfort",
    badge: "Smart pick",
    basePrice: 18400,
    description: "Low-maintenance deck for a worry-free outdoor space.",
    included: ["Composite surface", "Standard railing", "Concrete footings"],
    upgrades: [
      {
        id: "lighting",
        label: "Post cap lighting",
        description: "Warm glow along the rail for cozy evenings.",
        priceDelta: 1200,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "stairs",
        label: "Extra stair run",
        description: "Second stair for easier yard access.",
        priceDelta: 950,
        image: "https://images.unsplash.com/photo-1465805139202-a644e217f00f?auto=format&fit=crop&w=900&q=80",
      },
    ],
    baseImage: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "better",
    label: "Better",
    tagline: "Premium comfort",
    badge: "Recommended",
    basePrice: 22400,
    description: "Sleek rails and hidden hardware for a modern finish.",
    included: ["Composite surface", "Aluminum rails", "Skirt boards + fascia"],
    upgrades: [
      {
        id: "lighting",
        label: "Perimeter lighting",
        description: "Soft LEDs around the deck for resort vibes.",
        priceDelta: 1400,
        defaultOn: true,
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "privacy",
        label: "Privacy screen",
        description: "Keeps wind down and adds a calm backdrop.",
        priceDelta: 1100,
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "stairs",
        label: "Extra stair run",
        description: "Second stair for easier yard access.",
        priceDelta: 950,
        image: "https://images.unsplash.com/photo-1465805139202-a644e217f00f?auto=format&fit=crop&w=900&q=80",
      },
    ],
    baseImage: "https://images.unsplash.com/photo-1505692069463-5e3405e3e7ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "best",
    label: "Best",
    tagline: "Luxury + longevity",
    badge: "Premium",
    basePrice: 26800,
    description: "Elegant rails that elevate curb appeal, built to last.",
    included: ["Premium composite surface", "Glass railing", "Integrated lighting"],
    upgrades: [
      {
        id: "pergola",
        label: "Pergola shade",
        description: "Framed shade to cool the space on hot days.",
        priceDelta: 3200,
        defaultOn: true,
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "heater",
        label: "Patio heater",
        description: "Take the chill off for longer evenings outside.",
        priceDelta: 900,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "wrap-steps",
        label: "Wrap steps",
        description: "Wraparound steps for a dramatic, open look.",
        priceDelta: 1800,
        defaultOn: true,
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
      },
    ],
    baseImage: "https://images.unsplash.com/photo-1523419400524-03095dedbe2c?auto=format&fit=crop&w=1200&q=80",
  },
];

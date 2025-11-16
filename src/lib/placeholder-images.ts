export interface PlaceholderImage {
  url: string;
  label: string;
  hint: string;
}

export const PLACEHOLDER_IMAGES: PlaceholderImage[] = [
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    label: "Creative workspace",
    hint: "Team collaborating around laptops with soft sunlight"
  },
  {
    url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
    label: "Minimal interior",
    hint: "Clean architectural lobby with plants and neutral palette"
  },
  {
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    label: "Lifestyle moment",
    hint: "Person enjoying morning coffee while reading newsletter"
  }
];

export interface MenuItem {
  label: string;
  href: string;
  external?: boolean;
}

export const menuItems: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Solutions", href: "/solutions" },
  { label: "Platform", href: "/platform" },
  { label: "Playbooks", href: "/playbooks" },
];

export interface Logo {
  name: string;
  src: string;
}

export const trustBarLogos: Logo[] = [
  { name: "Solana", src: "/generated/image/mono-3d/chrome-torus.jpg" },
  { name: "Raydium", src: "/generated/image/mono-3d/glass-cube-stack.jpg" },
  { name: "Metaplex", src: "/generated/image/mono-3d/sphere-cluster.jpg" },
  { name: "Darklake", src: "/generated/image/mono-3d/crystal-growth.jpg" },
];

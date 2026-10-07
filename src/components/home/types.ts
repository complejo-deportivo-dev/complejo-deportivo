export interface ClubFacility {
  id: string;
  category: 'piscinas' | 'zonas-humedas' | 'gimnasio' | 'canchas';
  kicker?: string;
  title: string;
  tag: string;
  description: string;
  href: string;
  accentColor: string;
  badge: string;
  image: string;
}

export interface ClubStat {
  value: string;
  label: string;
}

export interface NavLink {
  label: string;
  href: string;
}

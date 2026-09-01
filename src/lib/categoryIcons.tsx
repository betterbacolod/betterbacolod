import {
  Building2,
  Bus,
  GraduationCap,
  Heart,
  Home,
  type LucideIcon,
  MapPin,
  Scale,
  ShieldAlert,
  Trash2,
  TreePine,
  Users,
  Wheat,
  Wrench,
  Zap,
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  Building2,
  Bus,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Scale,
  ShieldAlert,
  Trash2,
  TreePine,
  Users,
  Wheat,
  Wrench,
  Zap,
};

export function getCategoryIcon(name: string | undefined) {
  return name ? categoryIcons[name] : undefined;
}

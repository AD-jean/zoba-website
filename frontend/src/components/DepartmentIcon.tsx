import type { LucideIcon } from 'lucide-react';

interface DepartmentIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export default function DepartmentIcon({ icon: Icon, size = 24, className = '' }: DepartmentIconProps) {
  return <Icon size={size} className={`department-icon ${className}`} />;
}

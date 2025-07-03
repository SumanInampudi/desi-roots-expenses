import React from 'react'
import { 
  Package2, 
  Megaphone, 
  Plane, 
  Truck, 
  Send, 
  MoreHorizontal,
  Package,
  Sticker,
  Wheat,
  Soup,
  Nut,
  Sparkles,
  Facebook,
  MessageCircle,
  Users,
  MapPin,
  Navigation,
  PackageCheck,
  Circle
} from 'lucide-react'

interface CategoryIconProps {
  iconName: string
  className?: string
  size?: number
}

const iconMap = {
  'package-2': Package2,
  'megaphone': Megaphone,
  'plane': Plane,
  'truck': Truck,
  'send': Send,
  'more-horizontal': MoreHorizontal,
  'package': Package,
  'sticker': Sticker,
  'wheat': Wheat,
  'soup': Soup,
  'nut': Nut,
  'sparkles': Sparkles,
  'facebook': Facebook,
  'message-circle': MessageCircle,
  'users': Users,
  'map-pin': MapPin,
  'navigation': Navigation,
  'package-check': PackageCheck,
  'circle': Circle
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  className = "h-4 w-4", 
  size 
}) => {
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Circle
  
  return <IconComponent className={className} size={size} />
}

export const getCategoryIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Circle
}
import React from 'react';
import { BookOpen, User, MapPin, Clock } from 'lucide-react';

interface EventCardProps {
  type: 'lecture' | 'lab' | 'tutorial' | 'consultation' | 'exam';
  title: string;
  subtitle?: string;
  time?: string;
  lecturer?: string;
  location?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const EventCard = ({
  type,
  title,
  subtitle,
  time,
  lecturer,
  location,
  icon,
  onClick,
  className = '',
}: EventCardProps) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'lecture':
        return {
          bg: 'bg-gradient-to-br from-[#6FCF97]/10 to-[#6FCF97]/5',
          border: 'border-[#6FCF97]/30',
          iconBg: 'bg-[#6FCF97]/20',
          iconColor: 'text-[#6FCF97]',
        };
      case 'lab':
        return {
          bg: 'bg-gradient-to-br from-[#F2C94C]/10 to-[#F2C94C]/5',
          border: 'border-[#F2C94C]/30',
          iconBg: 'bg-[#F2C94C]/20',
          iconColor: 'text-[#F2C94C]',
        };
      case 'tutorial':
        return {
          bg: 'bg-gradient-to-br from-[#56CCF2]/10 to-[#56CCF2]/5',
          border: 'border-[#56CCF2]/30',
          iconBg: 'bg-[#56CCF2]/20',
          iconColor: 'text-[#56CCF2]',
        };
      case 'consultation':
        return {
          bg: 'bg-gradient-to-br from-[#6FCF97]/10 to-[#6FCF97]/5',
          border: 'border-[#6FCF97]/30',
          iconBg: 'bg-[#6FCF97]/20',
          iconColor: 'text-[#6FCF97]',
        };
      case 'exam':
        return {
          bg: 'bg-gradient-to-br from-[#EB5757]/10 to-[#EB5757]/5',
          border: 'border-[#EB5757]/30',
          iconBg: 'bg-[#EB5757]/20',
          iconColor: 'text-[#EB5757]',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-[#828282]/10 to-[#828282]/5',
          border: 'border-[#828282]/30',
          iconBg: 'bg-[#828282]/20',
          iconColor: 'text-[#828282]',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`p-3 rounded-xl text-xs shadow-md border transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      } ${styles.bg} ${styles.border} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
          {icon || <BookOpen className={`w-3 h-3 ${styles.iconColor}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#4F4F4F] line-clamp-1">{title}</p>
          {subtitle && (
            <p className="text-[#828282] text-[10px] mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        {time && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#828282]" />
            <p className="text-[#828282] text-[10px]">{time}</p>
          </div>
        )}
        {lecturer && (
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3 text-[#828282]" />
            <p className="text-[#828282] text-[10px] line-clamp-1">{lecturer}</p>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#828282]" />
            <p className="text-[#828282] text-[10px]">{location}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;

import React from 'react';

type Status = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'published' | 'pending' | 'auto_rejected';

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  // Handle undefined or null status
  if (!status) {
    return (
      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#828282]/10 text-[#828282]">
        Unknown
      </span>
    );
  }

  const getStatusColor = () => {
    switch (status) {
      case 'draft':
        return 'bg-[#828282]/10 text-[#828282]';
      case 'submitted':
        return 'bg-[#2F80ED]/10 text-[#2F80ED]';
      case 'reviewed':
        return 'bg-[#BB6BD9]/10 text-[#BB6BD9]';
      case 'approved':
        return 'bg-[#6FCF97]/10 text-[#6FCF97]';
      case 'rejected':
        return 'bg-[#EB5757]/10 text-[#EB5757]';
      case 'published':
        return 'bg-[#6FCF97]/10 text-[#6FCF97]';
      case 'pending':
        return 'bg-[#FFC107]/10 text-[#FFC107]';
      case 'auto_rejected':
        return 'bg-[#FF5722]/10 text-[#FF5722]';
      default:
        return 'bg-[#828282]/10 text-[#828282]';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusColor()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export { StatusBadge };
export default StatusBadge;
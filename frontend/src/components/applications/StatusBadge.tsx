import { useTranslations } from 'next-intl';

interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations('EventRegistrations');

  const statusClasses = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
    >
      {t(status.toLowerCase())}
    </span>
  );
}

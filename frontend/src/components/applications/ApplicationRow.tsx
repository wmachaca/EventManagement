import { CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import StatusBadge from './StatusBadge';
import { useTranslations } from 'next-intl';

interface ApplicationRowProps {
  application: {
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    appliedAt: string;
    reviewedAt: string | null;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  onStatusChange: (applicationId: number, status: 'APPROVED' | 'REJECTED') => void;
  currentUserId: number;
}

export default function ApplicationRow({
  application,
  onStatusChange,
  currentUserId,
}: ApplicationRowProps) {
  const t = useTranslations('EventRegistrations');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{application.user.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{application.user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={application.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(application.appliedAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {application.status === 'PENDING' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onStatusChange(application.id, 'APPROVED')}
              className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-100"
              title={t('approve')}
            >
              <CheckIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onStatusChange(application.id, 'REJECTED')}
              className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
              title={t('reject')}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
        {application.status !== 'PENDING' && (
          <div className="text-gray-400 inline-flex items-center">
            <ClockIcon className="h-5 w-5 mr-1" />
            {t('decisionMade')}
          </div>
        )}
      </td>
    </tr>
  );
}

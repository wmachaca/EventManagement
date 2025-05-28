import { useTranslations } from 'next-intl';
import ApplicationRow from './ApplicationRow';

interface ApplicationsTableProps {
  applications: {
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    appliedAt: string;
    reviewedAt: string | null;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }[];
  onStatusChange: (applicationId: number, status: 'APPROVED' | 'REJECTED') => void;
  currentUserId: number;
}

export default function ApplicationsTable({
  applications,
  onStatusChange,
  currentUserId,
}: ApplicationsTableProps) {
  const t = useTranslations('EventRegistrations');

  // Count applications by status
  const pendingCount = applications.filter(app => app.status === 'PENDING').length;
  const approvedCount = applications.filter(app => app.status === 'APPROVED').length;
  const rejectedCount = applications.filter(app => app.status === 'REJECTED').length;

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
          {t('total')}: {applications.length}
        </div>
        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
          {t('pending')}: {pendingCount}
        </div>
        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          {t('approved')}: {approvedCount}
        </div>
        <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg">
          {t('rejected')}: {rejectedCount}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('appliedAt')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {t('noApplications')}
                </td>
              </tr>
            ) : (
              applications.map(application => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  onStatusChange={onStatusChange}
                  currentUserId={currentUserId}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

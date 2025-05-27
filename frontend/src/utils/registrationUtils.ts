import type { RegistrationStatus, Event } from '@/types/event';
import type { EventWithRelations } from '@/types/event';
import axios from 'axios';

export const getRegistrationButtonText = (
  isRegistering: boolean,
  registration: RegistrationStatus,
  t: any, //use  usetranslations() inside a react component
) => {
  if (isRegistering) return t('processing') || 'Processing...';

  if (registration.isRegistered) {
    switch (registration.status) {
      case 'PENDING':
        return t('pendingApproval') || 'Pending Approval';
      case 'APPROVED':
        return t('registered') || 'Registered (Cancel)';
      case 'REJECTED':
        return t('rejected') || 'Application Rejected';
      default:
        return t('registered') || 'Registered (Cancel)';
    }
  }
  return t('registerNow') || 'Register Now';
};

export const isRegistrationDisabled = (
  isRegistering: boolean,
  registration: RegistrationStatus,
  event: EventWithRelations,
) => {
  return (
    isRegistering ||
    (registration.isRegistered && registration.status === 'REJECTED') ||
    event.status !== 'PUBLISHED' ||
    (event.capacity && (event.attendees?.length ?? 0) >= event.capacity)
  );
};

export const handleRegistration = async (
  eventId: string,
  registration: RegistrationStatus,
  session: any,
  setRegistration: (status: RegistrationStatus) => void,
  setIsRegistering: (loading: boolean) => void,
  fetchEvent: () => Promise<void>,
) => {
  setIsRegistering(true);
  try {
    if (registration.isRegistered) {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/apply`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setRegistration({
        isRegistered: false,
        status: null,
      });
    } else {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      setRegistration({
        isRegistered: true,
        status: response.data.data.status,
      });

      await fetchEvent();
    }
  } catch (err) {
    console.error(err);
    throw new Error('Failed to process registration');
  } finally {
    setIsRegistering(false);
  }
};

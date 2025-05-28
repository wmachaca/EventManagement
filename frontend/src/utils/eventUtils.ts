import axios from 'axios';
export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const fetchEventDetails = async (eventId: string, session: any) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  return response.data;
};

export const checkRegistrationStatus = async (eventId: string, session: any) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/registration`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      },
    );
    return response.data.data;
  } catch (err) {
    console.error('Error checking registration:', err);
    return {
      isRegistered: false,
      status: null,
    };
  }
};

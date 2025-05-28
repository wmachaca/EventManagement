import { useTranslations } from 'next-intl';
import type { ToolbarProps } from 'react-big-calendar';
import type { View } from 'react-big-calendar';

export default function CalendarToolbar(props: ToolbarProps) {
  console.log('Toolbar props:', props);
  const t = useTranslations('EventCalendar');

  const goToToday = () => {
    props.onNavigate('TODAY');
  };

  const goToPrevious = () => {
    console.log('Going to previous');
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const changeView = (view: View) => {
    props.onView(view);
  };

  return (
    <div className="rbc-toolbar mb-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={goToPrevious}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            {t('previous')}
          </button>
          <button onClick={goToNext} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            {t('next')}
          </button>
        </div>

        <span className="text-lg font-semibold">{props.label}</span>

        <div className="flex space-x-2">
          <button
            onClick={() => changeView('month')}
            className={`px-3 py-1 rounded ${props.view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {t('month')}
          </button>
          <button
            onClick={() => changeView('week')}
            className={`px-3 py-1 rounded ${props.view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {t('week')}
          </button>
        </div>
      </div>
    </div>
  );
}

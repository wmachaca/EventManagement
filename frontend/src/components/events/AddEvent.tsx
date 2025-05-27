// components/events/AddEvent.tsx
'use client';

import { useState, useEffect } from 'react';
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED';

interface AddEventProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  setSubmissionError: (error: string | null) => void;
  isEditMode?: boolean;
  currentEvent?: any;
}

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export default function AddEvent({
  onSubmit,
  isSubmitting,
  setSubmissionError,
  isEditMode = false,
  currentEvent = null,
}: AddEventProps) {
  // Initialize all fields with empty values or current event data
  const [name, setName] = useState(currentEvent?.name || '');
  const [description, setDescription] = useState(currentEvent?.description || '');
  const [image, setImage] = useState<File | null>(null);
  const [isVirtual, setIsVirtual] = useState(currentEvent?.isVirtual || false);
  const [location, setLocation] = useState(currentEvent?.location || '');
  const [virtualLink, setVirtualLink] = useState(currentEvent?.virtualLink || '');
  const [startDate, setStartDate] = useState(
    currentEvent?.startDate ? formatDateForInput(currentEvent.startDate) : '',
  );
  const [endDate, setEndDate] = useState(
    currentEvent?.endDate ? formatDateForInput(currentEvent.endDate) : '',
  );
  const [contactEmail, setContactEmail] = useState(currentEvent?.contactEmail || '');
  const [capacity, setCapacity] = useState(currentEvent?.capacity || 50);
  const [requiresApproval, setRequiresApproval] = useState(currentEvent?.requiresApproval || false);
  const [eventStatus, setEventStatus] = useState<EventStatus>(currentEvent?.status || 'DRAFT');
  const [imagePreview, setImagePreview] = useState(
    currentEvent?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${currentEvent.imageUrl}` : null,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Basic validation
    if (endDate && new Date(endDate) < new Date(startDate)) {
      setSubmissionError('End date cannot be before start date');
      return;
    }

    const formData = new FormData();
    // Required fields
    formData.append('name', name);
    formData.append('capacity', capacity.toString());
    formData.append('startDate', new Date(startDate).toISOString());
    formData.append('requiresApproval', requiresApproval.toString());
    formData.append('status', eventStatus);

    // Optional fields - send empty string instead of null/undefined
    formData.append('description', description || '');
    formData.append('isVirtual', isVirtual.toString());
    formData.append('location', isVirtual ? '' : location || '');
    if (isVirtual && virtualLink.trim()) {
      try {
        console.log('This is the virtual link: ', isVirtual, virtualLink);
        new URL(virtualLink); // ensure it's a valid URL
        formData.append('virtualLink', virtualLink);
      } catch {
        setSubmissionError('Please enter a valid URL for the virtual link.');
        return;
      }
    }
    formData.append('endDate', endDate ? new Date(endDate).toISOString() : '');
    formData.append('contactEmail', contactEmail || '');

    // Only append image if a new one was selected
    if (image) {
      formData.append('image', image);
    }

    // Debug: log form data before submission
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    console.log('Current version:', currentEvent?.version);
    // Include version if in edit mode
    if (isEditMode && currentEvent?.version !== undefined) {
      formData.append('version', currentEvent.version.toString());
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-semibold mb-1">Event Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Event Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 max-w-xs h-auto rounded"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isVirtual}
          onChange={e => setIsVirtual(e.target.checked)}
          className="h-4 w-4"
        />
        <label>Is Virtual?</label>
      </div>

      {!isVirtual && (
        <div>
          <label className="block font-semibold mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      )}

      {isVirtual && (
        <div>
          <label className="block font-semibold mb-1">Virtual Link</label>
          <input
            type="url"
            value={virtualLink}
            onChange={e => setVirtualLink(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="https://example.com/meeting"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Start Date *</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Contact Email</label>
        <input
          type="email"
          value={contactEmail}
          onChange={e => setContactEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="contact@example.com"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Capacity *</label>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={e => setCapacity(Number(e.target.value))}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={requiresApproval}
          onChange={e => setRequiresApproval(e.target.checked)}
          className="h-4 w-4"
        />
        <label>Requires Approval for Applications</label>
      </div>
      <div>
        <label className="block font-semibold mb-1">Event Status *</label>
        <select
          value={eventStatus}
          onChange={e => setEventStatus(e.target.value as EventStatus)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-md transition disabled:opacity-50"
      >
        {isSubmitting
          ? isEditMode
            ? 'Updating...'
            : 'Creating...'
          : isEditMode
            ? 'Update Event'
            : 'Create Event'}
      </button>
    </form>
  );
}

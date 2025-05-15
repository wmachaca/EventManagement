// components/events/AddEvent.tsx
'use client';

import { useState } from 'react';

interface AddEventProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  setSubmissionError: (error: string | null) => void;
}

export default function AddEvent({ onSubmit, isSubmitting, setSubmissionError }: AddEventProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVirtual, setIsVirtual] = useState(false);
  const [location, setLocation] = useState('');
  const [virtualLink, setVirtualLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [capacity, setCapacity] = useState(50);

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

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('isVirtual', isVirtual.toString());
    formData.append('location', location);
    formData.append('virtualLink', virtualLink);
    formData.append('capacity', capacity.toString());
    formData.append('startDate', new Date(startDate).toISOString());
    formData.append('endDate', new Date(endDate).toISOString());
    formData.append('contactEmail', contactEmail);
    formData.append('status', 'DRAFT');
    if (image) formData.append('image', image);

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
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Event Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 max-w-xs" />}
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" checked={isVirtual} onChange={e => setIsVirtual(e.target.checked)} />
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
          />
        </div>
      )}

      <div>
        <label className="block font-semibold mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
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

      <div>
        <label className="block font-semibold mb-1">Contact Email</label>
        <input
          type="email"
          value={contactEmail}
          onChange={e => setContactEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Capacity</label>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={e => setCapacity(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-md transition disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}

import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useVenues, Venue } from '../../context/VenueContext';
import VenueForm from '../../components/forms/VenueForm';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { ArrowLeft } from 'lucide-react';

const VenueEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getVenue, updateVenue } = useVenues();

  const venue = id ? getVenue(id) : null;

  if (!venue) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Venue not found</h3>
        <button
          onClick={() => navigate('/venues')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to venues
        </button>
      </div>
    );
  }

  const handleSubmit = (data: Omit<Venue, 'id'>) => {
    updateVenue(venue.id, data);
    navigate('/venues');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/venues')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Venue</h1>
          <p className="text-gray-600 mt-1">{venue.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Venue Details</h2>
        </CardHeader>
        <CardBody>
          <VenueForm
            initialData={venue}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/venues')}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default VenueEdit;
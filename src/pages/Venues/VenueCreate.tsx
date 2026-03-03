import React from 'react';
import { useNavigate } from 'react-router';
import { useVenues, Venue } from '../../context/VenueContext';
import VenueForm from '../../components/forms/VenueForm';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { ArrowLeft } from 'lucide-react';

const VenueCreate = () => {
  const navigate = useNavigate();
  const { addVenue } = useVenues();

  const handleSubmit = (data: Omit<Venue, 'id'>) => {
    addVenue(data);
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Venue</h1>
          <p className="text-gray-600 mt-1">Add a new venue to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Venue Details</h2>
        </CardHeader>
        <CardBody>
          <VenueForm onSubmit={handleSubmit} onCancel={() => navigate('/venues')} />
        </CardBody>
      </Card>
    </div>
  );
};

export default VenueCreate;
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useVenues } from '../../context/VenueContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

const VenueList = () => {
  const navigate = useNavigate();
  const { venues, deleteVenue } = useVenues();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || venue.type === filterType;
    return matchesSearch && matchesType;
  });

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Venue Name' },
    {
      key: 'type',
      header: 'Type',
      render: (venue: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          venue.type === 'lecture' ? 'bg-[#2F80ED]/10 text-[#2F80ED]' :
          venue.type === 'lab' ? 'bg-[#6FCF97]/10 text-[#6FCF97]' :
          'bg-[#BB6BD9]/10 text-[#BB6BD9]'
        }`}>
          {venue.type === 'exam_hall' ? 'Exam Hall' : venue.type.charAt(0).toUpperCase() + venue.type.slice(1)}
        </span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (venue: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            <span className="font-medium">🏫 {venue.teachingCapacity}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 text-xs mt-0.5">
            <span>📝 {venue.examCapacity}</span>
          </div>
        </div>
      ),
    },
    { key: 'building', header: 'Building' },
    {
      key: 'equipment',
      header: 'Equipment',
      render: (venue: any) => (
        <span className="text-sm text-[#828282]">
          {venue.attributes?.equipment?.length || 0} items
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (venue: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/venues/edit/${venue.id}`);
            }}
            className="p-2 hover:bg-[#F8FBFF] rounded-xl transition-all duration-200"
          >
            <Edit className="w-4 h-4 text-[#2F80ED]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this venue?')) {
                deleteVenue(venue.id);
              }
            }}
            className="p-2 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <Trash2 className="w-4 h-4 text-[#EB5757]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="px-1">
          <h1 className="text-xl md:text-2xl font-semibold text-[#2F2E41]">Venue Management</h1>
          <p className="text-gray-500 mt-1 text-xs md:text-sm">Manage lecture halls, labs, and exam venues</p>
        </div>
        <Button onClick={() => navigate('/venues/create')} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Venue
        </Button>
      </div>

      {/* Capacity Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <div className="text-blue-600 mt-0.5">ℹ️</div>
        <div className="text-xs text-gray-700">
          <p className="font-medium text-blue-900 mb-1">Capacity Information:</p>
          <p><span className="font-semibold">🏫 Teaching Capacity</span> - Maximum students for lectures and normal sessions</p>
          <p><span className="font-semibold">📝 Exam Capacity</span> - Maximum students for exams (with social distancing)</p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent bg-[#F8FBFF] text-sm transition-all duration-200"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="lecture">Lecture Halls</option>
              <option value="lab">Labs</option>
              <option value="exam_hall">Exam Halls</option>
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            data={filteredVenues}
            columns={columns}
            onRowClick={(venue) => navigate(`/venues/edit/${venue.id}`)}
          />
        </CardBody>
      </Card>

      {filteredVenues.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F8FBFF] rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-[#828282]" />
          </div>
          <h3 className="text-lg font-semibold text-[#4F4F4F] mb-2">No venues found</h3>
          <p className="text-[#828282] mb-4">Get started by creating your first venue.</p>
          <Button onClick={() => navigate('/venues/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Venue
          </Button>
        </div>
      )}
    </div>
  );
};

export default VenueList;
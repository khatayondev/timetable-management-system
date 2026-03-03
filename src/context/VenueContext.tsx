import React, { createContext, useContext, useState, ReactNode } from 'react';

export type VenueType = 'lecture_hall' | 'laboratory' | 'workshop' | 'tutorial_room' | 'exam_hall';
export type FurnitureType = 'flat_table' | 'tablet_chair' | 'bench' | 'lab_station';
export type NoiseLevel = 'quiet' | 'moderate' | 'workshop_zone';

export interface VenueAttributes {
  // Lab-specific
  specializedSoftware: string[];
  equipment: string[];
  
  // Exam suitability
  furnitureType: FurnitureType;
  noiseLevel: NoiseLevel;
  examSuitable: boolean;
  
  // General
  hasProjector: boolean;
  hasAC: boolean;
  hasWhiteboard: boolean;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  type: VenueType;
  
  // Dual-mode capacity
  teachingCapacity: number;
  examCapacity: number; // Reduced capacity for exam spacing
  
  building: string;
  floor: number;
  
  // Enhanced attributes
  attributes: VenueAttributes;
  
  // Department restrictions - new field
  allowedDepartments?: string[]; // Empty/undefined = available to all departments
  
  // Availability windows
  availability: {
    [day: string]: { start: string; end: string }[];
  };
  
  // Tags for filtering
  tags: string[];
}

interface VenueContextType {
  venues: Venue[];
  addVenue: (venue: Omit<Venue, 'id'>) => void;
  updateVenue: (id: string, venue: Partial<Venue>) => void;
  deleteVenue: (id: string) => void;
  getVenue: (id: string) => Venue | undefined;
  getVenuesByType: (type: VenueType) => Venue[];
  getExamSuitableVenues: () => Venue[];
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

// Enhanced mock data
const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Main Lecture Hall A',
    code: 'LH-A',
    type: 'lecture_hall',
    teachingCapacity: 150,
    examCapacity: 75,
    building: 'Academic Block 1',
    floor: 1,
    attributes: {
      specializedSoftware: [],
      equipment: ['Sound System', 'Document Camera'],
      furnitureType: 'tablet_chair',
      noiseLevel: 'quiet',
      examSuitable: true,
      hasProjector: true,
      hasAC: true,
      hasWhiteboard: true,
    },
    availability: {
      monday: [{ start: '08:00', end: '17:00' }],
      tuesday: [{ start: '08:00', end: '17:00' }],
      wednesday: [{ start: '08:00', end: '17:00' }],
      thursday: [{ start: '08:00', end: '17:00' }],
      friday: [{ start: '08:00', end: '17:00' }],
    },
    tags: ['Large Capacity', 'Exam Ready', 'AC'],
  },
  {
    id: '2',
    name: 'Computer Lab V12',
    code: 'LAB-V12',
    type: 'laboratory',
    teachingCapacity: 60,
    examCapacity: 30,
    building: 'IT Block',
    floor: 2,
    attributes: {
      specializedSoftware: ['AutoCAD', 'Visual Studio', 'Python', 'Java', 'MATLAB'],
      equipment: ['High-spec Computers', 'Network Infrastructure'],
      furnitureType: 'lab_station',
      noiseLevel: 'moderate',
      examSuitable: true,
      hasProjector: true,
      hasAC: true,
      hasWhiteboard: true,
    },
    allowedDepartments: ['dept-1', 'dept-5'], // Restricted to Computer Science departments only
    availability: {
      monday: [{ start: '08:00', end: '17:00' }],
      tuesday: [{ start: '08:00', end: '17:00' }],
      wednesday: [{ start: '08:00', end: '17:00' }],
      thursday: [{ start: '08:00', end: '17:00' }],
      friday: [{ start: '08:00', end: '17:00' }],
    },
    tags: ['Computer Lab', 'Software Engineering', 'Exam Ready'],
  },
  {
    id: '3',
    name: 'Engineering Workshop',
    code: 'WS-01',
    type: 'workshop',
    teachingCapacity: 40,
    examCapacity: 0, // Not suitable for exams
    building: 'Engineering Block',
    floor: 1,
    attributes: {
      specializedSoftware: [],
      equipment: ['Lathe Machines', 'Welding Equipment', 'Safety Gear'],
      furnitureType: 'bench',
      noiseLevel: 'workshop_zone',
      examSuitable: false,
      hasProjector: false,
      hasAC: false,
      hasWhiteboard: true,
    },
    availability: {
      monday: [{ start: '08:00', end: '17:00' }],
      tuesday: [{ start: '08:00', end: '17:00' }],
      wednesday: [{ start: '08:00', end: '17:00' }],
      thursday: [{ start: '08:00', end: '17:00' }],
      friday: [{ start: '08:00', end: '17:00' }],
    },
    tags: ['Workshop', 'Engineering', 'Hands-on'],
  },
  {
    id: '4',
    name: 'Tutorial Room TR-05',
    code: 'TR-05',
    type: 'tutorial_room',
    teachingCapacity: 30,
    examCapacity: 15,
    building: 'Academic Block 2',
    floor: 3,
    attributes: {
      specializedSoftware: [],
      equipment: ['Interactive Display'],
      furnitureType: 'flat_table',
      noiseLevel: 'quiet',
      examSuitable: true,
      hasProjector: true,
      hasAC: true,
      hasWhiteboard: true,
    },
    availability: {
      monday: [{ start: '08:00', end: '17:00' }],
      tuesday: [{ start: '08:00', end: '17:00' }],
      wednesday: [{ start: '08:00', end: '17:00' }],
      thursday: [{ start: '08:00', end: '17:00' }],
      friday: [{ start: '08:00', end: '17:00' }],
    },
    tags: ['Small Group', 'Quiet', 'Exam Ready'],
  },
  {
    id: '5',
    name: 'Exam Hall EH-01',
    code: 'EH-01',
    type: 'exam_hall',
    teachingCapacity: 250,
    examCapacity: 120,
    building: 'Exam Center',
    floor: 1,
    attributes: {
      specializedSoftware: [],
      equipment: ['Wall Clocks', 'Notice Boards', 'Surveillance Cameras'],
      furnitureType: 'flat_table',
      noiseLevel: 'quiet',
      examSuitable: true,
      hasProjector: false,
      hasAC: true,
      hasWhiteboard: false,
    },
    availability: {
      monday: [{ start: '08:00', end: '18:00' }],
      tuesday: [{ start: '08:00', end: '18:00' }],
      wednesday: [{ start: '08:00', end: '18:00' }],
      thursday: [{ start: '08:00', end: '18:00' }],
      friday: [{ start: '08:00', end: '18:00' }],
      saturday: [{ start: '08:00', end: '18:00' }],
    },
    tags: ['Exam Dedicated', 'Large Capacity', 'Monitored'],
  },
];

export const VenueProvider = ({ children }: { children: ReactNode }) => {
  const [venues, setVenues] = useState<Venue[]>(mockVenues);

  const addVenue = (venue: Omit<Venue, 'id'>) => {
    const newVenue: Venue = {
      ...venue,
      id: Date.now().toString(),
    };
    setVenues([...venues, newVenue]);
  };

  const updateVenue = (id: string, updatedVenue: Partial<Venue>) => {
    setVenues(venues.map((v) => (v.id === id ? { ...v, ...updatedVenue } : v)));
  };

  const deleteVenue = (id: string) => {
    setVenues(venues.filter((v) => v.id !== id));
  };

  const getVenue = (id: string) => {
    return venues.find((v) => v.id === id);
  };

  const getVenuesByType = (type: VenueType) => {
    return venues.filter((v) => v.type === type);
  };

  const getExamSuitableVenues = () => {
    return venues.filter((v) => v.attributes.examSuitable && v.examCapacity > 0);
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        addVenue,
        updateVenue,
        deleteVenue,
        getVenue,
        getVenuesByType,
        getExamSuitableVenues,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};

export const useVenues = () => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error('useVenues must be used within VenueProvider');
  }
  return context;
};
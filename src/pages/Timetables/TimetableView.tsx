import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTimetable } from '../../context/TimetableContext';
import { Calendar, Filter, Download, Eye, Users, MapPin, BookOpen } from 'lucide-react';

type ViewMode = 'program' | 'lecturer' | 'room' | 'student';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function TimetableView() {
  const { timetableEntries, courses, lecturers, venues } = useTimetable();
  const [viewMode, setViewMode] = useState<ViewMode>('program');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const programs = Array.from(new Set(courses.map(c => c.program)));

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.code || 'Unknown';
  };

  const getLecturerName = (lecturerId: string) => {
    return lecturers.find(l => l.id === lecturerId)?.name || 'Unknown';
  };

  const getVenueName = (venueId: string) => {
    return venues.find(v => v.id === venueId)?.name || 'Unknown';
  };

  const getCourseProgram = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.program || '';
  };

  const filteredEntries = timetableEntries.filter(entry => {
    if (selectedFilter === 'all') return true;

    switch (viewMode) {
      case 'program':
        return getCourseProgram(entry.courseId) === selectedFilter;
      case 'lecturer':
        return entry.lecturerId === selectedFilter;
      case 'room':
        return entry.venueId === selectedFilter;
      default:
        return true;
    }
  });

  const getEntriesForSlot = (day: string, time: string) => {
    return filteredEntries.filter(entry => entry.day === day && entry.startTime === time);
  };

  const getFilterOptions = () => {
    switch (viewMode) {
      case 'program':
        return programs;
      case 'lecturer':
        return lecturers.map(l => ({ id: l.id, name: l.name }));
      case 'room':
        return venues.map(v => ({ id: v.id, name: v.name }));
      default:
        return [];
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'lab':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'practical':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teaching Timetable</h1>
            <p className="text-gray-600 mt-1">View and manage class schedules</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={20} />
            <span>Export PDF</span>
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* View Mode */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Eye size={16} className="inline mr-1" />
                View By
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setViewMode('program');
                    setSelectedFilter('all');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'program'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Program
                </button>
                <button
                  onClick={() => {
                    setViewMode('lecturer');
                    setSelectedFilter('all');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'lecturer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lecturer
                </button>
                <button
                  onClick={() => {
                    setViewMode('room');
                    setSelectedFilter('all');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'room'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Room
                </button>
                <button
                  onClick={() => {
                    setViewMode('student');
                    setSelectedFilter('all');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'student'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Student
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Filter
              </label>
              <select
                value={selectedFilter}
                onChange={e => setSelectedFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                {viewMode === 'program' &&
                  programs.map(prog => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                {viewMode === 'lecturer' &&
                  lecturers.map(lect => (
                    <option key={lect.id} value={lect.id}>
                      {lect.name}
                    </option>
                  ))}
                {viewMode === 'room' &&
                  venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-24 sticky left-0 bg-gray-50 z-10">
                    Time
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                      {time}
                    </td>
                    {DAYS.map(day => {
                      const entries = getEntriesForSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="px-2 py-2 align-top">
                          <div className="space-y-1">
                            {entries.map(entry => (
                              <div
                                key={entry.id}
                                className={`p-2 rounded-lg border text-xs ${getTypeColor(entry.type)}`}
                              >
                                <div className="font-semibold mb-1 flex items-center gap-1">
                                  <BookOpen size={12} />
                                  {getCourseName(entry.courseId)}
                                </div>
                                <div className="space-y-0.5 text-xs opacity-90">
                                  <div className="flex items-center gap-1">
                                    <Users size={10} />
                                    {getLecturerName(entry.lecturerId)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin size={10} />
                                    {getVenueName(entry.venueId)}
                                  </div>
                                  {entry.studentGroup && (
                                    <div className="font-medium mt-1">{entry.studentGroup}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded" />
              <span className="text-sm text-gray-700">Lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded" />
              <span className="text-sm text-gray-700">Lab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded" />
              <span className="text-sm text-gray-700">Practical</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

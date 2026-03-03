import React, { useState } from 'react';
import { useInvigilation } from '../../context/InvigilationContext';
import { useLecturers } from '../../context/LecturerContext';
import { useCourses } from '../../context/CourseContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { ClipboardList, Download, Calendar, User, Clock } from 'lucide-react';

const InvigilationRoster = () => {
  const { rosters, assignments, approveRoster, autoGenerateInvigilationRoster } = useInvigilation();
  const { lecturers } = useLecturers();
  const { courses } = useCourses();
  const [selectedRoster, setSelectedRoster] = useState<string | null>(null);

  const getLecturerName = (lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Unknown';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown';
  };

  const activeRoster = rosters.find(r => selectedRoster ? r.id === selectedRoster : r.status === 'approved') || rosters[0];
  const rosterAssignments = activeRoster ? assignments.filter(a => activeRoster.assignments.includes(a.id)) : [];

  const columns = [
    {
      key: 'lecturerId',
      header: 'Lecturer',
      render: (assignment: any) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#828282]" />
          <span className="font-medium text-[#4F4F4F]">{getLecturerName(assignment.lecturerId)}</span>
        </div>
      ),
    },
    {
      key: 'examSessionId',
      header: 'Exam Session',
      render: (assignment: any) => (
        <span className="text-sm text-[#4F4F4F]">Session #{assignment.examSessionId}</span>
      ),
    },
    { key: 'date', header: 'Date' },
    {
      key: 'time',
      header: 'Time',
      render: (assignment: any) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#828282]" />
          <span className="text-sm text-[#4F4F4F]">{assignment.startTime} - {assignment.endTime}</span>
        </div>
      ),
    },
    { key: 'venue', header: 'Venue' },
    {
      key: 'role',
      header: 'Role',
      render: (assignment: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          assignment.role === 'chief' 
            ? 'bg-gradient-to-r from-[#2F80ED]/20 to-[#2D9CDB]/20 text-[#2F80ED] border border-[#2F80ED]/30' 
            : 'bg-[#F8FBFF] text-[#828282] border border-gray-200'
        }`}>
          {assignment.role.charAt(0).toUpperCase() + assignment.role.slice(1)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (assignment: any) => (
        <StatusBadge status={assignment.status} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#4F4F4F]">Invigilation Roster</h1>
          <p className="text-[#828282] mt-1 text-sm">Manage exam invigilation assignments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => autoGenerateInvigilationRoster([])}>
            <ClipboardList className="w-4 h-4 mr-2" />
            Auto-Generate
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Roster Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#2F80ED]" />
              <h2 className="text-lg font-semibold text-[#4F4F4F]">Select Roster</h2>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rosters.map(roster => (
              <div
                key={roster.id}
                onClick={() => setSelectedRoster(roster.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedRoster === roster.id || (!selectedRoster && roster.status === 'approved')
                    ? 'border-[#2F80ED] bg-gradient-to-br from-[#2F80ED]/5 to-[#2D9CDB]/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#2F80ED]/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#4F4F4F]">{roster.examPeriod}</h3>
                    <p className="text-xs text-[#828282] mt-1">
                      {roster.academicYear} • Semester {roster.semester}
                    </p>
                  </div>
                  <StatusBadge status={roster.status} />
                </div>
                <div className="text-xs text-[#828282]">
                  <p>{roster.assignments.length} assignments</p>
                  <p className="mt-1">Generated: {new Date(roster.generatedDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Assignments Table */}
      {activeRoster && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#4F4F4F]">{activeRoster.examPeriod} - Assignments</h2>
                <p className="text-sm text-[#828282] mt-1">
                  {rosterAssignments.length} total assignments
                </p>
              </div>
              {activeRoster.status === 'draft' && (
                <Button onClick={() => approveRoster(activeRoster.id, 'admin@university.edu')}>
                  Approve Roster
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <DataTable
              data={rosterAssignments}
              columns={columns}
            />
          </CardBody>
        </Card>
      )}

      {rosters.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-[#BDBDBD] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#4F4F4F] mb-2">No invigilation rosters available</h3>
            <p className="text-[#828282]">Click "Auto-Generate" to create a new roster.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default InvigilationRoster;

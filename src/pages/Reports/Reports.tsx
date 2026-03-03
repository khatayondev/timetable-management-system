import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Download, FileText, Users, Building2, Calendar } from 'lucide-react';

const Reports = () => {
  const reportTypes = [
    {
      id: 'seating-charts',
      name: 'Seating Charts',
      description: 'Generate seating arrangements for exam halls',
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      color: 'blue',
    },
    {
      id: 'invigilation-roster',
      name: 'Invigilation Roster',
      description: 'List of invigilators assigned to exams',
      icon: <Users className="w-6 h-6 text-green-600" />,
      color: 'green',
    },
    {
      id: 'room-utilization',
      name: 'Room Utilization',
      description: 'Analysis of room usage and availability',
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      color: 'purple',
    },
    {
      id: 'lecturer-workload',
      name: 'Lecturer Workload',
      description: 'Teaching hours per lecturer analysis',
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      color: 'orange',
    },
    {
      id: 'class-schedule',
      name: 'Class Schedule',
      description: 'Complete class schedules by program',
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      color: 'indigo',
    },
    {
      id: 'exam-schedule',
      name: 'Exam Schedule',
      description: 'Complete exam schedules by program',
      icon: <FileText className="w-6 h-6 text-red-600" />,
      color: 'red',
    },
  ];

  const handleExport = (reportId: string, format: 'pdf' | 'excel') => {
    alert(`Exporting ${reportId} as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
        <p className="text-gray-600 mt-1">Generate and export timetable reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardBody>
              <div className={`w-12 h-12 bg-${report.color}-50 rounded-lg flex items-center justify-center mb-4`}>
                {report.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExport(report.id, 'pdf')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExport(report.id, 'excel')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Custom Report Generator</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Select report type...</option>
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>2025/2026</option>
                  <option>2024/2025</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Semesters</option>
                  <option>Semester 1</option>
                  <option>Semester 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Programs</option>
                  <option>Computer Science</option>
                  <option>Mathematics</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;

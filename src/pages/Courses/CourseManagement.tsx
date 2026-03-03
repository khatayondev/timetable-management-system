import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCourses, Course } from '../../context/CourseContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  BookOpen,
  Upload,
  X
} from 'lucide-react';

const CourseManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, deleteCourse, addCourse } = useCourses();
  const { faculties, departments } = useOrganization();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Check permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'registry';
  const isLecturer = user?.role === 'lecturer';
  const canManageCourses = isAdmin;

  // Filter courses
  const filteredCourses = courses.filter(course => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Faculty filter
    const matchesFaculty = selectedFaculty === 'all' || course.facultyId === selectedFaculty;
    
    // Department filter
    const matchesDepartment = selectedDepartment === 'all' || course.departmentId === selectedDepartment;
    
    // Level filter
    const matchesLevel = selectedLevel === 'all' || course.level?.toString() === selectedLevel;
    
    // Lecturer filter (if lecturer is viewing)
    const matchesLecturer = !isLecturer || course.assignedLecturerIds?.includes(user.id);
    
    return matchesSearch && matchesFaculty && matchesDepartment && matchesLevel && matchesLecturer;
  });

  // Get filtered departments based on selected faculty
  const filteredDepartments = selectedFaculty === 'all' 
    ? departments 
    : departments.filter(d => d.facultyId === selectedFaculty);

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"?\n\nNote: This will affect any timetables or assignments using this course.`)) {
      deleteCourse(courseId);
    }
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/courses/edit/${courseId}`);
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setUploadMessage('Please upload a CSV file');
        setUploadStatus('error');
        return;
      }
      setUploadFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile) {
      setUploadMessage('Please select a file');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading and processing courses...');

    try {
      // Read file content
      const text = await uploadFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or has no data rows');
      }

      // Parse CSV header
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['code', 'title', 'facultyId', 'departmentId', 'level', 'creditHours', 'courseType'];
      const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

      if (!hasRequiredHeaders) {
        throw new Error(`CSV must include headers: ${requiredHeaders.join(', ')}`);
      }

      // Parse and add courses
      let successCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const courseData: any = {};
          headers.forEach((header, index) => {
            courseData[header] = values[index];
          });

          // Add course using context
          const newCourse = {
            id: `course-${Date.now()}-${i}`,
            code: courseData.code || '',
            title: courseData.title || '',
            facultyId: courseData.facultyId || '',
            departmentId: courseData.departmentId || '',
            level: parseInt(courseData.level) || 100,
            creditHours: parseInt(courseData.creditHours) || 3,
            courseType: courseData.courseType || 'lecture',
            description: courseData.description || '',
            lecturerName: courseData.lecturerName || '',
            facultyName: faculties.find(f => f.id === courseData.facultyId)?.name || '',
            departmentName: departments.find(d => d.id === courseData.departmentId)?.name || '',
            assignedLecturerIds: [],
          };

          addCourse(newCourse);
          successCount++;
        }
      }

      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${successCount} course(s)!`);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadStatus('idle');
        setUploadMessage('');
      }, 2000);
    } catch (error: any) {
      setUploadStatus('error');
      setUploadMessage(error.message || 'Failed to upload courses');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="px-1">
          <h1 className="text-xl md:text-2xl font-semibold text-[#2F2E41]">Course Management</h1>
          <p className="text-gray-500 mt-1 text-xs md:text-sm">
            Manage and organize academic courses
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageCourses && (
            <Button onClick={() => navigate('/courses/create')} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Course</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
          {canManageCourses && (
            <Button
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Upload Course</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282]" />
              <input
                type="text"
                placeholder="Search by course code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Faculty
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => {
                    setSelectedFaculty(e.target.value);
                    setSelectedDepartment('all');
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-white"
                >
                  <option value="all">All Faculties</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-white"
                  disabled={selectedFaculty === 'all'}
                >
                  <option value="all">All Departments</option>
                  {filteredDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-white"
                >
                  <option value="all">All Levels</option>
                  <option value="100">Level 100</option>
                  <option value="200">Level 200</option>
                  <option value="300">Level 300</option>
                  <option value="400">Level 400</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFaculty('all');
                    setSelectedDepartment('all');
                    setSelectedLevel('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-[#828282]">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardBody className="p-0">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 px-6">
              <BookOpen className="w-16 h-16 text-[#BDBDBD] mx-auto mb-4" />
              <p className="text-[#828282] text-lg">No courses found</p>
              <p className="text-[#BDBDBD] text-sm mt-1">
                {searchTerm || selectedFaculty !== 'all' || selectedDepartment !== 'all' || selectedLevel !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first course'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Course Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Faculty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Credits
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Lecturer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Type
                    </th>
                    {canManageCourses && (
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course, index) => (
                    <tr 
                      key={course.id}
                      className={`border-b border-gray-100 hover:bg-[#FAFBFD] transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#5B7EFF]/10 text-[#5B7EFF] rounded font-mono text-sm font-semibold">
                          {course.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#4F4F4F]">{course.title}</div>
                        {course.description && (
                          <div className="text-sm text-[#828282] mt-1 line-clamp-1">
                            {course.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4F4F4F]">
                        {course.facultyName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4F4F4F]">
                        {course.departmentName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {course.level && (
                          <span className="px-2 py-1 bg-gray-100 text-[#828282] rounded text-xs font-medium">
                            Level {course.level}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4F4F4F]">
                        {course.creditHours}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4F4F4F]">
                        {course.lecturerName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          course.courseType === 'lecture' ? 'bg-blue-100 text-blue-700' :
                          course.courseType === 'lab' ? 'bg-green-100 text-green-700' :
                          course.courseType === 'tutorial' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {course.courseType.charAt(0).toUpperCase() + course.courseType.slice(1)}
                        </span>
                      </td>
                      {canManageCourses && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditCourse(course.id)}
                              className="p-2 hover:bg-[#5B7EFF]/10 rounded-lg transition-colors"
                              title="Edit Course"
                            >
                              <Edit className="w-4 h-4 text-[#5B7EFF]" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.title)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload Courses (CSV)</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadStatus('idle');
                  setUploadMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleUploadFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={uploadStatus === 'uploading'}
                />
                {uploadFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <span className="font-medium">{uploadFile.name}</span>
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Instructions:</h3>
                <p className="text-xs text-blue-800 mb-2">Required headers (in order):</p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 block mb-2">
                  code, title, facultyId, departmentId, level, creditHours, courseType
                </code>
                <p className="text-xs text-blue-800 mb-1">Example:</p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 block">
                  CS101,Introduction to Programming,fac-1,dept-1,100,3,lecture
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Note:</strong> courseType can be: lecture, lab, tutorial, or seminar
                </p>
              </div>

              {/* Status Message */}
              {uploadMessage && (
                <div className={`p-4 rounded-lg ${uploadStatus === 'success' ? 'bg-green-50 border border-green-200' : uploadStatus === 'error' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm ${uploadStatus === 'success' ? 'text-green-800' : uploadStatus === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                    {uploadMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadStatus('idle');
                  setUploadMessage('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                disabled={uploadStatus === 'uploading'}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadFile}
                disabled={!uploadFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
                className="px-4 py-2 bg-gradient-to-r from-[#5B5FFF] to-[#7C8FFF] text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Courses
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
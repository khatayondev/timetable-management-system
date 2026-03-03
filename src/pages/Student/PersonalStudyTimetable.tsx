import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  BookOpen, 
  Clock, 
  Save, 
  Trash2, 
  GripVertical, 
  Plus,
  Info,
  X,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AttendanceType } from '../../context/ClassContext';

// Types
interface Course {
  id: string;
  code: string;
  name: string;
  credits?: number;
  color: string;
}

interface StudyBlock {
  id: string;
  courseId: string;
  day: string;
  startTime: string;
  endTime: string;
  topic?: string;
  priority?: 'low' | 'medium' | 'high';
  studyType?: 'reading' | 'revision' | 'practice' | 'group';
}

interface TimeSlot {
  time: string;
  displayTime: string;
}

// Drag and Drop Types
const ItemTypes = {
  COURSE: 'course',
  STUDY_BLOCK: 'study_block',
};

// Pastel color palette
const PASTEL_COLORS = [
  'bg-indigo-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-teal-200',
  'bg-orange-200',
  'bg-cyan-200',
  'bg-rose-200',
];

// Mock enrolled courses - in real app, this comes from student's class
const MOCK_COURSES: Omit<Course, 'color'>[] = [
  { id: 'cs101', code: 'CS101', name: 'Introduction to Programming', credits: 3 },
  { id: 'math101', code: 'MATH101', name: 'Calculus I', credits: 4 },
  { id: 'cs201', code: 'CS201', name: 'Data Structures', credits: 3 },
  { id: 'eng101', code: 'ENG101', name: 'Technical Writing', credits: 2 },
  { id: 'phy101', code: 'PHY101', name: 'Physics I', credits: 3 },
];

// Time slots from 8 AM to 10 PM
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour <= 22; hour++) {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      displayTime: hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`,
    });
  }
  return slots;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = generateTimeSlots();

// Course Drag Item Component
const CourseItem: React.FC<{ course: Course }> = ({ course }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.COURSE,
    item: { course },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`${course.color} p-3 rounded-xl border-2 border-transparent hover:border-[#5B5FFF] cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <GripVertical className="w-4 h-4 text-gray-600" />
        <p className="font-semibold text-gray-900 text-sm">{course.code}</p>
      </div>
      <p className="text-xs text-gray-700 line-clamp-2">{course.name}</p>
      {course.credits && (
        <p className="text-xs text-gray-600 mt-1">{course.credits} Credits</p>
      )}
    </div>
  );
};

// Study Block Component
const StudyBlockCell: React.FC<{
  block: StudyBlock;
  course: Course;
  onEdit: (block: StudyBlock) => void;
  onDelete: (blockId: string) => void;
}> = ({ block, course, onEdit, onDelete }) => {
  const priorityColors = {
    low: 'border-l-4 border-l-green-500',
    medium: 'border-l-4 border-l-yellow-500',
    high: 'border-l-4 border-l-red-500',
  };

  return (
    <div
      className={`${course.color} p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full ${
        block.priority ? priorityColors[block.priority] : ''
      }`}
      onClick={() => onEdit(block)}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className="font-semibold text-xs text-gray-900">{course.code}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
          className="p-0.5 hover:bg-red-100 rounded transition-colors"
        >
          <X className="w-3 h-3 text-red-600" />
        </button>
      </div>
      {block.topic && (
        <p className="text-[10px] text-gray-700 line-clamp-1 mb-1">{block.topic}</p>
      )}
      <div className="flex items-center gap-1 text-[10px] text-gray-600">
        <Clock className="w-3 h-3" />
        <span>{block.startTime} - {block.endTime}</span>
      </div>
      {block.studyType && (
        <span className="inline-block mt-1 px-1.5 py-0.5 bg-white/60 rounded text-[9px] font-medium capitalize">
          {block.studyType}
        </span>
      )}
    </div>
  );
};

// Time Slot Drop Zone
const TimeSlotCell: React.FC<{
  day: string;
  time: string;
  onDrop: (courseId: string, day: string, startTime: string) => void;
  block?: StudyBlock;
  course?: Course;
  onEditBlock: (block: StudyBlock) => void;
  onDeleteBlock: (blockId: string) => void;
}> = ({ day, time, onDrop, block, course, onEditBlock, onDeleteBlock }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.COURSE,
    drop: (item: { course: Course }) => {
      onDrop(item.course.id, day, time);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const backgroundColor = isOver && canDrop ? 'bg-blue-100' : 'bg-white';

  return (
    <td
      ref={drop}
      className={`border border-gray-200 p-1 ${backgroundColor} transition-colors duration-200 align-top`}
      style={{ minHeight: '60px', height: '60px' }}
    >
      {block && course ? (
        <StudyBlockCell
          block={block}
          course={course}
          onEdit={onEditBlock}
          onDelete={onDeleteBlock}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          {isOver && canDrop && (
            <Plus className="w-4 h-4 text-blue-500" />
          )}
        </div>
      )}
    </td>
  );
};

// Edit Block Modal
const EditBlockModal: React.FC<{
  block: StudyBlock;
  course: Course;
  onSave: (block: StudyBlock) => void;
  onClose: () => void;
}> = ({ block, course, onSave, onClose }) => {
  const [formData, setFormData] = useState(block);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Study Block</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <div className={`${course.color} p-3 rounded-lg`}>
              <p className="font-semibold text-gray-900">{course.code}</p>
              <p className="text-sm text-gray-700">{course.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FFF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FFF] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic / Notes
            </label>
            <input
              type="text"
              value={formData.topic || ''}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Chapter 3 - Loops"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FFF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Type
            </label>
            <select
              value={formData.studyType || ''}
              onChange={(e) => setFormData({ ...formData, studyType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FFF] focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="reading">Reading</option>
              <option value="revision">Revision</option>
              <option value="practice">Practice</option>
              <option value="group">Group Work</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level
            </label>
            <select
              value={formData.priority || ''}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B5FFF] focus:border-transparent"
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const PersonalStudyTimetable: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);

  // Load data on mount
  useEffect(() => {
    // Assign colors to courses
    const coursesWithColors = MOCK_COURSES.map((course, index) => ({
      ...course,
      color: PASTEL_COLORS[index % PASTEL_COLORS.length],
    }));
    setCourses(coursesWithColors);

    // Load saved timetable from localStorage
    const saved = localStorage.getItem('personalStudyTimetable');
    if (saved) {
      try {
        setStudyBlocks(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved timetable:', error);
      }
    }
  }, []);

  // Save to localStorage whenever studyBlocks change
  useEffect(() => {
    if (studyBlocks.length > 0) {
      localStorage.setItem('personalStudyTimetable', JSON.stringify(studyBlocks));
    }
  }, [studyBlocks]);

  const handleDrop = (courseId: string, day: string, startTime: string) => {
    // Calculate end time (default 1 hour)
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = (hours + 1) % 24;
    const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const newBlock: StudyBlock = {
      id: `block_${Date.now()}_${Math.random()}`,
      courseId,
      day,
      startTime,
      endTime,
    };

    setStudyBlocks([...studyBlocks, newBlock]);
    toast.success('Study block added!');
  };

  const handleEditBlock = (updatedBlock: StudyBlock) => {
    setStudyBlocks(studyBlocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    ));
    toast.success('Study block updated!');
  };

  const handleDeleteBlock = (blockId: string) => {
    setStudyBlocks(studyBlocks.filter(block => block.id !== blockId));
    toast.success('Study block removed!');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire study timetable?')) {
      setStudyBlocks([]);
      localStorage.removeItem('personalStudyTimetable');
      toast.success('Study timetable cleared!');
    }
  };

  const getBlocksForSlot = (day: string, time: string) => {
    return studyBlocks.filter(block => block.day === day && block.startTime === time);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4 md:space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="px-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#2F2E41]">
              Personal Study Timetable
            </h1>
            <p className="text-gray-500 mt-1 text-xs md:text-sm">
              Drag and drop courses to plan your study schedule
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleClearAll}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 md:p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-1">
                This is your personal study planner
              </p>
              <p className="text-xs text-blue-800">
                Drag courses from the sidebar into time slots to create your study schedule. 
                This doesn't affect your official class timetable and is private to you.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#5B5FFF]" />
                  <h2 className="text-base font-semibold text-gray-900">Your Courses</h2>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Drag to schedule
                </p>
              </CardHeader>
              <CardBody className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  {courses.map((course) => (
                    <CourseItem key={course.id} course={course} />
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Weekly Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <h2 className="text-base font-semibold text-gray-900">Weekly Schedule</h2>
                <p className="text-xs text-gray-600 mt-1">
                  Drop courses into time slots • Click blocks to edit
                </p>
              </CardHeader>
              <CardBody className="p-4 md:p-6 pt-0">
                <div className="overflow-x-auto scrollbar-thin -mx-4 md:mx-0">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 bg-[#F8FBFF] border border-gray-200 px-2 py-3 text-left text-xs font-semibold text-gray-700 min-w-[80px]">
                          Time
                        </th>
                        {DAYS.map((day) => (
                          <th
                            key={day}
                            className="bg-[#F8FBFF] border border-gray-200 px-2 py-3 text-center text-xs font-semibold text-gray-700 min-w-[120px]"
                          >
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.slice(0, 3)}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((slot) => (
                        <tr key={slot.time}>
                          <td className="sticky left-0 z-10 bg-[#F8FBFF] border border-gray-200 px-2 py-2 text-xs font-medium text-gray-600">
                            <div className="hidden sm:block">{slot.displayTime}</div>
                            <div className="sm:hidden text-[10px]">
                              {slot.time}
                            </div>
                          </td>
                          {DAYS.map((day) => {
                            const blocks = getBlocksForSlot(day, slot.time);
                            const block = blocks[0]; // Only show first block per slot
                            const course = block ? courses.find(c => c.id === block.courseId) : undefined;

                            return (
                              <TimeSlotCell
                                key={day}
                                day={day}
                                time={slot.time}
                                onDrop={handleDrop}
                                block={block}
                                course={course}
                                onEditBlock={setEditingBlock}
                                onDeleteBlock={handleDeleteBlock}
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Priority Legend:</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-l-4 border-l-green-500 bg-gray-100"></div>
                      <span className="text-xs text-gray-600">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-l-4 border-l-yellow-500 bg-gray-100"></div>
                      <span className="text-xs text-gray-600">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-l-4 border-l-red-500 bg-gray-100"></div>
                      <span className="text-xs text-gray-600">High</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Edit Modal */}
        {editingBlock && (
          <EditBlockModal
            block={editingBlock}
            course={courses.find(c => c.id === editingBlock.courseId)!}
            onSave={handleEditBlock}
            onClose={() => setEditingBlock(null)}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default PersonalStudyTimetable;
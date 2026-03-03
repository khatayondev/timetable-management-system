import React, { useState } from 'react';
import { useChangeRequests } from '../../context/ChangeRequestContext';
import { useAuth } from '../../context/AuthContext';
import { useTimetables } from '../../context/TimetableContext';
import { Card, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Plus, Send, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const LecturerChangeRequests = () => {
  const { changeRequests, submitChangeRequest, getLecturerRequests } = useChangeRequests();
  const { user } = useAuth();
  const { timetables } = useTimetables();
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  // Get lecturer's sessions from published timetables
  const lecturerSessions = timetables
    .filter(t => t.status === 'published')
    .flatMap(t => [
      ...t.teachingSessions.filter(s => s.lecturerId === user?.id),
      ...t.examSessions.filter(s => s.invigilators?.includes(user?.id || '')),
    ]);
  
  const myRequests = user ? getLecturerRequests(user.id) : [];
  
  const handleSelectSession = (session: any) => {
    setSelectedSession(session);
    setShowRequestModal(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#4F4F4F]">My Change Requests</h1>
          <p className="text-[#828282] mt-1">Submit and track timetable change requests</p>
        </div>
        
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowRequestModal(true)}
        >
          New Request
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Total Requests</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{myRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#5B7EFF] to-[#7C9FFF] rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Pending</p>
                <p className="text-2xl font-semibold text-[#F2C94C] mt-1">
                  {myRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#F2C94C] to-[#F2994A] rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Approved</p>
                <p className="text-2xl font-semibold text-[#6FCF97] mt-1">
                  {myRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#6FCF97] to-[#27AE60] rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Rejected</p>
                <p className="text-2xl font-semibold text-[#EB5757] mt-1">
                  {myRequests.filter(r => r.status === 'rejected' || r.status === 'auto_rejected').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#EB5757] to-[#C62828] rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* My Requests */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#4F4F4F]">Request History</h2>
        
        {myRequests.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Send className="w-16 h-16 text-[#828282] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#4F4F4F] mb-2">No Requests Yet</h3>
                <p className="text-[#828282] mb-6">Submit your first timetable change request</p>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowRequestModal(true)}
                >
                  Create Request
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          myRequests.map(request => (
            <Card key={request.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-[#4F4F4F]">
                        {(request.originalSession as any).courseName}
                      </h3>
                      <StatusBadge 
                        status={request.status === 'auto_rejected' ? 'rejected' : request.status} 
                      />
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        request.solverResult === 'no_conflict' 
                          ? 'bg-green-100 text-green-700'
                          : request.solverResult === 'soft_conflict'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.solverResult === 'no_conflict' && '✓ No Conflict'}
                        {request.solverResult === 'soft_conflict' && '⚠ Soft Conflict'}
                        {request.solverResult === 'hard_conflict' && '✗ Hard Conflict'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-[#828282] mb-4">
                      Submitted {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Justification */}
                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                      <p className="text-sm font-semibold text-[#4F4F4F] mb-2">Justification:</p>
                      <p className="text-sm text-[#828282]">{request.justification}</p>
                    </div>
                    
                    {/* Changes Requested */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-[#828282] mb-2">Current:</p>
                        <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm">
                          {Object.entries(request.originalSession).slice(0, 5).map(([key, value]) => (
                            <p key={key} className="text-[#4F4F4F] capitalize">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </p>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold text-[#828282] mb-2">Requested:</p>
                        <div className="p-3 bg-[#5B7EFF]/5 border border-[#5B7EFF]/20 rounded-lg text-sm">
                          {Object.entries(request.requestedChanges).map(([key, value]) => (
                            <p key={key} className="text-[#4F4F4F] capitalize">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Conflict Details */}
                    {request.conflictDetails && request.conflictDetails.length > 0 && (
                      <div className="p-4 bg-[#F2C94C]/10 border border-[#F2C94C]/20 rounded-xl mb-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#F2C94C] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-[#F2C94C]">Potential Issues:</p>
                            <ul className="mt-2 space-y-1 text-sm text-[#828282]">
                              {request.conflictDetails.map((detail, idx) => (
                                <li key={idx}>• {detail}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Admin Notes */}
                    {request.adminNotes && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-semibold text-[#4F4F4F] mb-2">Admin Response:</p>
                        <p className="text-sm text-[#828282]">{request.adminNotes}</p>
                        <p className="text-xs text-[#828282] mt-2">
                          Resolved by {request.resolvedBy} on {request.resolvedAt && new Date(request.resolvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
      
      {/* Request Modal */}
      {showRequestModal && (
        <ChangeRequestModal
          onClose={() => {
            setShowRequestModal(false);
            setSelectedSession(null);
          }}
          sessions={lecturerSessions}
        />
      )}
    </div>
  );
};

// Simple modal for creating requests
const ChangeRequestModal = ({ onClose, sessions }: { onClose: () => void; sessions: any[] }) => {
  const { submitChangeRequest } = useChangeRequests();
  const { user } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [justification, setJustification] = useState('');
  const [changes, setChanges] = useState<any>({});
  
  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  
  const handleSubmit = async () => {
    if (!selectedSession || !justification.trim() || Object.keys(changes).length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    const result = await submitChangeRequest({
      requestType: 'sessionType' in selectedSession ? 'teaching' : 'exam',
      sessionId: selectedSession.id,
      lecturerId: user?.id || '',
      lecturerName: user?.name || '',
      timetableId: '1', // Would need to track this properly
      originalSession: selectedSession,
      requestedChanges: changes,
      justification,
    });
    
    if (result.success) {
      alert('Change request submitted successfully! Admin will review your request.');
      onClose();
    } else {
      alert(`Request auto-rejected due to hard conflicts:\n${result.conflictDetails?.join('\n')}`);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#4F4F4F]">Submit Change Request</h2>
          <button onClick={onClose} className="text-[#828282] hover:text-[#4F4F4F]">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">Select Session</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 bg-[#FAFBFD]"
            >
              <option value="">Choose a session...</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.courseName} - {'day' in s ? `${s.day} ${s.startTime}` : s.date}
                </option>
              ))}
            </select>
          </div>
          
          {selectedSession && 'day' in selectedSession && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">New Day</label>
                <select
                  onChange={(e) => setChanges({...changes, day: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 bg-[#FAFBFD]"
                >
                  <option value="">Keep current ({selectedSession.day})</option>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">New Start Time</label>
                  <input
                    type="time"
                    onChange={(e) => setChanges({...changes, startTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 bg-[#FAFBFD]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">New End Time</label>
                  <input
                    type="time"
                    onChange={(e) => setChanges({...changes, endTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 bg-[#FAFBFD]"
                  />
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">Justification *</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why you need this change..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 bg-[#FAFBFD]"
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} icon={<Send className="w-4 h-4" />}>
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LecturerChangeRequests;

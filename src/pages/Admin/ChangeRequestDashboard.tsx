import React, { useState } from 'react';
import { useChangeRequests } from '../../context/ChangeRequestContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, User } from 'lucide-react';

const ChangeRequestDashboard = () => {
  const { changeRequests, approveChangeRequest, rejectChangeRequest, getRequestStats, getPendingRequests } = useChangeRequests();
  const { user } = useAuth();
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  const stats = getRequestStats();
  
  const filteredRequests = filter === 'all' 
    ? changeRequests 
    : changeRequests.filter(r => {
        if (filter === 'pending') return r.status === 'pending';
        if (filter === 'approved') return r.status === 'approved';
        if (filter === 'rejected') return r.status === 'rejected' || r.status === 'auto_rejected';
        return true;
      });
  
  const handleApprove = (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this change request?')) {
      approveChangeRequest(requestId, user?.name || 'Admin', adminNotes);
      setSelectedRequest(null);
      setAdminNotes('');
      alert('Change request approved successfully!');
    }
  };
  
  const handleReject = (requestId: string) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection in the admin notes');
      return;
    }
    
    if (window.confirm('Are you sure you want to reject this change request?')) {
      rejectChangeRequest(requestId, user?.name || 'Admin', adminNotes);
      setSelectedRequest(null);
      setAdminNotes('');
      alert('Change request rejected.');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#4F4F4F]">Change Request Management</h1>
        <p className="text-[#828282] mt-1">Review and approve timetable change requests from lecturers</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Total Requests</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#5B7EFF] to-[#7C9FFF] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Pending</p>
                <p className="text-2xl font-semibold text-[#F2C94C] mt-1">{stats.pending}</p>
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
                <p className="text-2xl font-semibold text-[#6FCF97] mt-1">{stats.approved}</p>
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
                <p className="text-2xl font-semibold text-[#EB5757] mt-1">{stats.rejected + stats.autoRejected}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#EB5757] to-[#C62828] rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'pending', label: 'Pending', count: stats.pending },
          { key: 'approved', label: 'Approved', count: stats.approved },
          { key: 'rejected', label: 'Rejected', count: stats.rejected + stats.autoRejected },
          { key: 'all', label: 'All', count: stats.total },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
              filter === tab.key
                ? 'border-[#5B7EFF] text-[#5B7EFF]'
                : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      
      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-[#828282] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#4F4F4F] mb-2">No Requests Found</h3>
                <p className="text-[#828282]">There are no {filter !== 'all' ? filter : ''} change requests at the moment</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredRequests.map(request => (
            <Card key={request.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-[#4F4F4F]">
                        {request.requestType === 'teaching' ? '📚' : '📝'} {(request.originalSession as any).courseName}
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
                    
                    <div className="flex items-center gap-4 text-sm text-[#828282] mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {request.lecturerName}
                      </span>
                      <span>•</span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{request.requestType} Session</span>
                    </div>
                    
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
                          {request.requestType === 'teaching' && (
                            <>
                              <p className="text-[#4F4F4F]">
                                <span className="font-medium">Day:</span> {(request.originalSession as any).day}
                              </p>
                              <p className="text-[#4F4F4F] mt-1">
                                <span className="font-medium">Time:</span> {(request.originalSession as any).startTime} - {(request.originalSession as any).endTime}
                              </p>
                              <p className="text-[#4F4F4F] mt-1">
                                <span className="font-medium">Venue:</span> {(request.originalSession as any).venueName}
                              </p>
                            </>
                          )}
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
                    
                    {/* Admin Notes (if resolved) */}
                    {request.adminNotes && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm font-semibold text-[#4F4F4F] mb-2">Admin Notes:</p>
                        <p className="text-sm text-[#828282]">{request.adminNotes}</p>
                        <p className="text-xs text-[#828282] mt-2">
                          Resolved by {request.resolvedBy} on {request.resolvedAt && new Date(request.resolvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {/* Action Area for Pending Requests */}
                    {request.status === 'pending' && (
                      <div className="mt-4 p-4 border-t border-gray-200">
                        <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                          Admin Notes:
                        </label>
                        <textarea
                          value={selectedRequest === request.id ? adminNotes : ''}
                          onChange={(e) => {
                            setSelectedRequest(request.id);
                            setAdminNotes(e.target.value);
                          }}
                          onFocus={() => setSelectedRequest(request.id)}
                          placeholder="Add notes about this decision..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD] text-sm"
                          rows={3}
                        />
                        
                        <div className="flex items-center gap-3 mt-4">
                          <Button
                            variant="success"
                            size="md"
                            icon={<CheckCircle className="w-4 h-4" />}
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="md"
                            icon={<XCircle className="w-4 h-4" />}
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ChangeRequestDashboard;

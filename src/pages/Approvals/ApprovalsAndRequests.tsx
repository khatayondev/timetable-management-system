import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApprovals } from '../../context/ApprovalContext';
import { useChangeRequests } from '../../context/ChangeRequestContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { Eye, CheckCircle, XCircle, Clock, AlertTriangle, FileText, User, Calendar, MapPin } from 'lucide-react';

const ApprovalsAndRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { approvals } = useApprovals();
  const { changeRequests, approveChangeRequest, rejectChangeRequest, getRequestStats } = useChangeRequests();
  
  const [activeTab, setActiveTab] = useState<'approvals' | 'requests'>('approvals');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const stats = getRequestStats();

  // Filter approvals
  const filteredApprovals = approvals.filter(approval => 
    filterStatus === 'all' || approval.status === filterStatus
  );

  // Filter change requests
  const filteredRequests = changeRequests.filter(request => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return request.status === 'pending';
    if (filterStatus === 'approved') return request.status === 'approved';
    if (filterStatus === 'rejected') return request.status === 'rejected' || request.status === 'auto_rejected';
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

  // Approval columns
  const approvalColumns = [
    {
      key: 'timetableName',
      header: 'Timetable',
      render: (approval: any) => (
        <div>
          <p className="font-medium text-[#4F4F4F]">{approval.timetableName}</p>
          <p className="text-xs text-[#828282]">
            {approval.type === 'teaching' ? 'Teaching' : 'Exam'} Timetable
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (approval: any) => <StatusBadge status={approval.status} />,
    },
    {
      key: 'submittedBy',
      header: 'Submitted By',
    },
    {
      key: 'submittedAt',
      header: 'Submitted Date',
      render: (approval: any) => new Date(approval.submittedAt).toLocaleDateString(),
    },
    {
      key: 'comments',
      header: 'Comments',
      render: (approval: any) => (
        <span className="text-sm text-[#828282]">{approval.comments.length} comments</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (approval: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/approvals/${approval.id}`);
          }}
          className="p-2 hover:bg-[#5B7EFF]/10 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 text-[#5B7EFF]" />
        </button>
      ),
    },
  ];

  const selectedRequestData = changeRequests.find(r => r.id === selectedRequest);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#4F4F4F]">Approvals & Change Requests</h1>
        <p className="text-[#828282] mt-1">Review timetable submissions and lecturer change requests</p>
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
                <p className="text-2xl font-semibold text-[#EB5757] mt-1">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#EB5757] to-[#E63946] rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'approvals'
              ? 'border-[#5B7EFF] text-[#5B7EFF]'
              : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
          }`}
        >
          Timetable Approvals
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'requests'
              ? 'border-[#5B7EFF] text-[#5B7EFF]'
              : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
          }`}
        >
          Change Requests
          {stats.pending > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-[#F2C94C] text-white text-xs rounded-full">
              {stats.pending}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#4F4F4F]">
              {activeTab === 'approvals' ? 'All Approvals' : 'All Change Requests'}
            </h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              {activeTab === 'approvals' && (
                <>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="published">Published</option>
                </>
              )}
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {activeTab === 'approvals' ? (
            <DataTable
              data={filteredApprovals}
              columns={approvalColumns}
              onRowClick={(approval) => navigate(`/approvals/${approval.id}`)}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-[#828282]">
                  No change requests found
                </div>
              ) : (
                filteredRequests.map((request) => {
                  // Merge original session with requested changes to get proposed session
                  const proposedSession = { ...request.originalSession, ...request.requestedChanges };
                  
                  // Helper function to safely get session property
                  const getSessionDay = (session: any) => session?.day || 'N/A';
                  const getSessionTime = (session: any) => session?.startTime || 'N/A';
                  const getSessionVenue = (session: any) => session?.venueName || 'N/A';
                  const getSessionCourse = (session: any) => session?.courseName || 'N/A';
                  
                  return (
                    <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[#4F4F4F]">
                              Change Request #{request.id.slice(0, 8)}
                            </h3>
                            <StatusBadge status={request.status} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2 text-sm text-[#828282]">
                              <User className="w-4 h-4" />
                              <span>{request.lecturerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#828282]">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 mb-3">
                            <p className="text-sm font-semibold text-[#4F4F4F] mb-2">Reason:</p>
                            <p className="text-sm text-[#828282]">{request.justification}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-red-700 mb-1">Current Session</p>
                              <p className="text-sm text-[#4F4F4F]">{getSessionCourse(request.originalSession)}</p>
                              <div className="flex items-center gap-2 text-xs text-[#828282] mt-1">
                                <span>{getSessionDay(request.originalSession)} {getSessionTime(request.originalSession)}</span>
                                <span>•</span>
                                <span>{getSessionVenue(request.originalSession)}</span>
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-green-700 mb-1">Proposed Session</p>
                              <p className="text-sm text-[#4F4F4F]">{getSessionCourse(proposedSession)}</p>
                              <div className="flex items-center gap-2 text-xs text-[#828282] mt-1">
                                <span>{getSessionDay(proposedSession)} {getSessionTime(proposedSession)}</span>
                                <span>•</span>
                                <span>{getSessionVenue(proposedSession)}</span>
                              </div>
                            </div>
                          </div>

                          {request.solverResult !== 'no_conflict' && (
                            <div className={`mt-3 p-3 rounded-lg ${
                              request.solverResult === 'hard_conflict' 
                                ? 'bg-red-50 border border-red-200' 
                                : 'bg-orange-50 border border-orange-200'
                            }`}>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`w-4 h-4 ${
                                  request.solverResult === 'hard_conflict' ? 'text-red-600' : 'text-orange-600'
                                }`} />
                                <span className={`text-sm font-semibold ${
                                  request.solverResult === 'hard_conflict' ? 'text-red-700' : 'text-orange-700'
                                }`}>
                                  {request.solverResult === 'hard_conflict' ? 'Hard Conflict Detected' : 'Soft Conflict Detected'}
                                </span>
                              </div>
                              {request.conflictDetails && request.conflictDetails.length > 0 && (
                                <ul className="text-xs text-[#828282] mt-2 space-y-1">
                                  {request.conflictDetails.map((detail, idx) => (
                                    <li key={idx}>• {detail}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {request.adminNotes && (
                            <div className="mt-3 bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-700 mb-1">Admin Notes</p>
                              <p className="text-sm text-[#4F4F4F]">{request.adminNotes}</p>
                            </div>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            {selectedRequest === request.id ? (
                              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg w-64">
                                <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                                  Admin Notes:
                                </label>
                                <textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] text-sm"
                                  rows={3}
                                  placeholder="Add notes (required for rejection)"
                                />
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleApprove(request.id)}
                                    icon={<CheckCircle className="w-4 h-4" />}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleReject(request.id)}
                                    icon={<XCircle className="w-4 h-4" />}
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRequest(null);
                                      setAdminNotes('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSelectedRequest(request.id)}
                              >
                                Review
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ApprovalsAndRequests;
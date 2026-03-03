import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApprovals } from '../../context/ApprovalContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { ArrowLeft, MessageSquare, History } from 'lucide-react';

const ApprovalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getApproval, updateApprovalStatus, addComment } = useApprovals();
  const [newComment, setNewComment] = useState('');

  const approval = id ? getApproval(id) : null;

  if (!approval) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Approval not found</h3>
        <button
          onClick={() => navigate('/approvals')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to approvals
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: any) => {
    if (user && confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      updateApprovalStatus(approval.id, newStatus, user.id, user.name);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      addComment(approval.id, {
        userId: user.id,
        userName: user.name,
        message: newComment,
      });
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/approvals')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{approval.timetableName}</h1>
          <p className="text-gray-600 mt-1">
            {approval.type === 'teaching' ? 'Teaching' : 'Exam'} Timetable Approval
          </p>
        </div>
        <StatusBadge status={approval.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Approval Details</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Submitted By</p>
                <p className="font-medium text-gray-900">{approval.submittedBy}</p>
                <p className="text-sm text-gray-500">
                  {new Date(approval.submittedAt).toLocaleString()}
                </p>
              </div>

              {approval.reviewedBy && (
                <div>
                  <p className="text-sm text-gray-600">Reviewed By</p>
                  <p className="font-medium text-gray-900">{approval.reviewedBy}</p>
                  <p className="text-sm text-gray-500">
                    {approval.reviewedAt && new Date(approval.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {approval.approvedBy && (
                <div>
                  <p className="text-sm text-gray-600">Approved By</p>
                  <p className="font-medium text-gray-900">{approval.approvedBy}</p>
                  <p className="text-sm text-gray-500">
                    {approval.approvedAt && new Date(approval.approvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {approval.status === 'submitted' && (
                  <>
                    <Button onClick={() => handleStatusChange('reviewed')}>
                      Mark as Reviewed
                    </Button>
                    <Button variant="danger" onClick={() => handleStatusChange('rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {approval.status === 'reviewed' && (
                  <>
                    <Button variant="success" onClick={() => handleStatusChange('approved')}>
                      Approve
                    </Button>
                    <Button variant="danger" onClick={() => handleStatusChange('rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {approval.status === 'approved' && (
                  <Button onClick={() => handleStatusChange('published')}>
                    Publish Timetable
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {approval.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm text-gray-900">{comment.userName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700">{comment.message}</p>
                  </div>
                ))}
                {approval.comments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                )}
              </div>

              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add a comment..."
                />
                <Button onClick={handleAddComment} size="sm" className="mt-2 w-full">
                  Add Comment
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {approval.auditLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-600">by {log.userName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetail;
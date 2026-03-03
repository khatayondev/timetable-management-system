import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApprovals } from '../../context/ApprovalContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { Eye } from 'lucide-react';

const ApprovalList = () => {
  const navigate = useNavigate();
  const { approvals } = useApprovals();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredApprovals = approvals.filter(approval => 
    filterStatus === 'all' || approval.status === filterStatus
  );

  const columns = [
    {
      key: 'timetableName',
      header: 'Timetable',
      render: (approval: any) => (
        <div>
          <p className="font-medium text-gray-900">{approval.timetableName}</p>
          <p className="text-xs text-gray-500">
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
        <span className="text-sm text-gray-600">{approval.comments.length} comments</span>
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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 text-blue-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timetable Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve timetable submissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Approvals</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            data={filteredApprovals}
            columns={columns}
            onRowClick={(approval) => navigate(`/approvals/${approval.id}`)}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default ApprovalList;
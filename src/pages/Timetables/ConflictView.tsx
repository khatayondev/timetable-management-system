import React from 'react';
import { useTimetables } from '../../context/TimetableContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ConflictView = () => {
  const { conflicts } = useTimetables();

  const highSeverity = conflicts.filter(c => c.severity === 'high');
  const mediumSeverity = conflicts.filter(c => c.severity === 'medium');
  const lowSeverity = conflicts.filter(c => c.severity === 'low');

  const ConflictCard = ({ conflict }: { conflict: any }) => {
    const severityColors = {
      high: 'border-red-500 bg-red-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-blue-500 bg-blue-50',
    };

    const severityTextColors = {
      high: 'text-red-700',
      medium: 'text-yellow-700',
      low: 'text-blue-700',
    };

    const severityBadgeColors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
    };

    return (
      <div className={`p-4 border-l-4 rounded-lg ${severityColors[conflict.severity]}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${severityTextColors[conflict.severity]}`} />
              <h3 className={`font-semibold ${severityTextColors[conflict.severity]}`}>
                {conflict.type.charAt(0).toUpperCase() + conflict.type.slice(1)} Conflict
              </h3>
            </div>
            <p className="text-gray-900 mt-2">{conflict.message}</p>
            <p className="text-sm text-gray-600 mt-1">
              Affected entries: {conflict.affectedEntries.length}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityBadgeColors[conflict.severity]}`}>
            {conflict.severity.charAt(0).toUpperCase() + conflict.severity.slice(1)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Timetable Conflicts</h1>
        <p className="text-gray-600 mt-1">Review and resolve scheduling conflicts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-red-500">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{highSeverity.length}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-600">Medium Severity</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{mediumSeverity.length}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-600">Low Severity</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{lowSeverity.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {conflicts.length > 0 ? (
        <>
          {highSeverity.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">High Severity Conflicts</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {highSeverity.map(conflict => (
                    <ConflictCard key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {mediumSeverity.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Medium Severity Conflicts</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {mediumSeverity.map(conflict => (
                    <ConflictCard key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {lowSeverity.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Low Severity Conflicts</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {lowSeverity.map(conflict => (
                    <ConflictCard key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts Found</h3>
            <p className="text-gray-600">All timetables are conflict-free!</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ConflictView;

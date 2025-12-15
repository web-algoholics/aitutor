import React from 'react';
import { Card, Progress, Empty } from 'antd';

interface StatsProps {
  totalLanguages?: number;
  inProgressLanguages?: number;
  completedLanguages?: number;
  totalHours?: number;
  averageProgress?: number;
  enrolledLanguages?: Array<{ id: number; progress?: number; hours?: number; [key: string]: any }>;
}

export default function Stats({
  totalLanguages = 0,
  inProgressLanguages = 0,
  completedLanguages = 0,
  totalHours = 0,
  averageProgress = 0,
  enrolledLanguages = [],
}: StatsProps) {
  const hasData = enrolledLanguages.length > 0;

  if (!hasData) {
    return (
      <Empty
        description="No learning statistics available yet"
        style={{ padding: '40px 0' }}
      />
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalLanguages}</p>
          </div>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">In Progress</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{inProgressLanguages}</p>
          </div>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Completed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{completedLanguages}</p>
          </div>
        </Card>

        <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Hours Learned</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalHours}h</p>
          </div>
        </Card>
      </div>

      {/* Overall Progress */}
      {enrolledLanguages.length > 0 && (
        <Card className="border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <p className="text-sm text-gray-600 mt-1">Average completion across all courses</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{averageProgress}%</p>
            </div>
          </div>
          <Progress percent={averageProgress} strokeColor="#1890ff" className="mt-4" />
        </Card>
      )}
    </>
  );
}

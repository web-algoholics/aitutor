import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface StatsCardProps {
  title: string | React.ReactNode;
  subtitle: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  subtitle,
  className = ''
}) => {
  return (
    <Card
      className={`text-center ${className}`}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Title level={3} className="mb-2">
        {title}
      </Title>
      <Text type="secondary">
        {subtitle}
      </Text>
    </Card>
  );
};

export default StatsCard;

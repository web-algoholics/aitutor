import React from 'react';
import { Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

interface SectionHeaderProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
}

export default function SectionHeader({
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick
}: SectionHeaderProps) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '60px 0 24px 0' }}>
      <div style={{
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <Title level={2} style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
          {title}
        </Title>
      </div>
      <Paragraph className="text-base text-gray-600 mb-4" style={{ textAlign: 'center' }}>
        {description}
      </Paragraph>
      {buttonText && onButtonClick && (
        <Button
          type="primary"
          size="large"
          icon={buttonIcon}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}

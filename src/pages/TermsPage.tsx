import React from 'react';
import { Card } from 'antd';
import termsImage from '../pics/terms.jpg';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <Card>
        <img 
          src={termsImage} 
          alt="Условия использования" 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Card>
    </div>
  );
}

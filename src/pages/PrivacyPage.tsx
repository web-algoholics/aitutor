import React from 'react';
import { Card } from 'antd';
import privacyImage from '../pics/privacy.jpg';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <Card>
        <img 
          src={privacyImage} 
          alt="Политика конфиденциальности" 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Card>
    </div>
  );
}

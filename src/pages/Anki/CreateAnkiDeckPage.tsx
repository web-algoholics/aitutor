import React from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useCreateDeckFromMaterialMutation } from '../../services/ankiApi';
import PageContainer from '../../components/PageContainer';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const CreateAnkiDeckPage: React.FC = () => {
  const navigate = useNavigate();
  const [createDeckFromMaterial, { isLoading }] = useCreateDeckFromMaterialMutation();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { description?: string; material_content: string }) => {
    try {
      const result = await createDeckFromMaterial({
        title: 'Новая колода',
        ...values,
      }).unwrap();

      message.success('Колода успешно создана!');
      navigate(`/anki/decks/${result.id}/practice`);
    } catch (error: any) {
      // Фильтруем англоязычные и технические ошибки
      const detail = error?.data?.detail;
      const isTechnical =
        !detail ||
        typeof detail !== 'string' ||
        /internal server error|failed to fetch|network|500|failed to load|json parsing|validation error|must have|invalid|error/i.test(detail);
      if (isTechnical) {
        if (detail) {
          // eslint-disable-next-line no-console
          console.error('Anki deck creation error (developer debug):', detail);
        } else {
          // eslint-disable-next-line no-console
          console.error('Anki deck creation technical error:', error);
        }
        message.error('Ошибка при создании колоды. Проверьте заполнение и повторите, или попробуйте позже.');
      } else {
        message.error(detail);
      }
    }
  };

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/anki')}>
            К списку колод
          </Button>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              Создать колоду
            </Title>
          </div>
          <Paragraph style={{ fontSize: '16px', color: '#666', textAlign: 'center' }}>
            ИИ создаст карточки для запоминания на основе вашего материала
          </Paragraph>
        </div>

        <Card bordered={true}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Описание (необязательно)"
              name="description"
            >
              <Input
                placeholder="Краткое описание колоды"
                size="large"
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <Form.Item
              label="Материал"
              name="material_content"
              rules={[
                { required: true, message: 'Введите материал' },
                { min: 100, message: 'Материал должен содержать минимум 100 символов' }
              ]}
              extra="Вставьте текст лекций, статей, конспектов или других материалов для создания карточек"
            >
              <TextArea
                rows={10}
                placeholder="Вставьте текст материала здесь..."
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                disabled={isLoading}
                block
              >
                {isLoading ? 'Создаю колоду...' : 'Создать колоду'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default CreateAnkiDeckPage;




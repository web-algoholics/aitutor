import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Tag, Empty, Modal, Form, Input, message, Popconfirm } from 'antd';
import { FileTextOutlined, PlusOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import { useGetDecksQuery, useCreateDeckFromMaterialMutation, useDeleteDeckMutation } from '../services/ankiApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function AnkiDecksListPage() {
  const navigate = useNavigate();
  const { data: decks, isLoading } = useGetDecksQuery();
  const [createDeckFromMaterial, { isLoading: isCreating }] = useCreateDeckFromMaterialMutation();
  const [deleteDeck] = useDeleteDeckMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreateFromMaterial = async (values: { title: string; description?: string; material_content: string }) => {
    try {
      const result = await createDeckFromMaterial(values).unwrap();
      message.success('Колода успешно создана!');
      setIsModalVisible(false);
      form.resetFields();
      navigate(`/anki/decks/${result.id}/practice`);
    } catch (error: any) {
      message.error(error?.data?.detail || 'Ошибка при создании колоды');
    }
  };

  const handleDeleteDeck = async (deckId: number) => {
    try {
      await deleteDeck(deckId).unwrap();
      message.success('Колода удалена');
    } catch (error: any) {
      message.error(error?.data?.detail || 'Ошибка при удалении колоды');
    }
  };

  const handlePracticeClick = (deckId: number) => {
    navigate(`/anki/decks/${deckId}/practice`);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-5">
        <Card loading />
      </div>
    );
  }

  const totalDecks = decks?.length || 0;
  const totalCards = decks?.reduce((sum, deck) => sum + deck.cards_count, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto p-5">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <Title level={2}>Колоды Anki</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalVisible(true)}
          >
            Создать колоду из материала
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Card className="text-center h-full">
              <Title level={3} className="mb-2">{totalDecks}</Title>
              <Text type="secondary">Всего колод</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="text-center h-full">
              <Title level={3} className="mb-2">{totalCards}</Title>
              <Text type="secondary">Всего карточек</Text>
            </Card>
          </Col>
        </Row>

        {/* Decks List */}
        {decks && decks.length > 0 ? (
          <Row gutter={[16, 16]} style={{ display: 'flex' }}>
            {decks.map((deck) => (
              <Col xs={24} sm={12} md={8} key={deck.id} style={{ display: 'flex' }}>
                <Card
                  hoverable
                  className="w-full shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                  bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}
                  actions={[
                    <div key="practice" className="text-center py-2">
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handlePracticeClick(deck.id)}
                      >
                        Упражняться
                      </Button>
                    </div>,
                  ]}
                >
                  <div className="flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <FileTextOutlined className="text-2xl text-blue-500 mr-2 flex-shrink-0" />
                      <Tag color={deck.source_type === 'course' ? 'blue' : 'green'}>
                        {deck.source_type === 'course' ? 'Курс' : 'Материал'}
                      </Tag>
                    </div>
                    <Title level={4} className="mb-2">{deck.title}</Title>
                    {deck.description && (
                      <Text type="secondary" className="block mb-3">
                        {deck.description}
                      </Text>
                    )}
                    <div className="mt-auto">
                      <Space direction="vertical" size="small" className="w-full">
                        <Text type="secondary" className="block">
                          Карточек: <strong>{deck.cards_count}</strong>
                        </Text>
                        <Text type="secondary" className="block text-xs">
                          Создано: {formatDate(deck.created_at)}
                        </Text>
                        <Popconfirm
                          title="Удалить колоду?"
                          description="Это действие нельзя отменить"
                          onConfirm={() => handleDeleteDeck(deck.id)}
                          okText="Да"
                          cancelText="Нет"
                        >
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="w-full"
                          >
                            Удалить
                          </Button>
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <Empty
              description="У вас пока нет колод"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Создать первую колоду
              </Button>
            </Empty>
          </Card>
        )}
      </Space>

      {/* Create Deck from Material Modal */}
      <Modal
        title="Создать колоду из материала"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateFromMaterial}
        >
          <Form.Item
            name="title"
            label="Название колоды"
            rules={[{ required: true, message: 'Введите название колоды' }]}
          >
            <Input placeholder="Например: Конспект лекций по Python" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание (необязательно)"
          >
            <Input placeholder="Краткое описание колоды" />
          </Form.Item>

          <Form.Item
            name="material_content"
            label="Материал"
            rules={[
              { required: true, message: 'Введите материал' },
              { min: 100, message: 'Материал должен содержать минимум 100 символов' }
            ]}
            extra="Вставьте текст лекций, статей, конспектов или других материалов для создания карточек"
          >
            <TextArea
              rows={10}
              placeholder="Вставьте текст материала здесь..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Создать колоду
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


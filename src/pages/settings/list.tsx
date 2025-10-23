import React, { useState } from "react";
import { Card, Button, Table, Space, Spin, Alert, Popconfirm, Modal, Form, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import { useGetSettingsQuery } from "../../modules/settings/hooks/queries/use-get-settings.query";
import { useDeleteSettingsMutation } from "../../modules/settings/hooks/mutations/use-delete-settings.mutation";
import { SettingsKey } from "../../modules/settings/apis/settingsApi";
import { ConfigurationData } from "../../modules/settings/types/configuration";
import { toast } from "react-toastify";

export default function SettingsListPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Fetch settings data from API
  const { data: configKeys = [], isLoading, error, refetch } = useGetSettingsQuery();

  // Mutations
  const deleteSettingsMutation = useDeleteSettingsMutation();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleAddKey = () => {
    // Mở modal để nhập key và name
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreateModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Chuyển hướng đến trang tạo mới với key và name đã nhập
      navigate(`/settings/${values.key}?mode=create&name=${encodeURIComponent(values.name)}`);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleEditKey = (key: SettingsKey) => {
    // Chuyển hướng đến trang chỉnh sửa
    navigate(`/settings/${key.key}?mode=edit`);
  };

  const handleDeleteKey = async (key: SettingsKey) => {
    try {
      await deleteSettingsMutation.mutateAsync(key.key);
      toast.success("Đã xóa cấu hình");
      refetch();
    } catch {
      toast.error("Có lỗi xảy ra khi xóa cấu hình");
    }
  };

  // Không cần modal submit nữa vì chuyển hướng

  const handleConfigure = (key: SettingsKey) => {
    navigate(`/settings/${key.key}`);
  };

  const columns: ColumnsType<SettingsKey> = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: "25%",
      render: (key: string) => <code className="bg-gray-100 px-2 py-1 rounded text-sm">{key}</code>,
    },
    {
      title: "Tên cấu hình",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "value_jsonb",
      key: "description",
      width: "35%",
      render: (value_jsonb: ConfigurationData) => (
        <span className="text-gray-600">
          {value_jsonb?.parents?.length > 0
            ? `${value_jsonb.parents.length} cha, ${value_jsonb.parents.reduce(
                (acc, p) => acc + p.topics.length,
                0,
              )} chủ đề`
            : "Chưa có cấu hình"}
        </span>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: "15%",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleConfigure(record)}
          >
            Cấu hình
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditKey(record)} />
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa cấu hình "${record.name}"?`}
            onConfirm={() => handleDeleteKey(record)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <div className="h-64 flex items-center justify-center">
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <Alert
            message="Có lỗi xảy ra"
            description="Không thể tải danh sách cấu hình. Vui lòng thử lại."
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => refetch()}>
                Thử lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-xl" />
            <span className="text-xl font-semibold">Quản lý cấu hình hệ thống</span>
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddKey}>
            Thêm cấu hình
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={configKeys}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Tạo cấu hình mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreateModalSubmit}
        okText="Tiếp tục"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="key"
            label="Key"
            rules={[
              { required: true, message: "Vui lòng nhập key" },
              { pattern: /^[a-z_]+$/, message: "Key chỉ được chứa chữ thường và dấu gạch dưới" },
            ]}
          >
            <Input placeholder="Ví dụ: research_hierarchy" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên cấu hình"
            rules={[{ required: true, message: "Vui lòng nhập tên cấu hình" }]}
          >
            <Input placeholder="Ví dụ: Phân cấp nghiên cứu" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

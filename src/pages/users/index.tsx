import { Alert, Form, Input, Modal, Select, Space, Spin, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CrudTable from "../../shares/components/CrudTable.tsx";
import { FilterField } from "../../shares/components/AdvancedFilter.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../../modules/users/types/user.ts";
import { useListUsersQuery } from "../../modules/users/hooks/queries/use-get-users.query.ts";
import { useDeleteUserMutation } from "../../modules/users/hooks/mutations/use-delete-user.mutation.ts";
import { toast } from "react-toastify";
import { QueryKeyEnum } from "../../shares/enums/queryKey.ts";
import { Role, RoleLabel } from "../../modules/users/enums/role.ts";
import { useCreateUserMutation } from "../../modules/users/hooks/mutations/use-create-user.mutation.ts";
import { useUpdateUserMutation } from "../../modules/users/hooks/mutations/use-update-user.mutation.ts";
import z from "zod";

const { Option } = Select;

export default function UserPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filterParams, setFilterParams] = useState<Record<string, string | number>>({});

  const { data, isLoading, isError } = useListUsersQuery({ filters: filterParams });

  const roleColors: Record<Role, string> = {
    [Role.User]: "green",
    [Role.Admin]: "red",
  };

  // ---- Mutation: Delete
  const deleteUser = useDeleteUserMutation({
    onSuccess: () => {
      toast.success(t("user.messages.delete_success"));
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.User] });
    },
    onError: () => {
      toast.error(t("user.messages.delete_error"));
    },
  });

  // ---- Mutation: Create ----
  const createUser = useCreateUserMutation({
    onSuccess: () => {
      toast.success(t("user.messages.create_success"));
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.User] });
    },
    onError: () => {
      toast.error(t("user.messages.create_error"));
    },
  });

  // ---- Mutation: Update ----
  const updateUser = useUpdateUserMutation({
    onSuccess: () => {
      toast.success(t("user.messages.update_success"));
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.User] });
    },
    onError: () => {
      toast.error(t("user.messages.update_error"));
    },
  });

  useEffect(() => {
    if (data?.data) {
      setUsers(data.data);
    }
  }, [data]);

  // Filter fields cho User
  const userFilterFields: FilterField[] = [
    {
      name: "search",
      label: "Tìm kiếm",
      type: "text",
      placeholder: "Tìm theo username",
      width: "100%",
    },
    {
      name: "role",
      label: "Vai trò",
      type: "select",
      width: "100%",
      options: [
        { label: "Quản trị viên", value: Role.Admin },
        { label: "Người dùng", value: Role.User },
      ],
    },
  ];

  const handleFilter = (filterValues: Record<string, string | number>) => {
    // Gửi filter params lên API
    setFilterParams(filterValues);
  };

  const handleResetFilter = () => {
    // Reset filter params
    setFilterParams({});
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      roles: user.roles,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Tạo submitData và loại bỏ confirmPassword
      const submitData = {
        username: values.username,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
        roles: values.roles,
        ...(values.password && { password: values.password }),
      };

      if (editingUser) {
        updateUser.mutate({ id: editingUser.id, body: submitData });
      } else {
        createUser.mutate(submitData);
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      if (err instanceof z.ZodError) {
        form.setFields(
          err.issues.map((e) => ({
            name: e.path.join("."),
            errors: [e.message],
          })),
        );
      }
    }
  };

  const handleDelete = (user: User) => {
    deleteUser.mutate(user.id);
  };

  // ---- Columns ----
  const columns: ColumnsType<User> = [
    { title: "ID", dataIndex: "id", key: "id", width: "10%" },
    { title: "Tài khoản", dataIndex: "username", key: "username", width: "15%" },
    { title: "Tên người dùng", dataIndex: "fullName", key: "fullName", width: "15%" },
    { title: "Email", dataIndex: "email", key: "email", width: "15%" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone", width: "15%" },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      width: "10%",
      render: (roles: string) => (
        <Space>
          <Tag key={roles} color={roleColors[roles as Role] || "blue"}>
            {roles}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "time",
      width: "20%",
    },
  ];

  return (
    <>
      {isError && (
        <Alert
          message="Error"
          description={t("user.messages.load_error")}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Spin spinning={isLoading}>
        <CrudTable
          title={t("user.title")}
          subtitle={t("user.subtitle")}
          rowKey="id"
          columns={columns}
          dataSource={users}
          addButtonText={t("user.addButtonText")}
          onAdd={handleAddUser}
          onEdit={handleEditUser}
          onDelete={handleDelete}
          useAdvancedFilter={true}
          filterFields={userFilterFields}
          onFilter={handleFilter}
          onResetFilter={handleResetFilter}
        />
      </Spin>

      <Modal
        title={editingUser ? t("user.modal.editTitle") : t("user.modal.addTitle")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label={t("user.form.fullName")}
            rules={[
              { required: true, message: t("user.form.fullName_required") },
              { min: 2, message: t("user.form.fullName_min") },
            ]}
          >
            <Input placeholder={t("user.form.fullName_placeholder")} />
          </Form.Item>

          <Form.Item
            name="username"
            label={t("user.form.username")}
            rules={[
              { required: true, message: t("user.form.username_required") },
              { min: 3, message: t("user.form.username_min") },
            ]}
          >
            <Input placeholder={t("user.form.username_placeholder")} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("user.form.email")}
            rules={[
              { required: true, message: t("user.form.email_required") },
              { type: "email", message: t("user.form.email_invalid") },
            ]}
          >
            <Input placeholder={t("user.form.email_placeholder")} />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t("user.form.phone")}
            rules={[
              { required: true, message: t("user.form.phone_required") },
              {
                pattern: /^[0-9]{10,11}$/,
                message: t("user.form.phone_pattern"),
              },
            ]}
          >
            <Input placeholder={t("user.form.phone_placeholder")} />
          </Form.Item>

          <Form.Item
            name="roles"
            label={t("user.form.role")}
            rules={[{ required: true, message: t("user.form.role_required") }]}
          >
            <Select placeholder={t("user.form.role_placeholder")}>
              {Object.values(Role).map((role) => (
                <Option key={role} value={role}>
                  {RoleLabel[role as Role]}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label={t("user.form.password")}
            rules={[
              { required: !editingUser, message: t("user.form.password_required") },
              { min: 6, message: t("user.form.password_min") },
            ]}
            hasFeedback
          >
            <Input.Password placeholder={t("user.form.password_placeholder")} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t("user.form.confirmPassword")}
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: !editingUser, message: t("user.form.confirmPassword_required") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("user.form.confirmPassword_mismatch")));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t("user.form.confirmPassword_placeholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

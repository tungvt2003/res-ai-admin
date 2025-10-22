import { Alert, Form, Input, Modal, Spin, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import CrudTable from "../../shares/components/CrudTable.tsx";
import { FilterField } from "../../shares/components/AdvancedFilter.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Category } from "../../modules/categories/types/category.ts";
import { useListCategoriesQuery } from "../../modules/categories/hooks/queries/use-get-categories.query.ts";
import { useDeleteCategoryMutation } from "../../modules/categories/hooks/mutations/use-delete-category.mutation.ts";
import { toast } from "react-toastify";
import { QueryKeyEnum } from "../../shares/enums/queryKey.ts";
import { useCreateCategoryMutation } from "../../modules/categories/hooks/mutations/use-create-category.mutation.ts";
import { useUpdateCategoryMutation } from "../../modules/categories/hooks/mutations/use-update-category.mutation.ts";
import z from "zod";

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterParams, setFilterParams] = useState<Record<string, string | number>>({});

  const { data, isLoading, isError } = useListCategoriesQuery({ filters: filterParams });

  // ---- Mutation: Delete ----
  const deleteCategory = useDeleteCategoryMutation({
    onSuccess: () => {
      toast.success("Xóa danh mục thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Category] });
    },
    onError: () => {
      toast.error("Xóa danh mục thất bại");
    },
  });

  // ---- Mutation: Create ----
  const createCategory = useCreateCategoryMutation({
    onSuccess: () => {
      toast.success("Tạo danh mục thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Category] });
    },
    onError: () => {
      toast.error("Tạo danh mục thất bại");
    },
  });

  // ---- Mutation: Update ----
  const updateCategory = useUpdateCategoryMutation({
    onSuccess: () => {
      toast.success("Cập nhật danh mục thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Category] });
    },
    onError: () => {
      toast.error("Cập nhật danh mục thất bại");
    },
  });

  useEffect(() => {
    if (data?.data) {
      setCategories(data.data);
    }
  }, [data]);

  // Filter fields cho Category
  const categoryFilterFields: FilterField[] = [
    {
      name: "search",
      label: "Tìm kiếm",
      type: "text",
      placeholder: "Tìm theo tên danh mục",
      width: "100%",
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      placeholder: "Tìm theo slug",
      width: "100%",
    },
  ];

  const handleFilter = (filterValues: Record<string, string | number>) => {
    setFilterParams(filterValues);
  };

  const handleResetFilter = () => {
    setFilterParams({});
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      slug: category.slug,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = {
        name: values.name,
        description: values.description,
        slug: values.slug,
      };

      if (editingCategory) {
        updateCategory.mutate({ id: editingCategory.id, ...submitData });
      } else {
        createCategory.mutate(submitData);
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

  const handleDelete = (category: Category) => {
    deleteCategory.mutate(category.id);
  };

  // ---- Columns ----
  const columns: ColumnsType<Category> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: "20%",
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "15%",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Hoạt động" : "Ngừng"}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <>
      {isError && (
        <Alert
          message="Lỗi"
          description="Không thể tải danh sách danh mục"
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Spin spinning={isLoading}>
        <CrudTable
          title="Quản lý danh mục bài viết"
          subtitle="Danh sách tất cả danh mục bài viết trong hệ thống"
          rowKey="id"
          columns={columns}
          dataSource={categories}
          addButtonText="Thêm danh mục"
          onAdd={handleAddCategory}
          onEdit={handleEditCategory}
          onDelete={handleDelete}
          useAdvancedFilter={true}
          filterFields={categoryFilterFields}
          onFilter={handleFilter}
          onResetFilter={handleResetFilter}
        />
      </Spin>

      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onOk={handleSubmit}
        destroyOnClose
        width={600}
        okText={editingCategory ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { min: 1, message: "Tên phải có ít nhất 1 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Công nghệ" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
              { min: 1, message: "Mô tả phải có ít nhất 1 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Các bài viết về công nghệ, lập trình, AI"
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: "Vui lòng nhập slug" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Slug chỉ chứa chữ thường, số và dấu gạch ngang",
              },
            ]}
          >
            <Input placeholder="Ví dụ: cong-nghe" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

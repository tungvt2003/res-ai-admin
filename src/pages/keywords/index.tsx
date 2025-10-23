import { Alert, Form, Input, Modal, Spin, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import CrudTable from "../../shares/components/CrudTable.tsx";
import { FilterField } from "../../shares/components/AdvancedFilter.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Keyword } from "../../modules/keywords/types/keyword.ts";
import { useListKeywordsQuery } from "../../modules/keywords/hooks/queries/use-get-keywords.query.ts";
import { useDeleteKeywordMutation } from "../../modules/keywords/hooks/mutations/use-delete-keyword.mutation.ts";
import { toast } from "react-toastify";
import { QueryKeyEnum } from "../../shares/enums/queryKey.ts";
import { useCreateKeywordMutation } from "../../modules/keywords/hooks/mutations/use-create-keyword.mutation.ts";
import { useUpdateKeywordMutation } from "../../modules/keywords/hooks/mutations/use-update-keyword.mutation.ts";
import z from "zod";

export default function KeywordPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [filterParams, setFilterParams] = useState<Record<string, string | number>>({});

  const { data, isLoading, isError } = useListKeywordsQuery({ filters: filterParams });

  // ---- Mutation: Delete ----
  const deleteKeyword = useDeleteKeywordMutation({
    onSuccess: () => {
      toast.success("Xóa từ khóa thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Keyword] });
    },
    onError: () => {
      toast.error("Xóa từ khóa thất bại");
    },
  });

  // ---- Mutation: Create ----
  const createKeyword = useCreateKeywordMutation({
    onSuccess: () => {
      toast.success("Tạo từ khóa thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Keyword] });
    },
    onError: () => {
      toast.error("Tạo từ khóa thất bại");
    },
  });

  // ---- Mutation: Update ----
  const updateKeyword = useUpdateKeywordMutation({
    onSuccess: () => {
      toast.success("Cập nhật từ khóa thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Keyword] });
    },
    onError: () => {
      toast.error("Cập nhật từ khóa thất bại");
    },
  });

  useEffect(() => {
    if (data?.data) {
      setKeywords(data.data);
    }
  }, [data]);

  // Filter fields cho Keyword
  const keywordFilterFields: FilterField[] = [
    {
      name: "name",
      label: "Tìm kiếm",
      type: "text",
      placeholder: "Tìm theo tên từ khóa",
      width: "100%",
    },
  ];

  const handleFilter = (filterValues: Record<string, string | number>) => {
    setFilterParams(filterValues);
  };

  const handleResetFilter = () => {
    setFilterParams({});
  };

  const handleAddKeyword = () => {
    setEditingKeyword(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditKeyword = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    form.setFieldsValue({
      name: keyword.name,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = {
        name: values.name,
      };

      if (editingKeyword) {
        updateKeyword.mutate({ id: editingKeyword.id, ...submitData });
      } else {
        createKeyword.mutate(submitData);
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

  const handleDelete = (keyword: Keyword) => {
    deleteKeyword.mutate(keyword.id);
  };

  // ---- Columns ----
  const columns: ColumnsType<Keyword> = [
    {
      title: "Tên từ khóa",
      dataIndex: "name",
      key: "name",
      width: "60%",
      render: (text: string) => (
        <Tag color="purple" className="text-sm px-3 py-1">
          {text}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "20%",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: "20%",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <>
      {isError && (
        <Alert
          message="Lỗi"
          description="Không thể tải danh sách từ khóa"
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Spin spinning={isLoading}>
        <CrudTable
          title="Quản lý từ khóa"
          subtitle="Danh sách tất cả từ khóa trong hệ thống"
          rowKey="id"
          columns={columns}
          dataSource={keywords}
          addButtonText="Thêm từ khóa"
          onAdd={handleAddKeyword}
          onEdit={handleEditKeyword}
          onDelete={handleDelete}
          useAdvancedFilter={true}
          filterFields={keywordFilterFields}
          onFilter={handleFilter}
          onResetFilter={handleResetFilter}
        />
      </Spin>

      <Modal
        title={editingKeyword ? "Chỉnh sửa từ khóa" : "Thêm từ khóa mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onOk={handleSubmit}
        destroyOnClose
        width={500}
        okText={editingKeyword ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên từ khóa"
            rules={[
              { required: true, message: "Vui lòng nhập tên từ khóa" },
              { min: 1, message: "Tên phải có ít nhất 1 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Kỹ năng tư duy sáng tạo" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

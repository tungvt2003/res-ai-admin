import { Button, Card, Form, Input, Select, Upload } from "antd";
import { UploadOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QueryKeyEnum } from "../../shares/enums/queryKey.ts";
import { useCreateBlogMutation } from "../../modules/blogs/hooks/mutations/use-create-blog.mutation.ts";
import { useListCategoriesQuery } from "../../modules/categories/hooks/queries/use-get-categories.query.ts";
import { Paths } from "../../constants/path-routers.ts";
import JoditEditor from "../../shares/components/JoditEditor.tsx";

const { TextArea } = Input;

export default function CreateBlogPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { data: categoriesData } = useListCategoriesQuery();

  // ---- Mutation: Create ----
  const createBlog = useCreateBlogMutation({
    onSuccess: () => {
      toast.success("Tạo bài viết thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Blog] });
      navigate(Paths.BLOGS.DETAIL.PATH);
    },
    onError: () => {
      toast.error("Tạo bài viết thất bại");
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      createBlog.mutate({
        title: values.title,
        description: values.description,
        contents: values.content || "", // Backend expects "contents" not "content"
        categoryId: values.categoryId,
        image: fileList.length > 0 ? fileList : undefined,
      } as any); // Temporary fix for TypeScript cache issue
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    navigate(Paths.BLOGS.DETAIL.PATH);
  };

  return (
    <div>
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold">Tạo bài viết mới</span>
            <div className="flex gap-2">
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={createBlog.isPending}
              >
                Lưu bài viết
              </Button>
            </div>
          </div>
        }
        className="shadow-sm"
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Form.Item
                name="title"
                label={<span className="text-base font-semibold">Tiêu đề bài viết</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề" },
                  { min: 1, message: "Tiêu đề phải có ít nhất 1 ký tự" },
                ]}
              >
                <Input placeholder="Nhập tiêu đề bài viết..." size="large" className="text-lg" />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-base font-semibold">Mô tả ngắn</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả" },
                  { min: 1, message: "Mô tả phải có ít nhất 1 ký tự" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả ngắn gọn về nội dung bài viết (hiển thị trong danh sách và SEO)"
                  className="text-base"
                />
              </Form.Item>

              <Form.Item
                name="content"
                label={<span className="text-base font-semibold">Nội dung bài viết</span>}
                extra={<span className="text-gray-500">Sử dụng Jodit Editor để soạn nội dung</span>}
              >
                <JoditEditor />
              </Form.Item>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold mb-4 text-gray-900">Thông tin xuất bản</h3>

                <Form.Item
                  name="categoryId"
                  label={<span className="text-sm font-medium">Danh mục</span>}
                  rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                >
                  <Select
                    placeholder="Chọn danh mục"
                    size="large"
                    options={
                      categoriesData?.data?.map((cat) => ({
                        label: cat.name,
                        value: cat.id,
                      })) || []
                    }
                  />
                </Form.Item>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <Form.Item
                  name="image"
                  label={<span className="text-sm font-medium">Ảnh bài viết</span>}
                  extra={<span className="text-xs text-gray-500">Kích thước đề xuất</span>}
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    beforeUpload={() => false}
                    onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                    maxCount={1}
                    accept="image/*"
                    className="w-full"
                  >
                    {fileList.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-4">
                        <UploadOutlined className="text-3xl text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600">Tải ảnh lên</div>
                        {/* <div className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</div> */}
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}

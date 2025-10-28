import { Button, Card, Form, Input, Select, Upload, Spin, Alert } from "antd";
import { UploadOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { QueryKeyEnum } from "../../shares/enums/queryKey.ts";
import { useUpdateBlogMutation } from "../../modules/blogs/hooks/mutations/use-update-blog.mutation.ts";
import { useListCategoriesQuery } from "../../modules/categories/hooks/queries/use-get-categories.query.ts";
import { BlogApi } from "../../modules/blogs/apis/blogApi.ts";
import { Paths } from "../../constants/path-routers.ts";
import { getApiUrl } from "../../shares/utils/utils.ts";
import JoditEditor from "../../shares/components/JoditEditor.tsx";

// Helper function để convert relative URL thành full URL
const convertImageUrls = (content: string): string => {
  if (!content) return content;

  // Lấy base URL từ environment variable
  // Tìm tất cả src="/uploads/..." và thay thế bằng full URL
  return content.replace(/src="\/uploads\//g, `src="http://103.243.173.86:9999/uploads/`);
};

const { TextArea } = Input;

export default function EditBlogPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { data: categoriesData } = useListCategoriesQuery();

  // Fetch blog data
  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QueryKeyEnum.Blog, id],
    queryFn: () => BlogApi.getById(id!),
    enabled: !!id,
  });

  // ---- Mutation: Update ----
  const updateBlog = useUpdateBlogMutation({
    onSuccess: () => {
      toast.success("Cập nhật bài viết thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Blog] });
      navigate(Paths.BLOGS.DETAIL.PATH);
    },
    onError: () => {
      toast.error("Cập nhật bài viết thất bại");
    },
  });

  // Update form and image when blog data is loaded
  useEffect(() => {
    if (blog) {
      // Parse contents từ JSON nếu cần và convert URLs
      let parsedContent = blog.contents;
      if (typeof blog.contents === "string") {
        try {
          parsedContent = JSON.parse(blog.contents);
        } catch {
          // Nếu không phải JSON thì giữ nguyên
        }
      }

      // Convert relative URLs thành full URLs
      parsedContent = convertImageUrls(parsedContent);

      // Update form values
      form.setFieldsValue({
        title: blog.title,
        description: blog.description,
        content: parsedContent,
        categoryId: blog.categoryId,
      });

      // Set image
      if (blog.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.jpg",
            status: "done",
            url: getApiUrl(blog.image),
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [blog, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = {
        id: id!,
        title: values.title,
        description: values.description,
        contents: values.content || "", // Backend expects "contents" not "content"
        categoryId: values.categoryId,
        image: fileList.length > 0 ? fileList : undefined,
      };

      updateBlog.mutate(submitData);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    navigate(Paths.BLOGS.DETAIL.PATH);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="p-6">
        <Alert message="Lỗi" description="Không thể tải thông tin bài viết" type="error" showIcon />
      </div>
    );
  }

  return (
    <div>
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold">Chỉnh sửa bài viết</span>
            <div className="flex gap-2">
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={updateBlog.isPending}
              >
                Cập nhật
              </Button>
            </div>
          </div>
        }
        className="shadow-sm"
      >
        <Form
          form={form}
          layout="vertical"
          key={blog.id}
          initialValues={{
            title: blog.title,
            description: blog.description,
            content: (() => {
              try {
                const parsed =
                  typeof blog.contents === "string" ? JSON.parse(blog.contents) : blog.contents;
                return convertImageUrls(parsed);
              } catch {
                return convertImageUrls(blog.contents);
              }
            })(),
            categoryId: blog.categoryId,
          }}
        >
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

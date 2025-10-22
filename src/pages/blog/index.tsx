import { Alert, Spin, Tag, Image } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CrudTable from "../../shares/components/CrudTable.tsx";
import { FilterField } from "../../shares/components/AdvancedFilter.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Blog } from "../../modules/blogs/types/blog.ts";
import { useListBlogsQuery } from "../../modules/blogs/hooks/queries/use-get-blogs.query.ts";
import { useDeleteBlogMutation } from "../../modules/blogs/hooks/mutations/use-delete-blog.mutation.ts";
import { toast } from "react-toastify";
import { QueryKeyEnum } from "../../shares/enums/queryKey.ts";
import { useListCategoriesQuery } from "../../modules/categories/hooks/queries/use-get-categories.query.ts";
import { getApiUrl } from "../../shares/utils/utils.ts";
import { Paths } from "../../constants/path-routers.ts";

export default function BlogPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filterParams, setFilterParams] = useState<Record<string, string | number>>({});

  const { data, isLoading, isError } = useListBlogsQuery({ filters: filterParams });
  const { data: categoriesData } = useListCategoriesQuery();

  // ---- Mutation: Delete ----
  const deleteBlog = useDeleteBlogMutation({
    onSuccess: () => {
      toast.success("Xóa bài viết thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Blog] });
    },
    onError: () => {
      toast.error("Xóa bài viết thất bại");
    },
  });

  useEffect(() => {
    if (data?.data) {
      setBlogs(data.data);
    }
  }, [data]);

  // Filter fields cho Blog
  const blogFilterFields: FilterField[] = [
    {
      name: "search",
      label: "Tìm kiếm",
      type: "text",
      placeholder: "Tìm theo tiêu đề bài viết",
      width: "100%",
    },
    {
      name: "categoryId",
      label: "Danh mục",
      type: "select",
      width: "100%",
      options:
        categoriesData?.data?.map((cat) => ({
          label: cat.name,
          value: cat.id,
        })) || [],
    },
  ];

  const handleFilter = (filterValues: Record<string, string | number>) => {
    setFilterParams(filterValues);
  };

  const handleResetFilter = () => {
    setFilterParams({});
  };

  const handleAddBlog = () => {
    navigate(Paths.BLOGS.CREATE.PATH);
  };

  const handleEditBlog = (blog: Blog) => {
    navigate(`/blogs/${blog.id}`);
  };

  const handleDelete = (blog: Blog) => {
    deleteBlog.mutate(blog.id);
  };

  // ---- Columns ----
  const columns: ColumnsType<Blog> = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: "8%",
      render: (image: string | null) =>
        image ? (
          <Image
            src={getApiUrl(image)}
            alt="blog"
            width={50}
            height={50}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
            N/A
          </div>
        ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text: string) => <span className="text-gray-600 line-clamp-2">{text}</span>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: "15%",
      render: (category: Blog["category"]) => <Tag color="blue">{category.name}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "10%",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Hoạt động" : "Ngừng"}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <>
      {isError && (
        <Alert
          message="Lỗi"
          description="Không thể tải danh sách bài viết"
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Spin spinning={isLoading}>
        <CrudTable
          title="Quản lý bài viết"
          subtitle="Danh sách tất cả bài viết trong hệ thống"
          rowKey="id"
          columns={columns}
          dataSource={blogs}
          addButtonText="Thêm bài viết"
          onAdd={handleAddBlog}
          onEdit={handleEditBlog}
          onDelete={handleDelete}
          useAdvancedFilter={true}
          filterFields={blogFilterFields}
          onFilter={handleFilter}
          onResetFilter={handleResetFilter}
        />
      </Spin>
    </>
  );
}

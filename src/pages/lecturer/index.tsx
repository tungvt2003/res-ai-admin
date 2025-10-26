import { Alert, Form, Input, Modal, Spin, Tag, Upload, Image, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useEffect, useState } from "react";
import CrudTable from "../../shares/components/CrudTable.tsx";
import { FilterField } from "../../shares/components/AdvancedFilter.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { Lecturer } from "../../modules/lecturers/types/lecturer.ts";
import { useListLecturersQuery } from "../../modules/lecturers/hooks/queries/use-get-lecturers.query.ts";
import { useDeleteLecturerMutation } from "../../modules/lecturers/hooks/mutations/use-delete-lecturer.mutation.ts";
import { toast } from "react-toastify";
import { QueryKeyEnum } from "../../shares/enums/queryKey.ts";
import { useCreateLecturerMutation } from "../../modules/lecturers/hooks/mutations/use-create-lecturer.mutation.ts";
import { useUpdateLecturerMutation } from "../../modules/lecturers/hooks/mutations/use-update-lecturer.mutation.ts";
import z from "zod";
import { getApiUrl } from "../../shares/utils/utils.ts";
import { useListKeywordsQuery } from "../../modules/keywords/hooks/queries/use-get-keywords.query.ts";

// Enum mappings
const academicRankMap = {
  gs: "Giáo sư",
  pgs: "Phó giáo sư",
  none: "Không có học hàm",
};

const academicDegreeMap = {
  ts: "Tiến sĩ",
  ths: "Thạc sĩ",
  cn: "Cử nhân",
  ks: "Kỹ sư",
  ds: "Dược sĩ",
  bs: "Bác sĩ",
  tc: "Trung cấp",
  khac: "Khác",
};

export default function LecturerPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [filterParams, setFilterParams] = useState<Record<string, string | number>>({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { data, isLoading, isError } = useListLecturersQuery({ filters: filterParams });
  const { data: keywordsData } = useListKeywordsQuery();

  // ---- Mutation: Delete ----
  const deleteLecturer = useDeleteLecturerMutation({
    onSuccess: () => {
      toast.success("Xóa giảng viên thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Lecturer] });
    },
    onError: () => {
      toast.error("Xóa giảng viên thất bại");
    },
  });

  // ---- Mutation: Create ----
  const createLecturer = useCreateLecturerMutation({
    onSuccess: () => {
      toast.success("Tạo giảng viên thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Lecturer] });
    },
    onError: () => {
      toast.error("Tạo giảng viên thất bại");
    },
  });

  // ---- Mutation: Update ----
  const updateLecturer = useUpdateLecturerMutation({
    onSuccess: () => {
      toast.success("Cập nhật giảng viên thành công");
      queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Lecturer] });
    },
    onError: () => {
      toast.error("Cập nhật giảng viên thất bại");
    },
  });

  useEffect(() => {
    if (data?.data) {
      setLecturers(data.data);
    }
  }, [data]);

  // Filter fields cho Lecturer
  const lecturerFilterFields: FilterField[] = [
    {
      name: "fullName",
      label: "Tìm kiếm",
      type: "text",
      placeholder: "Tìm theo tên giảng viên",
      width: "100%",
    },
    {
      name: "academicRank",
      label: "Học hàm",
      type: "select",
      width: "100%",
      options: [
        { label: "Giáo sư", value: "gs" },
        { label: "Phó giáo sư", value: "pgs" },
        { label: "Không có học hàm", value: "none" },
      ],
    },
    {
      name: "academicDegree",
      label: "Học vị",
      type: "select",
      width: "100%",
      options: [
        { label: "Tiến sĩ", value: "ts" },
        { label: "Thạc sĩ", value: "ths" },
        { label: "Cử nhân", value: "cn" },
        { label: "Kỹ sư", value: "ks" },
        { label: "Dược sĩ", value: "ds" },
        { label: "Bác sĩ", value: "bs" },
        { label: "Trung cấp", value: "tc" },
        { label: "Khác", value: "khac" },
      ],
    },
  ];

  const handleFilter = (filterValues: Record<string, string | number>) => {
    setFilterParams(filterValues);
  };

  const handleResetFilter = () => {
    setFilterParams({});
  };

  const handleAddLecturer = () => {
    setEditingLecturer(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEditLecturer = (lecturer: Lecturer) => {
    setEditingLecturer(lecturer);
    form.setFieldsValue({
      fullName: lecturer.fullName,
      academicDegree: lecturer.academicDegree,
      academicRank: lecturer.academicRank,
      workUnit: lecturer.workUnit,
      position: lecturer.position,
      website: lecturer.website,
      zalo: lecturer.zalo || "",
      message: lecturer.message || "",
      keywordIds: lecturer.keywords?.map((k) => k.id) || [],
    });

    // Set existing image if available
    if (lecturer.image) {
      setFileList([
        {
          uid: "-1",
          name: "image.jpg",
          status: "done",
          url: getApiUrl(lecturer.image),
        },
      ]);
    } else {
      setFileList([]);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const submitData = {
        fullName: values.fullName,
        academicDegree: values.academicDegree,
        academicRank: values.academicRank,
        workUnit: values.workUnit,
        position: values.position,
        website: values.website || undefined,
        zalo: values.zalo || undefined,
        message: values.message || undefined,
        keywordIds: values.keywordIds || [],
        image: fileList.length > 0 ? fileList : undefined,
      };

      if (editingLecturer) {
        updateLecturer.mutate({ id: editingLecturer.id, ...submitData });
      } else {
        createLecturer.mutate(submitData);
      }
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
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

  const handleDelete = (lecturer: Lecturer) => {
    deleteLecturer.mutate(lecturer.id);
  };

  // ---- Columns ----
  const columns: ColumnsType<Lecturer> = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: "8%",
      render: (image: string | null) =>
        image ? (
          <Image
            src={getApiUrl(image)}
            alt="avatar"
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
      title: "Tên giảng viên",
      dataIndex: "fullName",
      key: "fullName",
      width: "18%",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Học hàm",
      dataIndex: "academicRank",
      key: "academicRank",
      width: "10%",
      render: (academicRank: string) => (
        <Tag color="blue">
          {academicRankMap[academicRank as keyof typeof academicRankMap] || academicRank}
        </Tag>
      ),
    },
    {
      title: "Học vị",
      dataIndex: "academicDegree",
      key: "academicDegree",
      width: "10%",
      render: (academicDegree: string) => (
        <Tag color="green">
          {academicDegreeMap[academicDegree as keyof typeof academicDegreeMap] || academicDegree}
        </Tag>
      ),
    },
    {
      title: "Đơn vị công tác",
      dataIndex: "workUnit",
      key: "workUnit",
      width: "20%",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: "12%",
    },
    // {
    //   title: "Website",
    //   dataIndex: "website",
    //   key: "website",
    //   width: "15%",
    //   render: (website: string) =>
    //     website ? (
    //       <a
    //         href={website}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         className="text-blue-500 hover:underline truncate block"
    //       >
    //         {website}
    //       </a>
    //     ) : (
    //       <span className="text-gray-400">Chưa có</span>
    //     ),
    // },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: "10%",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "Hoạt động" : "Ngừng"}</Tag>
      ),
    },
  ];

  return (
    <>
      {isError && (
        <Alert
          message="Lỗi"
          description="Không thể tải danh sách giảng viên"
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Spin spinning={isLoading}>
        <CrudTable
          title="Quản lý giảng viên"
          subtitle="Danh sách tất cả giảng viên trong hệ thống"
          rowKey="id"
          columns={columns}
          dataSource={lecturers}
          addButtonText="Thêm giảng viên"
          onAdd={handleAddLecturer}
          onEdit={handleEditLecturer}
          onDelete={handleDelete}
          useAdvancedFilter={true}
          filterFields={lecturerFilterFields}
          onFilter={handleFilter}
          onResetFilter={handleResetFilter}
        />
      </Spin>

      <Modal
        title={editingLecturer ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setFileList([]);
        }}
        onOk={handleSubmit}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item label="Ảnh giảng viên">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              maxCount={1}
              accept="image/*"
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Tên giảng viên"
            rules={[
              { required: true, message: "Vui lòng nhập tên giảng viên" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: GS.TS. Nguyễn Văn A" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="academicRank"
              label="Học hàm"
              rules={[{ required: true, message: "Vui lòng chọn học hàm" }]}
            >
              <Select
                placeholder="Chọn học hàm"
                options={[
                  { label: "Giáo sư", value: "gs" },
                  { label: "Phó giáo sư", value: "pgs" },
                  { label: "Không có học hàm", value: "none" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="academicDegree"
              label="Học vị"
              rules={[{ required: true, message: "Vui lòng chọn học vị" }]}
            >
              <Select
                placeholder="Chọn học vị"
                options={[
                  { label: "Tiến sĩ", value: "ts" },
                  { label: "Thạc sĩ", value: "ths" },
                  { label: "Cử nhân", value: "cn" },
                  { label: "Kỹ sư", value: "ks" },
                  { label: "Dược sĩ", value: "ds" },
                  { label: "Bác sĩ", value: "bs" },
                  { label: "Trung cấp", value: "tc" },
                  { label: "Khác", value: "khac" },
                ]}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="position"
              label="Chức vụ"
              rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
            >
              <Input placeholder="Ví dụ: Giảng viên, Trưởng khoa" />
            </Form.Item>

            <Form.Item
              name="workUnit"
              label="Đơn vị công tác"
              rules={[{ required: true, message: "Vui lòng nhập đơn vị công tác" }]}
            >
              <Input placeholder="Ví dụ: Khoa Công nghệ Thông tin" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="website"
              label="Website"
              rules={[
                {
                  type: "url",
                  message: "Vui lòng nhập URL hợp lệ",
                },
              ]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>

            <Form.Item name="zalo" label="Zalo">
              <Input placeholder="Số điện thoại hoặc link Zalo" />
            </Form.Item>
          </div>

          <Form.Item
            name="message"
            label="Message"
            rules={[
              {
                type: "url",
                message: "Vui lòng nhập URL hợp lệ",
              },
            ]}
          >
            <Input placeholder="Link message" />
          </Form.Item>

          <Form.Item name="keywordIds" label="Từ khóa chuyên môn">
            <Select
              mode="multiple"
              placeholder="Chọn các từ khóa liên quan"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={keywordsData?.data?.map((keyword) => ({
                label: keyword.name,
                value: keyword.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

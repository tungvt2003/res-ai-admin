import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Collapse,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Empty,
  Breadcrumb,
  Select,
  Popconfirm,
} from "antd";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  TagsOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useListLecturersQuery } from "../../modules/lecturers/hooks/queries/use-get-lecturers.query";

// Helper function để generate UUID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
import { useGetSettingsByKeyQuery } from "../../modules/settings/hooks/queries/use-get-settings-by-key.query";
import { useCreateSettingsMutation } from "../../modules/settings/hooks/mutations/use-create-settings.mutation";
import { useUpdateSettingsMutation } from "../../modules/settings/hooks/mutations/use-update-settings.mutation";
import {
  ParentItem,
  TopicItem,
  FieldItem,
  LecturerItem,
  ConfigurationData,
} from "../../modules/settings/types/configuration";

const { Panel } = Collapse;
const { TextArea } = Input;

type ModalMode = "parent" | "topic" | "field" | "lecturer";

export default function SettingsDetailPage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const mode = searchParams.get("mode") || "view"; // create, edit, view
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  // Fetch lecturers data
  const { data: lecturersData, isLoading: lecturersLoading } = useListLecturersQuery();

  // Fetch settings data from API (chỉ fetch khi không phải create mode)
  const {
    data: settingsData,
    isLoading: configLoading,
    error: configError,
  } = useGetSettingsByKeyQuery({
    key: key || "",
    enabled: !isCreateMode && !!key && !key.startsWith("temp_"),
  });

  // Mutations
  const createSettingsMutation = useCreateSettingsMutation();
  const updateSettingsMutation = useUpdateSettingsMutation();

  // Local state for configuration
  const [configValue, setConfigValue] = useState<ConfigurationData>({
    parents: [],
  });

  // Form state for key and name
  const [settingsFormData, setSettingsFormData] = useState({
    key: "",
    name: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("parent");
  const [editingContext, setEditingContext] = useState<{
    parentId?: string;
    topicId?: string;
    fieldId?: string;
    lecturerId?: string;
  }>({});

  // Load config theo key từ API
  useEffect(() => {
    if (settingsData?.value_jsonb) {
      setConfigValue(settingsData.value_jsonb);
      setSettingsFormData({
        key: settingsData.key,
        name: settingsData.name,
      });
    }
  }, [settingsData]);

  // Initialize form data for create mode
  useEffect(() => {
    if (isCreateMode && key) {
      const urlName = searchParams.get("name");
      setSettingsFormData({
        key: key.startsWith("temp_") ? "" : key,
        name: urlName ? decodeURIComponent(urlName) : "",
      });
      // Không cần mở modal nữa vì đã có key và name từ URL
    }
  }, [isCreateMode, key, searchParams]);

  // Save configuration to API
  const handleSave = async () => {
    if (!settingsFormData.key || !settingsFormData.name) {
      toast.error("Vui lòng nhập key và tên cấu hình");
      return;
    }

    try {
      if (isCreateMode) {
        await createSettingsMutation.mutateAsync({
          key: settingsFormData.key,
          name: settingsFormData.name,
          value_jsonb: configValue,
        });
        toast.success(`Tạo cấu hình "${settingsFormData.key}" thành công`);
        navigate(`/settings/${settingsFormData.key}`);
      } else {
        await updateSettingsMutation.mutateAsync({
          key: settingsFormData.key,
          name: settingsFormData.name,
          value_jsonb: configValue,
        });
        toast.success(`Lưu cấu hình "${settingsFormData.key}" thành công`);
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Có lỗi xảy ra khi lưu cấu hình");
    }
  };

  // ========== PARENT OPERATIONS ==========
  const handleAddParent = () => {
    setModalMode("parent");
    setEditingContext({});
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditParent = (parentId: string) => {
    const parent = configValue.parents.find((p) => p.id === parentId);
    if (parent) {
      setModalMode("parent");
      setEditingContext({ parentId });
      form.setFieldsValue({
        name: parent.name,
        description: parent.description,
      });
      setIsModalOpen(true);
    }
  };

  const handleDeleteParent = (parentId: string) => {
    setConfigValue((prev) => ({
      ...prev,
      parents: prev.parents.filter((p) => p.id !== parentId),
    }));
    toast.success("Đã xóa cha (chưa lưu vào hệ thống)");
  };

  // ========== TOPIC OPERATIONS ==========
  const handleAddTopic = (parentId: string) => {
    setModalMode("topic");
    setEditingContext({ parentId });
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditTopic = (parentId: string, topicId: string) => {
    const parent = configValue.parents.find((p) => p.id === parentId);
    const topic = parent?.topics.find((t) => t.id === topicId);
    if (topic) {
      setModalMode("topic");
      setEditingContext({ parentId, topicId });
      form.setFieldsValue({ name: topic.name });
      setIsModalOpen(true);
    }
  };

  const handleDeleteTopic = (parentId: string, topicId: string) => {
    setConfigValue((prev) => ({
      ...prev,
      parents: prev.parents.map((p) =>
        p.id === parentId ? { ...p, topics: p.topics.filter((t) => t.id !== topicId) } : p,
      ),
    }));
    toast.success("Đã xóa chủ đề (chưa lưu vào hệ thống)");
  };

  // ========== FIELD OPERATIONS ==========
  const handleAddField = (parentId: string, topicId: string) => {
    setModalMode("field");
    setEditingContext({ parentId, topicId });
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditField = (parentId: string, topicId: string, fieldId: string) => {
    const parent = configValue.parents.find((p) => p.id === parentId);
    const topic = parent?.topics.find((t) => t.id === topicId);
    const field = topic?.fields.find((f) => f.id === fieldId);
    if (field) {
      setModalMode("field");
      setEditingContext({ parentId, topicId, fieldId });
      form.setFieldsValue({ name: field.name });
      setIsModalOpen(true);
    }
  };

  const handleDeleteField = (parentId: string, topicId: string, fieldId: string) => {
    setConfigValue((prev) => ({
      ...prev,
      parents: prev.parents.map((p) =>
        p.id === parentId
          ? {
              ...p,
              topics: p.topics.map((t) =>
                t.id === topicId ? { ...t, fields: t.fields.filter((f) => f.id !== fieldId) } : t,
              ),
            }
          : p,
      ),
    }));
    toast.success("Đã xóa lĩnh vực (chưa lưu vào hệ thống)");
  };

  // ========== LECTURER OPERATIONS ==========
  const handleAddLecturer = (parentId: string, topicId: string, fieldId: string) => {
    setModalMode("lecturer");
    setEditingContext({ parentId, topicId, fieldId });
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditLecturer = (
    parentId: string,
    topicId: string,
    fieldId: string,
    lecturerId: string,
  ) => {
    const parent = configValue.parents.find((p) => p.id === parentId);
    const topic = parent?.topics.find((t) => t.id === topicId);
    const field = topic?.fields.find((f) => f.id === fieldId);
    const lecturer = field?.lecturers.find((l) => l.id === lecturerId);
    if (lecturer) {
      setModalMode("lecturer");
      setEditingContext({ parentId, topicId, fieldId, lecturerId });
      form.setFieldsValue({
        lecturerId: lecturer.id,
      });
      setIsModalOpen(true);
    }
  };

  const handleDeleteLecturer = (
    parentId: string,
    topicId: string,
    fieldId: string,
    lecturerId: string,
  ) => {
    setConfigValue((prev) => ({
      ...prev,
      parents: prev.parents.map((p) =>
        p.id === parentId
          ? {
              ...p,
              topics: p.topics.map((t) =>
                t.id === topicId
                  ? {
                      ...t,
                      fields: t.fields.map((f) =>
                        f.id === fieldId
                          ? {
                              ...f,
                              lecturers: f.lecturers.filter((l) => l.id !== lecturerId),
                            }
                          : f,
                      ),
                    }
                  : t,
              ),
            }
          : p,
      ),
    }));
    toast.success("Đã xóa giảng viên (chưa lưu vào hệ thống)");
  };

  // ========== MODAL SUBMIT ==========
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { parentId, topicId, fieldId, lecturerId } = editingContext;

      if (modalMode === "parent") {
        if (parentId) {
          // Edit parent
          setConfigValue((prev) => ({
            ...prev,
            parents: prev.parents.map((p) =>
              p.id === parentId ? { ...p, name: values.name, description: values.description } : p,
            ),
          }));
          toast.success("Đã cập nhật cha (chưa lưu vào hệ thống)");
        } else {
          // Add parent
          const newParent: ParentItem = {
            id: generateId(),
            name: values.name,
            description: values.description,
            topics: [],
          };
          setConfigValue((prev) => ({
            ...prev,
            parents: [...prev.parents, newParent],
          }));
          toast.success("Đã thêm cha mới (chưa lưu vào hệ thống)");
        }
      } else if (modalMode === "topic" && parentId) {
        if (topicId) {
          // Edit topic
          setConfigValue((prev) => ({
            ...prev,
            parents: prev.parents.map((p) =>
              p.id === parentId
                ? {
                    ...p,
                    topics: p.topics.map((t) =>
                      t.id === topicId ? { ...t, name: values.name } : t,
                    ),
                  }
                : p,
            ),
          }));
          toast.success("Đã cập nhật chủ đề (chưa lưu vào hệ thống)");
        } else {
          // Add topic
          const newTopic: TopicItem = {
            id: generateId(),
            name: values.name,
            fields: [],
          };
          setConfigValue((prev) => ({
            ...prev,
            parents: prev.parents.map((p) =>
              p.id === parentId ? { ...p, topics: [...p.topics, newTopic] } : p,
            ),
          }));
          toast.success("Đã thêm chủ đề mới (chưa lưu vào hệ thống)");
        }
      } else if (modalMode === "field" && parentId && topicId) {
        if (fieldId) {
          // Edit field
          setConfigValue((prev) => ({
            ...prev,
            parents: prev.parents.map((p) =>
              p.id === parentId
                ? {
                    ...p,
                    topics: p.topics.map((t) =>
                      t.id === topicId
                        ? {
                            ...t,
                            fields: t.fields.map((f) =>
                              f.id === fieldId ? { ...f, name: values.name } : f,
                            ),
                          }
                        : t,
                    ),
                  }
                : p,
            ),
          }));
          toast.success("Đã cập nhật lĩnh vực (chưa lưu vào hệ thống)");
        } else {
          // Add field
          const newField: FieldItem = {
            id: generateId(),
            name: values.name,
            lecturers: [],
          };
          setConfigValue((prev) => ({
            ...prev,
            parents: prev.parents.map((p) =>
              p.id === parentId
                ? {
                    ...p,
                    topics: p.topics.map((t) =>
                      t.id === topicId ? { ...t, fields: [...t.fields, newField] } : t,
                    ),
                  }
                : p,
            ),
          }));
          toast.success("Đã thêm lĩnh vực mới (chưa lưu vào hệ thống)");
        }
      } else if (modalMode === "lecturer" && parentId && topicId && fieldId) {
        if (lecturerId) {
          // Edit lecturer - cập nhật từ danh sách giảng viên có sẵn
          const selectedLecturer = lecturersData?.data?.find((l) => l.id === values.lecturerId);
          if (selectedLecturer) {
            setConfigValue((prev) => ({
              ...prev,
              parents: prev.parents.map((p) =>
                p.id === parentId
                  ? {
                      ...p,
                      topics: p.topics.map((t) =>
                        t.id === topicId
                          ? {
                              ...t,
                              fields: t.fields.map((f) =>
                                f.id === fieldId
                                  ? {
                                      ...f,
                                      lecturers: f.lecturers.map((l) =>
                                        l.id === lecturerId
                                          ? {
                                              ...l,
                                              id: selectedLecturer.id,
                                              name: selectedLecturer.fullName,
                                              academicRank: selectedLecturer.academicRank,
                                              academicDegree: selectedLecturer.academicDegree,
                                              workUnit: selectedLecturer.workUnit,
                                              position: selectedLecturer.position,
                                              image: selectedLecturer.image,
                                              website: selectedLecturer.website,
                                              isActive: selectedLecturer.isActive,
                                              createdAt: selectedLecturer.createdAt,
                                              updatedAt: selectedLecturer.updatedAt,
                                            }
                                          : l,
                                      ),
                                    }
                                  : f,
                              ),
                            }
                          : t,
                      ),
                    }
                  : p,
              ),
            }));
            toast.success("Đã cập nhật giảng viên (chưa lưu vào hệ thống)");
          }
        } else {
          // Add lecturer - chọn từ danh sách giảng viên có sẵn
          const selectedLecturer = lecturersData?.data?.find((l) => l.id === values.lecturerId);
          if (selectedLecturer) {
            const newLecturer: LecturerItem = {
              id: selectedLecturer.id,
              name: selectedLecturer.fullName,
              academicRank: selectedLecturer.academicRank,
              academicDegree: selectedLecturer.academicDegree,
              workUnit: selectedLecturer.workUnit,
              position: selectedLecturer.position,
              image: selectedLecturer.image,
              website: selectedLecturer.website,
              isActive: selectedLecturer.isActive,
              createdAt: selectedLecturer.createdAt,
              updatedAt: selectedLecturer.updatedAt,
            };
            setConfigValue((prev) => ({
              ...prev,
              parents: prev.parents.map((p) =>
                p.id === parentId
                  ? {
                      ...p,
                      topics: p.topics.map((t) =>
                        t.id === topicId
                          ? {
                              ...t,
                              fields: t.fields.map((f) =>
                                f.id === fieldId
                                  ? { ...f, lecturers: [...f.lecturers, newLecturer] }
                                  : f,
                              ),
                            }
                          : t,
                      ),
                    }
                  : p,
              ),
            }));
            toast.success("Đã thêm giảng viên mới (chưa lưu vào hệ thống)");
          }
        }
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const getModalTitle = () => {
    const isEdit = Boolean(
      editingContext.parentId ||
        editingContext.topicId ||
        editingContext.fieldId ||
        editingContext.lecturerId,
    );
    const prefix = isEdit ? "Chỉnh sửa" : "Thêm mới";

    switch (modalMode) {
      case "parent":
        return `${prefix} Cha`;
      case "topic":
        return `${prefix} Chủ đề`;
      case "field":
        return `${prefix} Lĩnh vực`;
      case "lecturer":
        return `${prefix} Giảng viên`;
      default:
        return "";
    }
  };

  // Loading state (chỉ hiển thị khi không phải create mode)
  if (configLoading && !isCreateMode) {
    return (
      <div className="p-6">
        <Card loading={true}>
          <div className="h-64 flex items-center justify-center">
            <span>Đang tải cấu hình...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state (chỉ hiển thị khi không phải create mode)
  if (configError && !isCreateMode) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Có lỗi xảy ra khi tải cấu hình</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <Button type="link" onClick={() => navigate("/settings")}>
            Danh sách cấu hình
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {isCreateMode ? "Tạo mới" : isEditMode ? "Chỉnh sửa" : key}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-xl" />
            <span className="text-xl font-semibold">
              {isCreateMode
                ? "Tạo cấu hình mới"
                : isEditMode
                ? "Chỉnh sửa cấu hình"
                : `Cấu hình: ${key}`}
            </span>
          </div>
        }
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddParent}>
              Thêm cha
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={updateSettingsMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Lưu cấu hình
            </Button>
            <Button
              type="default"
              onClick={() => {
                console.log("Current config:", JSON.stringify(configValue, null, 2));
                toast.info("Xem console để thấy cấu trúc JSONB");
              }}
            >
              Xem JSON
            </Button>
          </Space>
        }
      >
        {configValue.parents.length === 0 ? (
          <Empty description="Chưa có cha nào. Hãy thêm cha đầu tiên!" />
        ) : (
          <Collapse defaultActiveKey={[]} expandIconPosition="end" className="bg-white">
            {configValue.parents.map((parent) => (
              <Panel
                key={parent.id}
                header={
                  <div className="flex items-center justify-between w-full">
                    <Space>
                      <FolderOpenOutlined className="text-blue-600" />
                      <span className="font-semibold text-base">{parent.name}</span>
                      {parent.description && (
                        <span className="text-gray-500 text-sm">- {parent.description}</span>
                      )}
                    </Space>
                    <Space onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddTopic(parent.id)}
                      >
                        Thêm chủ đề
                      </Button>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditParent(parent.id)}
                      />
                      <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa cha này? Tất cả dữ liệu con sẽ bị xóa."
                        onConfirm={() => handleDeleteParent(parent.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                      >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                }
              >
                {parent.topics.length === 0 ? (
                  <Empty description="Chưa có chủ đề" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Collapse className="ml-4">
                    {parent.topics.map((topic) => (
                      <Panel
                        key={topic.id}
                        header={
                          <div className="flex items-center justify-between w-full">
                            <Space>
                              <FileTextOutlined className="text-green-600" />
                              <span className="font-medium">{topic.name}</span>
                            </Space>
                            <Space onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => handleAddField(parent.id, topic.id)}
                              >
                                Thêm lĩnh vực
                              </Button>
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEditTopic(parent.id, topic.id)}
                              />
                              <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa chủ đề này?"
                                onConfirm={() => handleDeleteTopic(parent.id, topic.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okType="danger"
                              >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          </div>
                        }
                      >
                        {topic.fields.length === 0 ? (
                          <Empty
                            description="Chưa có lĩnh vực"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          <div className="ml-4 space-y-4">
                            {topic.fields.map((field) => (
                              <Card
                                key={field.id}
                                size="small"
                                title={
                                  <Space>
                                    <TagsOutlined className="text-purple-600" />
                                    <span>{field.name}</span>
                                  </Space>
                                }
                                extra={
                                  <Space>
                                    <Button
                                      size="small"
                                      icon={<PlusOutlined />}
                                      onClick={() =>
                                        handleAddLecturer(parent.id, topic.id, field.id)
                                      }
                                    >
                                      Thêm giảng viên
                                    </Button>
                                    <Button
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={() => handleEditField(parent.id, topic.id, field.id)}
                                    />
                                    <Popconfirm
                                      title="Xác nhận xóa"
                                      description="Bạn có chắc chắn muốn xóa lĩnh vực này?"
                                      onConfirm={() =>
                                        handleDeleteField(parent.id, topic.id, field.id)
                                      }
                                      okText="Xóa"
                                      cancelText="Hủy"
                                      okType="danger"
                                    >
                                      <Button size="small" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </Space>
                                }
                              >
                                <div className="flex flex-wrap gap-2">
                                  {field.lecturers.length === 0 ? (
                                    <span className="text-gray-400 text-sm">
                                      Chưa có giảng viên
                                    </span>
                                  ) : (
                                    field.lecturers.map((lecturer) => (
                                      <Tag
                                        key={lecturer.id}
                                        color="blue"
                                        closable
                                        onClose={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        closeIcon={
                                          <Popconfirm
                                            title="Xác nhận xóa"
                                            description="Bạn có chắc chắn muốn xóa giảng viên này?"
                                            onConfirm={(e) => {
                                              e?.stopPropagation();
                                              handleDeleteLecturer(
                                                parent.id,
                                                topic.id,
                                                field.id,
                                                lecturer.id,
                                              );
                                            }}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okType="danger"
                                          >
                                            <DeleteOutlined />
                                          </Popconfirm>
                                        }
                                        onClick={(e) => {
                                          // Chỉ mở modal khi click vào phần text, không phải nút X
                                          if (
                                            !(e.target as HTMLElement).closest(
                                              ".ant-tag-close-icon",
                                            )
                                          ) {
                                            handleEditLecturer(
                                              parent.id,
                                              topic.id,
                                              field.id,
                                              lecturer.id,
                                            );
                                          }
                                        }}
                                        className="cursor-pointer"
                                      >
                                        {lecturer.name}{" "}
                                        {lecturer.academicRank && `(${lecturer.academicRank})`}
                                        {lecturer.academicDegree && `(${lecturer.academicDegree})`}
                                        {lecturer.workUnit && ` - ${lecturer.workUnit}`}
                                      </Tag>
                                    ))
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </Panel>
                    ))}
                  </Collapse>
                )}
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>

      <Modal
        title={getModalTitle()}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleModalSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          {modalMode === "lecturer" ? (
            <Form.Item
              name="lecturerId"
              label="Chọn giảng viên"
              rules={[{ required: true, message: "Vui lòng chọn giảng viên" }]}
            >
              <Select
                placeholder="Chọn giảng viên từ danh sách"
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={lecturersLoading}
                options={lecturersData?.data?.map((lecturer) => ({
                  label: `${lecturer.fullName} (${lecturer.academicRank})`,
                  value: lecturer.id,
                }))}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Nhập tên..." />
            </Form.Item>
          )}

          {modalMode === "parent" && (
            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Nhập mô tả..." />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

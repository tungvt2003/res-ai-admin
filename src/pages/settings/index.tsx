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

// Helper function để format và clean data trước khi gửi API
const formatConfigForAPI = (config: ConfigurationData): ConfigurationData => {
  try {
    // Deep clone và remove các properties không cần thiết
    const cleanedConfig = JSON.parse(JSON.stringify(config));

    // Clean up empty arrays và null values
    const cleanData = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        return obj.map(cleanData).filter((item) => item !== null && item !== undefined);
      }
      if (obj && typeof obj === "object") {
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = cleanData(value);
          if (cleanedValue !== null && cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
        return cleaned;
      }
      return obj;
    };

    return cleanData(cleanedConfig) as ConfigurationData;
  } catch (error) {
    console.error("Error formatting config:", error);
    return config;
  }
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
      // Format và clean data trước khi gửi
      const formattedConfigValue = formatConfigForAPI(configValue);

      console.log("Formatted config before sending:", formattedConfigValue);

      if (isCreateMode) {
        await createSettingsMutation.mutateAsync({
          key: settingsFormData.key,
          name: settingsFormData.name,
          value_jsonb: formattedConfigValue,
        });
        toast.success(`Tạo cấu hình "${settingsFormData.key}" thành công`);
        navigate(`/settings/${settingsFormData.key}`);
      } else {
        await updateSettingsMutation.mutateAsync({
          key: settingsFormData.key,
          name: settingsFormData.name,
          value_jsonb: formattedConfigValue,
        });
        toast.success(`Lưu cấu hình "${settingsFormData.key}" thành công`);
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Có lỗi xảy ra khi lưu cấu hình");
    }
  };

  // ========== SAMPLE DATA OPERATIONS ==========
  const handleAddSampleData = () => {
    const sampleData: ConfigurationData = {
      parents: [
        {
          id: "1761327422359-syhnkqrqr",
          name: "Giáo dục học",
          description:
            "Khám phá thông tin chi tiết về chuyên ngành giáo dục học, hướng nghề nghiệp và cơ hội phát triển trong lĩnh vực này.",
          topics: [
            {
              id: "1761327436328-ulk1ah5y9",
              name: "Động lực và hành vi học tập – Learning Motivation and Behavior",
              fields: [
                {
                  id: "1761327522091-pyys3r1z0",
                  name: "Động lực học tập (Learning motivation)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327531434-90hdz2fh1",
                  name: "Tự điều chỉnh học tập (Self-regulated learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327541817-aels7gg90",
                  name: "Sự tham gia học tập (Learning engagement)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327549989-okv4z2ap5",
                  name: "Thái độ học tập (Learning attitude)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327559019-xu4ngg9sj",
                  name: "Trì hoãn học tập (Academic procrastination)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327569004-ttu5cwfln",
                  name: "Tự chủ trong học tập (Learning autonomy)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327579135-r6ab9vgj4",
                  name: "Kiểm soát cảm xúc trong học tập (Emotional control in learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327586230-et6zl4ftr",
                  name: "Niềm tin học tập (Learning beliefs)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327594355-txfdb32xf",
                  name: "Tự hiệu quả học tập (Academic self-efficacy)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
                {
                  id: "1761327603273-mlat4x4o9",
                  name: "Kiên trì học tập (Learning persistence)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327442204-pvgoa60vg",
              name: "Chiến lược và phong cách học tập – Learning Strategies and Styles",
              fields: [
                {
                  id: "1761327824032-559rpe1bh",
                  name: "Chiến lược học tập (Learning strategies)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327832227-goyx0wphy",
                  name: "Phong cách học tập (Learning styles)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327840890-n2pbqv0u9",
                  name: "Ghi nhớ và tư duy phản biện (Memory and critical thinking)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327848760-m96jc4eo8",
                  name: "Kỹ năng giải quyết vấn đề (Problem-solving skills)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327856378-h13ti5xis",
                  name: "Kỹ năng tự học (Self-learning skills)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327863220-ep3bbm3ia",
                  name: "Kỹ năng tư duy sáng tạo (Creative thinking skills)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327870893-9ze8rtlda",
                  name: "Kỹ năng quản lý thời gian (Time management skills)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327878371-cc4d87uuw",
                  name: "Kỹ năng đặt mục tiêu (Goal-setting skills)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
                {
                  id: "1761327886317-36agl9ysz",
                  name: "Thói quen học tập (Learning habits)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327450204-nowrylf1f",
              name: "Môi trường và tương tác học tập – Learning Environment and Interaction",
              fields: [
                {
                  id: "1761328101437-tbynfsgec",
                  name: "Môi trường học tập tích cực (Positive learning environment)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328109170-9ydsoyuar",
                  name: "Học tập hợp tác (Cooperative learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328120170-9izxyxpho",
                  name: "Học tập trải nghiệm (Experiential learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328127891-mfj09etbl",
                  name: "Học tập dựa trên dự án (Project-based learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328138288-redwy0360",
                  name: "Học tập kết hợp (Blended learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328145867-psi3zkups",
                  name: "Học tập trực tuyến (Online learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328154727-n8l1d6bru",
                  name: "Học tập qua trò chơi (Game-based learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328164252-dw288f208",
                  name: "Tương tác xã hội trong học tập (Social interaction in learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761328171928-ap2qjiq4l",
                  name: "Văn hóa học đường (School culture)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327456763-x42xl0q8t",
              name: "Ứng dụng công nghệ trong giáo dục – Educational Technology and Innovation",
              fields: [
                {
                  id: "1761328406457-js9xk80ag",
                  name: "Ứng dụng công nghệ trong học tập (Technology integration in learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328413704-x6obpit9k",
                  name: "Giáo dục số (Digital education)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328420521-br07fzml9",
                  name: "Năng lực số của giáo viên (Teachers’ digital competence)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328428704-bh66iqm7u",
                  name: "Học tập thông minh (Smart learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328435338-zy3he4ux9",
                  name: "Trí tuệ nhân tạo trong giáo dục (Artificial intelligence in education)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328442978-4eqpv36dp",
                  name: "Thực tế ảo trong giáo dục (Virtual reality in education)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328450076-9uhhaca35",
                  name: "Hệ thống quản lý học tập (Learning management system (LMS))",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328458620-ldp3n4drf",
                  name: "Học tập qua thiết bị di động (Mobile learning)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328465825-70qyo0yv7",
                  name: "Dạy học trực tuyến hiệu quả (Effective online teaching)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
                {
                  id: "1761328473354-imowz4uye",
                  name: "Chuyển đổi số trong giáo dục (Digital transformation in education)",
                  lecturers: [
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327464413-rxaeu7sva",
              name: "Phát triển kỹ năng và năng lực – Skills and Competency Development",
              fields: [
                {
                  id: "1761328694116-ollk5u9qm",
                  name: "Giáo dục kỹ năng sống (Life skills education)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328703995-lglngcjdy",
                  name: "Giáo dục kỹ năng mềm (Soft skills education)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328713831-i8amexl7e",
                  name: "Năng lực tự học (Self-learning competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328723531-cm9se2no3",
                  name: "Năng lực giao tiếp (Communication competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328730519-g4bso5r8c",
                  name: "Năng lực giải quyết vấn đề (Problem-solving competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328737416-wl60nxv0u",
                  name: "Năng lực hợp tác (Collaboration competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328744703-mpwerdsyu",
                  name: "Năng lực sáng tạo (Creativity competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328754430-8zr8bx3y4",
                  name: "Năng lực thích ứng (Adaptability competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328763327-rjkuiib7l",
                  name: "Năng lực cảm xúc – xã hội (Socio-emotional competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
                {
                  id: "1761328771668-h91wnpo58",
                  name: "Năng lực tư duy phản biện (Critical thinking competence)",
                  lecturers: [
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327470802-9l8si4jry",
              name: "Giáo dục giá trị và nhân cách – Values and Character Education",
              fields: [
                {
                  id: "1761329026891-i1yy8toz4",
                  name: "Giáo dục giá trị sống (Values education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329034091-v0f1qtxvd",
                  name: "Giáo dục đạo đức (Moral education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329043889-7cv3ab5su",
                  name: "Giáo dục công dân (Civic education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329051620-pp1exyd4y",
                  name: "Giáo dục nhân cách (Character education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329059399-06kv3kjxr",
                  name: "Giáo dục lòng nhân ái (Compassion education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329069922-wvbjs41eh",
                  name: "Giáo dục trách nhiệm xã hội (Social responsibility education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329076751-xi0gkhtdb",
                  name: "Giáo dục giới tính (Sex education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329086606-tkurnyjxu",
                  name: "Giáo dục bình đẳng giới (Gender equality education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329096389-c1em31icd",
                  name: "Giáo dục văn hóa dân tộc (Cultural identity education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329105437-v5xtv95wk",
                  name: "Giáo dục hướng nghiệp (Career guidance education)",
                  lecturers: [
                    {
                      id: "158d9b1d-db5c-40c0-a8d6-2aa08d978d9f",
                      name: "Đinh Thị Phương Loan",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/dinh-thi-phuong-loan-1761323810497.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/3982",
                      isActive: true,
                      createdAt: "2025-10-24T16:36:50.497Z",
                      updatedAt: "2025-10-24T16:36:50.497Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327477869-u8s4svkek",
              name: "Quản lý và chính sách giáo dục – Educational Management and Policy",
              fields: [
                {
                  id: "1761329407294-txuf00hmd",
                  name: "Quản lý nhà trường (School management)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329421787-4e9tql9eb",
                  name: "Lãnh đạo giáo dục (Educational leadership)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329432978-xe4w6cf2p",
                  name: "Quản lý chất lượng giáo dục (Educational quality management)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329440733-obq8ljsez",
                  name: "Chính sách giáo dục (Education policy)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329451705-zat6sxuex",
                  name: "Cải cách giáo dục (Educational reform)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329461896-67kty9crj",
                  name: "Đánh giá chương trình giáo dục (Curriculum evaluation)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329470677-lbc1ck0wc",
                  name: "Kiểm định chất lượng giáo dục (Accreditation in education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329476275-tnksj3jm2",
                  name: "Phát triển chương trình học (Curriculum development)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329484914-awbjpy5m4",
                  name: "Quản lý đội ngũ giáo viên (Teacher workforce management)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761329493690-g012yt45l",
                  name: "Quản lý đổi mới phương pháp dạy học (Management of teaching innovation)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327486500-mvvtilvso",
              name: "Giáo viên và phát triển nghề nghiệp – Teachers and Professional Development",
              fields: [
                {
                  id: "1761329745174-zdceoh3kz",
                  name: "Phát triển nghề nghiệp giáo viên (Teacher professional development)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329752852-n0zw7r1id",
                  name: "Năng lực sư phạm (Pedagogical competence)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329760032-0ulagn1fo",
                  name: "Tự bồi dưỡng chuyên môn (Self-directed professional learning)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329769236-29olr0op3",
                  name: "Thái độ nghề nghiệp của giáo viên (Teacher professional attitude)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329776911-03mpi7g8y",
                  name: "Sự hài lòng nghề nghiệp (Job satisfaction)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329785878-hhufjtkod",
                  name: "Căng thẳng nghề nghiệp (Occupational stress)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329801586-is37jmxdq",
                  name: "Đạo đức nghề nghiệp (Professional ethics)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329810716-z1a2fo0bf",
                  name: "Năng lực công nghệ của giáo viên (Teachers’ technological competence)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329817877-2oxiw0qp9",
                  name: "Phản hồi sư phạm (Pedagogical feedback)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
                {
                  id: "1761329825115-nfg23hoce",
                  name: "Sự đổi mới phương pháp dạy học (Innovation in teaching methods)",
                  lecturers: [
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327494884-fw4ye5ljz",
              name: "Học sinh và tâm lý học đường – Students and School Psychology",
              fields: [
                {
                  id: "1761329991226-cluk19pbr",
                  name: "Hành vi học sinh (Student behavior)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761329998154-qxi8jkf96",
                  name: "Căng thẳng học tập (Academic stress)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330005495-uawhh7op5",
                  name: "Sức khỏe tinh thần học sinh (Students’ mental health)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330013131-oy45leq5e",
                  name: "Tự tin học tập (Learning confidence)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330023872-x0bsjvrtk",
                  name: "Khả năng thích nghi học tập (Learning adaptability)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330031722-sfc8l2xk5",
                  name: "Mối quan hệ bạn bè (Peer relationships)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330042066-m1wo4f6q7",
                  name: "Bắt nạt học đường (School bullying)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330049193-wphgcxxyk",
                  name: "Cảm xúc học tập (Learning emotions)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330055565-oh7bfuu08",
                  name: "Tự nhận thức bản thân (Self-awareness)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
                {
                  id: "1761330065981-x0o6yeiav",
                  name: "Sự hỗ trợ của cha mẹ trong học tập (Parental support in learning)",
                  lecturers: [
                    {
                      id: "30613613-9436-4216-bad8-c1255696f841",
                      name: "Hồ Thị Trúc Quỳnh",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ho-thi-truc-quynh-1761323589411.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:09.412Z",
                      updatedAt: "2025-10-24T16:33:09.412Z",
                    },
                    {
                      id: "64c661eb-509d-4596-a937-4f9d54ba2dc2",
                      name: "Nguyễn Thị Ngọc Bé",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thi-ngoc-be-1761324118360.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2295",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:58.361Z",
                      updatedAt: "2025-10-24T16:41:58.361Z",
                    },
                    {
                      id: "fab99527-d526-4f6d-9747-640aafb3facb",
                      name: "Hoàng Thế Hải",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Đà Nẵng",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/hoang_the_hai-1761324420230.jpg",
                      website: "https://scv.udn.vn/hthai",
                      isActive: true,
                      createdAt: "2025-10-24T16:47:00.231Z",
                      updatedAt: "2025-10-24T16:47:00.231Z",
                    },
                    {
                      id: "33a6ff3d-d469-4ab6-a742-cec78cb39e4a",
                      name: "Phạm Tiến Sỹ",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Khoa học, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-tien-sy-1761323917187.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/2432",
                      isActive: true,
                      createdAt: "2025-10-24T16:38:37.195Z",
                      updatedAt: "2025-10-24T16:38:37.195Z",
                    },
                  ],
                },
              ],
            },
            {
              id: "1761327501731-q3bjyz1k1",
              name: "Xu hướng và đổi mới giáo dục hiện đại – Modern Educational Trends and Innovation",
              fields: [
                {
                  id: "1761330262452-oyq12vk91",
                  name: "Giáo dục toàn diện (Holistic education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330270470-ae41bdsi4",
                  name: "Giáo dục bền vững (Education for sustainable development)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330278134-hjkc21maq",
                  name: "Giáo dục STEM (STEM education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330293745-a936y7fla",
                  name: "Giáo dục STEAM (STEAM education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330300366-8h0bvpt7f",
                  name: "Giáo dục trải nghiệm (Experiential education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330308175-n7y7npo29",
                  name: "Giáo dục cá thể hóa (Personalized education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330316606-b1hwzpbcn",
                  name: "Giáo dục vì sự phát triển con người (Human development education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330324259-tfz53pz9r",
                  name: "Học tập suốt đời (Lifelong learning)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330331959-xk6i2s3x2",
                  name: "Học tập trong cộng đồng (Community learning)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
                {
                  id: "1761330339022-8veqaxz1v",
                  name: "Giáo dục khai phóng (Liberal education)",
                  lecturers: [
                    {
                      id: "cd367b67-e67e-4425-9bb0-b6433a96db8e",
                      name: "Lê Văn Thăng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/ThaÌng_LeÌ_VaÌn_ThaÌng_2013-1761318765635.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1754",
                      isActive: true,
                      createdAt: "2025-10-24T15:12:45.638Z",
                      updatedAt: "2025-10-24T16:30:22.143Z",
                    },
                    {
                      id: "b73f7b0b-19ac-44a6-9430-90aa18707d05",
                      name: "Nguyễn Thanh Hùng",
                      academicRank: "pgs",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Phó giáo sư",
                      image: "/uploads/2025/10/Nguyen_Thanh_Hung_6-1761233810254.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1313",
                      isActive: true,
                      createdAt: "2025-10-23T15:36:50.255Z",
                      updatedAt: "2025-10-24T16:30:13.729Z",
                    },
                    {
                      id: "03cbcf78-9f4b-4e26-adad-5d6f74e6490f",
                      name: "Phạm Thị Thúy Hằng",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/pham-thi-thuy-hang-1761323545976.jpeg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1317",
                      isActive: true,
                      createdAt: "2025-10-24T16:32:25.976Z",
                      updatedAt: "2025-10-24T16:32:25.976Z",
                    },
                    {
                      id: "ed38bbed-dba0-40b2-9d9d-62d1186b1257",
                      name: "Nguyễn Thanh Bình",
                      academicRank: "none",
                      academicDegree: "ths",
                      workUnit: "Đại học Sư phạm, Đại học Huế",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/nguyen-thanh-binh-1761323762587.jpg",
                      website:
                        "https://csdlkhoahoc.hueuni.edu.vn/index.php/scientist/detail/id/1991",
                      isActive: true,
                      createdAt: "2025-10-24T16:33:34.641Z",
                      updatedAt: "2025-10-24T16:36:02.592Z",
                    },
                    {
                      id: "67612990-6660-44dc-b59c-7319a9b0f897",
                      name: "Trần Thị Cẩm Tú",
                      academicRank: "none",
                      academicDegree: "ts",
                      workUnit: "Đại học Sư phạm Hà Nội",
                      position: "Giảng viên",
                      image: "/uploads/2025/10/tran-thi-cam-tu-1761324072831.png",
                      website: "https://psy.hnue.edu.vn/ts-tran-thi-cam-tu-188",
                      isActive: true,
                      createdAt: "2025-10-24T16:41:12.832Z",
                      updatedAt: "2025-10-24T16:41:12.832Z",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    setConfigValue(sampleData);
    toast.success("Đã thêm dữ liệu mẫu (chưa lưu vào hệ thống)");
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
            <Button
              type="default"
              onClick={handleAddSampleData}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Thêm dữ liệu mẫu
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
                  label: `${lecturer.fullName}`,
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

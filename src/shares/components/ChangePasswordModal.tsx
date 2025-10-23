import React, { useState } from "react";
import { Modal, Form, Input, Button, Space } from "antd";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useUpdatePasswordMutation } from "../../modules/users/hooks/mutations/use-update-password.mutation";
import { useSelector } from "react-redux";
import { RootState } from "../stores";

interface ChangePasswordModalProps {
  open: boolean;
  onCancel: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const updatePasswordMutation = useUpdatePasswordMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (values.newPassword !== values.confirmPassword) {
        form.setFields([
          {
            name: "confirmPassword",
            errors: ["Mật khẩu xác nhận không khớp"],
          },
        ]);
        return;
      }

      if (!user?.id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      await updatePasswordMutation.mutateAsync({
        userId: user.id,
        password: values.newPassword,
      });

      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LockKeyhole className="w-5 h-5 text-blue-600" />
          <span>Thay đổi mật khẩu</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4" onFinish={handleSubmit}>
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu hiện tại"
            prefix={<LockKeyhole className="w-4 h-4 text-gray-400" />}
            visibilityToggle={{
              visible: showCurrentPassword,
              onVisibleChange: setShowCurrentPassword,
            }}
            iconRender={(visible) => (visible ? <EyeOff /> : <Eye />)}
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
            },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            prefix={<LockKeyhole className="w-4 h-4 text-gray-400" />}
            visibilityToggle={{
              visible: showNewPassword,
              onVisibleChange: setShowNewPassword,
            }}
            iconRender={(visible) => (visible ? <EyeOff /> : <Eye />)}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            prefix={<LockKeyhole className="w-4 h-4 text-gray-400" />}
            visibilityToggle={{
              visible: showConfirmPassword,
              onVisibleChange: setShowConfirmPassword,
            }}
            iconRender={(visible) => (visible ? <EyeOff /> : <Eye />)}
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={updatePasswordMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thay đổi mật khẩu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;

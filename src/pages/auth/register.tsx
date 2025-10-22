import React from "react";
import { Button, Col, Form, Input, Layout, Row, Select } from "antd";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterMutation } from "../../modules/auth/hooks/mutations/use-register.mutation";

const { Content } = Layout;
const { Option } = Select;

type RegisterFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  email: string;
  phone: string;
  roles: string;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();

  const registerMutation = useRegisterMutation({
    onSuccess: () => {
      toast.success("Đăng ký tài khoản thành công!");
      setLoading(false);
      // Chuyển về trang đăng nhập sau 1.5s
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
    onError: () => {
      setLoading(false);
      const errorMessage = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!";
      toast.error(errorMessage);
    },
  });

  const handleRegister = (values: RegisterFormValues) => {
    setLoading(true);
    // Chỉ lấy các field cần thiết cho API
    const registerData = {
      username: values.username,
      password: values.password,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      roles: values.roles,
    };
    registerMutation.mutate(registerData);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 9999 }}
      />
      <Content className="w-full max-w-[70%] p-8 rounded-lg flex items-center justify-center">
        <Row
          justify="center"
          align="middle"
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <Col
            xs={0}
            md={10}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              background: "#fafafa",
            }}
          >
            <img
              src={"/logo.jpg"}
              alt="Register Illustration"
              style={{ maxWidth: "80%", height: "auto" }}
            />
          </Col>

          <Col xs={24} md={14} style={{ padding: "40px" }}>
            <h2 className="text-center mb-4 text-3xl font-semibold">Đăng ký tài khoản</h2>

            <Form form={form} layout="vertical" onFinish={handleRegister}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên" },
                      { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" },
                    ]}
                  >
                    <Input placeholder="Nhập họ và tên" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên đăng nhập" },
                      { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
                      {
                        pattern: /^[a-zA-Z0-9_]+$/,
                        message: "Tên đăng nhập chỉ chứa chữ cái, số và gạch dưới",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập tên đăng nhập" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input placeholder="Nhập email" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại" },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại phải có 10-11 chữ số",
                      },
                    ]}
                  >
                    <Input placeholder="Nhập số điện thoại" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu" },
                      { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                    ]}
                  >
                    <Input.Password placeholder="Nhập mật khẩu" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Vui lòng xác nhận mật khẩu" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Nhập lại mật khẩu" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="roles"
                label="Vai trò"
                initialValue="user"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò" size="large">
                  <Option value="user">Người dùng</Option>
                  <Option value="admin">Quản trị viên</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  style={{
                    border: "none",
                    borderRadius: "24px",
                  }}
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <div className="text-center mt-2.5 text-sm">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-blue-500 hover:text-blue-700">
                  Đăng nhập ngay
                </Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

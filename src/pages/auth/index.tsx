import React from "react";
import { Button, Col, Form, Input, Layout, Row } from "antd";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../../modules/auth/hooks/mutations/use-login.mutation";
import { ROLES } from "../../shares/constants/roles";
const { Content } = Layout;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const loginMutation = useLoginMutation({
    onSuccess: async (data) => {
      const tokens = data?.data;
      if (!tokens?.accessToken) {
        toast.error("Đăng nhập thất bại: Không nhận được token.");
        setLoading(false);
        return;
      }
      if (tokens?.user?.roles === ROLES.ADMIN) {
        toast.success("Đăng nhập thành công!");
        setLoading(false);
        navigate("/");
      } else {
        toast.error("Bạn không có quyền truy cập vào hệ thống!");
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      const errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!";
      toast.error(errorMessage);
    },
  });

  const handleLogin = (values: { username: string; password: string }) => {
    setLoading(true);
    loginMutation.mutate(values);
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
            md={12}
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
              alt="Login Illustration"
              style={{ maxWidth: "80%", height: "auto" }}
            />
          </Col>

          <Col xs={24} md={12} style={{ padding: "40px" }}>
            <h2 className="text-center mb-4 text-3xl font-semibold">Đăng nhập tài khoản</h2>

            <Form layout="vertical" onFinish={handleLogin}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
              >
                <Input placeholder="Nhập tài khoản" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password placeholder="Nhập mật khẩu" size="large" />
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
                  Đăng nhập
                </Button>
              </Form.Item>

              <div className="text-center mt-2.5 text-sm">
                <a href="#">Quên mật khẩu</a>
              </div>

              <div className="text-center mt-2.5 text-sm">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-blue-500 hover:text-blue-700">
                  Đăng ký ngay
                </Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

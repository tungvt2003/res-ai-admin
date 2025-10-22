type User = {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  roles: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
};

export { User };

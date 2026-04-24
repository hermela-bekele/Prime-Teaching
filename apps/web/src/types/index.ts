/** Legacy UI role slug used in routes and demo data. */
export type Role = "teacher" | "dept_head" | "leader";

export type UserSummary = {
  id: string;
  email: string;
  role: Role;
};

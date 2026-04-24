import type { AuthUserDto } from "@/lib/api-types";
import type { AppUser } from "@/stores/authStore";

export function mapAuthUserDto(dto: AuthUserDto): AppUser {
  return {
    id: String(dto.id),
    name: String(dto.name ?? dto.full_name ?? dto.email.split("@")[0] ?? "User"),
    email: dto.email,
    role: String(dto.role),
    schoolId: dto.school_id != null ? String(dto.school_id) : dto.schoolId != null ? String(dto.schoolId) : null
  };
}

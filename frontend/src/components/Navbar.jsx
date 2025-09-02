// 핵심만 예시
import { useAuth } from "../context/AuthContext";

const { user, logout } = useAuth();
const isAdmin = user?.role === "admin";

{
  user ? (
    !isAdmin ? (
      // 일반 사용자: 기존 드롭다운 (user-dashboard / orders / cart / checkout)
      <UserDropdown onLogout={logout} />
    ) : (
      // 관리자: 바로 관리자 대시보드 링크
      <Link to="/dashboard" className="border-b-2 border-primary">
        Dashboard
      </Link>
    )
  ) : (
    <Link to="/login">
      <HiOutlineUser className="size-6" />
    </Link>
  );
}

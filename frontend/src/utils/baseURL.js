// 배포: same-origin '/api'
// 로컬: vite proxy가 '/api'를 백엔드로 프록시
const getBaseUrl = () => import.meta.env.VITE_API_URL || "/api";
export default getBaseUrl;

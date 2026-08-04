import { Navigate } from 'react-router-dom';

/** Admin Panel hub removed — features live directly in the sidebar. */
export default function AdminPanel() {
  return <Navigate to="/dashboard" replace />;
}

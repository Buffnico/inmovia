// apps/web/src/App.tsx
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="root-bg">
      <Outlet />
    </div>
  );
}

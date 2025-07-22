import { Route, Routes } from "react-router-dom";
import UploadFilePage from "./pages/upload-file";
import CreateTokenPage from "./pages/create-token";
import ManageTokenPage from "./pages/manage-token";
import LutsPage from "./pages/luts";
import SaveMe from "./pages/save-me";

export default function Router() {
  return (
    <Routes>
      <Route index element={<UploadFilePage />} />
      <Route path="create-token" element={<CreateTokenPage />} />
      <Route path="manage-token/:mint?" element={<ManageTokenPage />} />
      <Route path="luts/:lut?" element={<LutsPage />} />
      <Route path="save-me" element={<SaveMe />} />
    </Routes>
  );
}

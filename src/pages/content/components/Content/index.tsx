import { createRoot } from "react-dom/client";
import App from "@src/pages/content/components/Content/app";

const root = document.createElement("div");
root.id = "content-view-root";
document.body.append(root);

createRoot(root).render(<App />);

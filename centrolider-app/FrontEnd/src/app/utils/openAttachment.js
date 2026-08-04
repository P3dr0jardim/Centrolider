// Fetches a vehicle attachment (auth required, so it can't be a plain <a href>) and shows it in a
// new tab — inline for PDFs/images, downloaded otherwise. Opens the tab synchronously (before the
// fetch resolves) so browsers don't treat it as a blocked popup, then navigates it once ready.
export async function openAttachment(vehicleId, att) {
  const newTab = window.open("", "_blank");
  try {
    const base = import.meta.env.VITE_API_BASE ?? "/api";
    const token = localStorage.getItem("cl_token");
    const res = await fetch(`${base}/vehicles/${vehicleId}/attachments/${att._id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao descarregar ficheiro");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const inline = blob.type.startsWith("image/") || blob.type === "application/pdf";

    if (inline && newTab) {
      newTab.location.href = url;
    } else {
      newTab?.close();
      const a = document.createElement("a");
      a.href = url;
      a.download = att.originalName || att.filename || "ficheiro";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (err) {
    newTab?.close();
    throw err;
  }
}

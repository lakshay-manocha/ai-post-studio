import { toPng } from "html-to-image";
import type { GeneratedPost } from "./types";

export type ExportSize = "square" | "landscape";

const SIZES: Record<ExportSize, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  landscape: { w: 1200, h: 627 },
};

/**
 * Renders a clean, LinkedIn-feed-style card off-screen (full opacity, white bg,
 * no app chrome), exports it as PNG at the requested size, and triggers download.
 */
export async function exportLinkedInImage(
  post: GeneratedPost,
  size: ExportSize = "square",
): Promise<void> {
  const { w, h } = SIZES[size];
  const PADDING = 64;
  const cardW = w - PADDING * 2;

  const root = document.createElement("div");
  root.style.cssText = `
    position: fixed; left: -10000px; top: 0;
    width: ${w}px; height: ${h}px;
    background: #FFFFFF;
    display: flex; align-items: center; justify-content: center;
    padding: ${PADDING}px; box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #000000;
  `;

  const hashtagsHtml = post.hashtags
    .map(
      (h) =>
        `<span style="color:#0A66C2;font-weight:600;font-size:18px;margin-right:8px;">#${h}</span>`,
    )
    .join("");

  const bodyText = post.content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  root.innerHTML = `
    <div style="
      width: ${cardW}px;
      max-height: ${h - PADDING * 2}px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      padding: 32px 36px;
      box-sizing: border-box;
      display: flex; flex-direction: column; gap: 20px;
      overflow: hidden;
    ">
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="
          width:56px; height:56px; border-radius:50%;
          background: linear-gradient(135deg, #0A66C2, #378FE9);
          color:#fff; font-weight:700; font-size:20px;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        ">AI</div>
        <div style="display:flex; flex-direction:column; gap:2px; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px; font-weight:700; color:#000;">Postwright</span>
            <span style="
              font-size:11px; font-weight:600;
              background:#EEF3F8; color:#0A66C2;
              padding:3px 8px; border-radius:4px;
              text-transform:uppercase; letter-spacing:0.04em;
            ">AI Generated</span>
          </div>
          <span style="font-size:13px; color:#666; font-weight:400;">Just now · 🌐</span>
        </div>
      </div>

      <div style="
        font-size: ${size === "landscape" ? "18px" : "20px"};
        line-height: 1.55;
        color: #000000;
        font-weight: 400;
        white-space: pre-wrap;
        word-wrap: break-word;
      ">${bodyText}</div>

      ${
        post.hashtags.length
          ? `<div style="display:flex; flex-wrap:wrap; gap:4px;">${hashtagsHtml}</div>`
          : ""
      }
    </div>
  `;

  document.body.appendChild(root);
  try {
    const dataUrl = await toPng(root, {
      pixelRatio: 1,
      width: w,
      height: h,
      backgroundColor: "#FFFFFF",
      cacheBust: true,
    });
    const a = document.createElement("a");
    a.download = `linkedin-post-${size}-${post.id.slice(0, 6)}.png`;
    a.href = dataUrl;
    a.click();
  } finally {
    document.body.removeChild(root);
  }
}

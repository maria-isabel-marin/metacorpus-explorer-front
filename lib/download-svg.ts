/**
 * Serialize an SVG element and trigger a download.
 * Injects computed CSS custom-property values so the exported file
 * renders correctly outside the app.
 */
export function downloadSvgElement(
  svgEl: SVGSVGElement,
  filename: string,
) {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Resolve CSS custom properties used in fill / stroke / color
  const computed = getComputedStyle(document.documentElement);
  const vars: Record<string, string> = {
    "--text": computed.getPropertyValue("--text").trim() || "#1e293b",
    "--text-faint": computed.getPropertyValue("--text-faint").trim() || "#94a3b8",
    "--border": computed.getPropertyValue("--border").trim() || "#e2e8f0",
    "--primary": computed.getPropertyValue("--primary").trim() || "#3b82f6",
    "--surface": computed.getPropertyValue("--surface").trim() || "#ffffff",
  };

  // Inject a <style> block that defines those variables as solid colors
  const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleEl.textContent = `:root{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";")}}`;
  clone.insertBefore(styleEl, clone.firstChild);

  // Ensure the SVG has xmlns
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const svgData = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".svg") ? filename : `${filename}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export a canvas element (e.g. vis-network) as PNG.
 */
export function downloadCanvasAsPng(
  canvasEl: HTMLCanvasElement,
  filename: string,
) {
  const url = canvasEl.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.click();
}

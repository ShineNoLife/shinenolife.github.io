export async function loadIncludes() {
  const nodes = Array.from(document.querySelectorAll("[data-include]"));

  await Promise.all(nodes.map(async (node) => {
    const url = node.getAttribute("data-include");
    if (!url) return;

    try {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      node.outerHTML = await response.text();
    } catch (error) {
      node.outerHTML = `<!-- include failed: ${url} (${error.message}) -->`;
    }
  }));
}

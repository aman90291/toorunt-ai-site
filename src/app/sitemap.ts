import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE = "https://toorunt.ai";
const paths = ["", "/product", "/security", "/pricing", "/manifesto", "/book"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `${SITE}${p}/`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}

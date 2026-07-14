import type { MetadataRoute } from "next";
import { getBlogs, getCategories, getCombos, getProducts } from "@/lib/api-server";
import { SITE_URL } from "@/lib/site-config";

const STATIC_ROUTES = ["", "/tim-kiem", "/flash-sale", "/combo", "/blog"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, combos, blogs] = await Promise.all([
    getCategories(),
    getProducts({ limit: 100 }),
    getCombos(),
    getBlogs({ page: 1 }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/danh-muc/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.data.map((product) => ({
    url: `${SITE_URL}/san-pham/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const comboEntries: MetadataRoute.Sitemap = combos.map((combo) => ({
    url: `${SITE_URL}/combo/${combo.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogs.data.map((blog) => ({
    url: `${SITE_URL}/blog/${blog.slug}`,
    lastModified: blog.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries, ...comboEntries, ...blogEntries];
}

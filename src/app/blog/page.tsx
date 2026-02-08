import { getAllPosts } from "@/lib/blog-posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — GrowthLens | LinkedIn Growth Tips & Strategies",
  description:
    "Actionable LinkedIn growth strategies, engagement tips, and profile optimization guides for founders and professionals.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-3">Blog</h1>
        <p className="text-slate-400 text-lg mb-12">
          Actionable LinkedIn growth strategies backed by data.
        </p>

        <div className="space-y-6">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8 transition-all hover:border-accent/40 hover:bg-slate-800/60">
                <time className="text-sm text-slate-500 font-medium">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="text-xl font-bold text-white mt-2 mb-3 group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  {post.excerpt}
                </p>
                <span className="inline-block mt-4 text-accent text-sm font-semibold">
                  Read more →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

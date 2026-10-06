import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const [
    servicesCount, packagesCount, articlesCount,
    consultationsCount, usersCount, testimonialsCount,
  ] = await Promise.all([
    db.service.count(),
    db.businessPackage.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.consultationRequest.count(),
    db.user.count({ where: { role: "USER" } }),
    db.testimonial.count(),
  ]);

  const landing = await db.landingBlock.findMany({ where: { section: "stats" } });
  const stats: Record<string, string> = {};
  for (const b of landing) stats[b.key] = b.value;

  const settings = await getSettings(["site.title", "site.tagline"]);

  return ok({
    counts: {
      services: servicesCount, packages: packagesCount, articles: articlesCount,
      consultations: consultationsCount, users: usersCount, testimonials: testimonialsCount,
    },
    stats,
    settings,
  });
}

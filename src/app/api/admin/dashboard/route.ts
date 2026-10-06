import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireAdmin } from "@/lib/api";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });

  const [
    users, activeUsers, articles, publishedArticles, services, packages,
    consultations, pendingConsultations, customPackages, pendingCustomPackages,
    aiMessages, logsCount, backups, testimonials, faqs, team, newsletter,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.article.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.service.count(),
    db.businessPackage.count(),
    db.consultationRequest.count(),
    db.consultationRequest.count({ where: { status: "NEW" } }),
    db.customPackageRequest.count(),
    db.customPackageRequest.count({ where: { status: "NEW" } }),
    db.aiMessage.count(),
    db.activityLog.count(),
    db.backupRecord.count(),
    db.testimonial.count(),
    db.faq.count(),
    db.teamMember.count(),
    db.newsletter.count(),
  ]);

  const recentUsers = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, mobile: true, fullName: true, createdAt: true, status: true } });
  const recentConsultations = await db.consultationRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, mobile: true, topic: true, status: true, createdAt: true } });
  const recentLogs = await db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, actor: true, action: true, ip: true, createdAt: true } });

  // growth: users per day last 14 days (sqlite: use createdAt filtering)
  const since = new Date(Date.now() - 14 * 86400000);
  const newUsers = await db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  const dayMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const u of newUsers) {
    const k = u.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(k)) dayMap.set(k, (dayMap.get(k) || 0) + 1);
  }
  const growth = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

  return ok({
    counts: { users, activeUsers, articles, publishedArticles, services, packages, consultations, pendingConsultations, customPackages, pendingCustomPackages, aiMessages, logs: logsCount, backups, testimonials, faqs, team, newsletter },
    recentUsers, recentConsultations, recentLogs, growth,
  });
}

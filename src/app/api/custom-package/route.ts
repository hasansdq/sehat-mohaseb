import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { normalizeMobile, isValidMobile } from "@/lib/auth";
import { ok, fail, getAuthContext } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessName = (body.businessName ?? "").toString().trim() || null;
    const businessType = (body.businessType ?? "").toString().trim() || null;
    const employeeCount = Number(body.employeeCount) || null;
    const monthlyTransactions = Number(body.monthlyTransactions) || null;
    const needsSoftware = !!body.needsSoftware;
    const needsTraining = !!body.needsTraining;
    const needsTax = !!body.needsTax;
    const needsPayroll = !!body.needsPayroll;
    const budget = (body.budget ?? "").toString().trim() || null;
    const notes = (body.notes ?? "").toString().trim() || null;
    const suggestedPlan = (body.suggestedPlan ?? "").toString().trim() || null;
    const aiSummary = (body.aiSummary ?? "").toString().trim() || null;
    const contactName = (body.contactName ?? "").toString().trim() || businessName;
    const contactMobile = normalizeMobile(body.contactMobile ?? "");

    const ctx = await getAuthContext(req);

    const created = await db.customPackageRequest.create({
      data: {
        userId: ctx.user?.id ?? null,
        businessName, businessType, employeeCount, monthlyTransactions,
        needsSoftware, needsTraining, needsTax, needsPayroll, budget, notes,
        suggestedPlan, aiSummary, contactName,
        contactMobile: isValidMobile(contactMobile) ? contactMobile : null,
      },
    });
    return ok({ id: created.id });
  } catch (e: any) {
    return fail("خطا در ثبت پک اختصاصی.", 500, { detail: e?.message });
  }
}

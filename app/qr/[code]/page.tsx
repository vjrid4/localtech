import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function QrRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const tech = await prisma.technicianProfile.findUnique({
    where: { publicSlug: code },
    select: { id: true, isActive: true },
  });

  void logEvent({
    type: "qr.scan",
    actorType: "CUSTOMER",
    subjectType: tech ? "technician_profile" : "qr_unknown",
    subjectId: tech?.id ?? code,
    payload: { code },
  });

  if (tech?.isActive) {
    redirect(`/book?source=qr&tech=${code}`);
  }
  redirect(`/book?source=qr`);
}

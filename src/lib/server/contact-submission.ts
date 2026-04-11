import "server-only";

import { prisma } from "@/lib/db/prisma";
import { normalizeLeadEmail } from "@/lib/normalize-email";

export type ContactSubmissionInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  enquiryType?: string | null;
};

export async function createContactSubmission(input: ContactSubmissionInput): Promise<{ createdAt: Date }> {
  const row = await prisma.contactSubmission.create({
    data: {
      name: input.name.trim(),
      email: normalizeLeadEmail(input.email),
      subject: input.subject.trim(),
      message: input.message.trim(),
      enquiryType: input.enquiryType?.trim() || null,
    },
    select: { createdAt: true },
  });
  return { createdAt: row.createdAt };
}

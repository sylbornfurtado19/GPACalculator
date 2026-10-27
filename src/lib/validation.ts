import { z } from "zod";

export const SubjectSchema = z.object({
  id: z.string().min(1, "Subject ID is required"),
  name: z.string().min(1, "Subject name cannot be empty").trim(),
  code: z.string().optional(),
  credits: z.number().positive("Credits must be greater than zero"),
  courseType: z.enum(["standard", "ica-only"]),
  icaMarks: z.number().min(0, "ICA marks cannot be negative"),
  icaMax: z.number().positive().default(50),
  seeMarks: z.number().min(0, "SEE marks cannot be negative").default(0),
  seeMax: z.number().positive().default(100),
  isIcaAbsent: z.boolean().optional(),
  isSeeAbsent: z.boolean().optional(),
  isIcaLocked: z.boolean().optional(),
  isSeeLocked: z.boolean().optional(),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
}).refine(
  (data) => data.icaMarks <= data.icaMax,
  {
    message: "ICA marks cannot exceed maximum ICA marks",
    path: ["icaMarks"],
  }
).refine(
  (data) => data.courseType === "ica-only" || data.seeMarks <= data.seeMax,
  {
    message: "SEE/TEE marks cannot exceed maximum SEE marks",
    path: ["seeMarks"],
  }
);

export const AcademicExportSchema = z.object({
  version: z.number().default(1),
  app: z.string().default("GPA Calculator"),
  timestamp: z.union([z.number(), z.string()]).optional(),
  semesterLabel: z.string().default("Semester 1"),
  targetSgpa: z.number().min(0).max(10).default(8.5),
  subjects: z.array(SubjectSchema),
});

export type ValidatedSubject = z.infer<typeof SubjectSchema>;
export type ValidatedExportData = z.infer<typeof AcademicExportSchema>;

export function validateExportJson(jsonString: string): {
  success: boolean;
  data?: ValidatedExportData;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const result = AcademicExportSchema.safeParse(parsed);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid schema format";
      return { success: false, error: firstError };
    }
    return { success: true, data: result.data };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Invalid JSON syntax";
    return { success: false, error: errorMsg };
  }
}

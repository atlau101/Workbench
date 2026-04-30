export interface Course {
  id: string;
  instructor_id: string;
  name: string;
  created_at: string;
}

export type EnrollmentStatus = "pending" | "accepted" | "declined";

export interface Enrollment {
  id: string;
  course_id: string;
  student_email: string;
  student_id: string | null;
  status: EnrollmentStatus;
  invited_by: string;
  invited_at: string;
  responded_at: string | null;
}

export interface EnrolledCourse {
  enrollment_id: string;
  course: Course & { instructor_email: string };
  assignments: Array<{ id: string; title: string }>;
}

export interface PendingInvite {
  enrollment_id: string;
  course_id: string;
  course_name: string;
  instructor_email: string;
}

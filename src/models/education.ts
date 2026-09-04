export interface Course {
  id: string;
  name: string;
  professor?: string;
  credits: number;
  color: string;
}

export type AssignmentType = 'examen' | 'tarea' | 'proyecto' | 'lectura';
export type AssignmentStatus = 'pending' | 'completed' | 'overdue';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  type: AssignmentType;
  dueDate: Date;
  status: AssignmentStatus;
  weight?: number; // 0-100 percentage weight for grade
  grade?: number; // the actual grade obtained (e.g. 4.5)
}

export interface StudySession {
  id: string;
  courseId: string;
  durationMinutes: number;
  date: Date;
  xpEarned: number;
}

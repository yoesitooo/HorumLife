import type { Course, Assignment, StudySession } from '../../models/education';
import { StorageService } from './StorageService';
import { LifeOSService } from './LifeOSService';

const COURSES_STORAGE_KEY = 'edu_courses';
const ASSIGNMENTS_STORAGE_KEY = 'edu_assignments';
const SESSIONS_STORAGE_KEY = 'edu_study_sessions';

export class EducationService {
  private static instance: EducationService;
  private storage: StorageService;
  private lifeOsService: LifeOSService;
  
  private listeners: ((courses: Course[], assignments: Assignment[], sessions: StudySession[]) => void)[] = [];

  private constructor() {
    this.storage = StorageService.getInstance();
    this.lifeOsService = LifeOSService.getInstance();
    this.initializeDefaults();
  }

  public static getInstance(): EducationService {
    if (!EducationService.instance) {
      EducationService.instance = new EducationService();
    }
    return EducationService.instance;
  }

  public subscribe(listener: (courses: Course[], assignments: Assignment[], sessions: StudySession[]) => void) {
    this.listeners.push(listener);
    listener(this.getCourses(), this.getAssignments(), this.getStudySessions());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const courses = this.getCourses();
    const assignments = this.getAssignments();
    const sessions = this.getStudySessions();
    this.listeners.forEach(l => l(courses, assignments, sessions));
  }

  private initializeDefaults() {
    if (!this.storage.get(COURSES_STORAGE_KEY)) {
      this.storage.set(COURSES_STORAGE_KEY, []);
    }
    if (!this.storage.get(ASSIGNMENTS_STORAGE_KEY)) {
      this.storage.set(ASSIGNMENTS_STORAGE_KEY, []);
    }
    if (!this.storage.get(SESSIONS_STORAGE_KEY)) {
      this.storage.set(SESSIONS_STORAGE_KEY, []);
    }
  }

  public getCourses(): Course[] {
    return this.storage.get<Course[]>(COURSES_STORAGE_KEY) || [];
  }

  public getAssignments(): Assignment[] {
    return this.storage.get<Assignment[]>(ASSIGNMENTS_STORAGE_KEY) || [];
  }

  public getStudySessions(): StudySession[] {
    return this.storage.get<StudySession[]>(SESSIONS_STORAGE_KEY) || [];
  }

  // --- Actions ---

  public addCourse(name: string, credits: number, color: string, professor?: string) {
    const courses = this.getCourses();
    const newCourse: Course = {
      id: 'course_' + Date.now(),
      name,
      credits,
      color,
      professor
    };
    this.storage.set(COURSES_STORAGE_KEY, [...courses, newCourse]);
    this.notifyListeners();
  }

  public addAssignment(courseId: string, title: string, type: Assignment['type'], dueDate: Date, weight?: number) {
    const assignments = this.getAssignments();
    const newAss: Assignment = {
      id: 'ass_' + Date.now(),
      courseId,
      title,
      type,
      dueDate,
      status: 'pending',
      weight
    };
    this.storage.set(ASSIGNMENTS_STORAGE_KEY, [...assignments, newAss]);
    this.notifyListeners();
  }

  public completeAssignment(id: string, grade?: number) {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(a => a.id === id);
    if (index !== -1 && assignments[index].status !== 'completed') {
      assignments[index].status = 'completed';
      assignments[index].grade = grade;
      this.storage.set(ASSIGNMENTS_STORAGE_KEY, assignments);
      
      // RPG Reward
      // Base XP depends on the assignment type
      let xpReward = 50;
      let coinReward = 5;
      
      if (assignments[index].type === 'examen') {
        xpReward = 300;
        coinReward = 30;
      } else if (assignments[index].type === 'proyecto') {
        xpReward = 200;
        coinReward = 20;
      }

      // Bonus if grade is high
      if (grade && grade >= 4.0) {
        xpReward = Math.floor(xpReward * 1.5);
        coinReward = Math.floor(coinReward * 1.5);
      }

      this.lifeOsService.addXP('intelecto', xpReward);
      this.lifeOsService.addCoins(coinReward);
      this.notifyListeners();
    }
  }

  public logStudySession(courseId: string, durationMinutes: number) {
    const sessions = this.getStudySessions();
    // 1 XP per minute studied
    const xpEarned = durationMinutes;
    
    const newSession: StudySession = {
      id: 'session_' + Date.now(),
      courseId,
      durationMinutes,
      date: new Date(),
      xpEarned
    };
    
    this.storage.set(SESSIONS_STORAGE_KEY, [...sessions, newSession]);
    this.lifeOsService.addXP('intelecto', xpEarned);
    
    // Every 50 mins = 1 coin
    if (durationMinutes >= 50) {
      this.lifeOsService.addCoins(Math.floor(durationMinutes / 50));
    }
    
    this.notifyListeners();
  }
}

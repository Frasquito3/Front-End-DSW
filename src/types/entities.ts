export type UserRole = 'student' | 'professor' | 'admin';

export interface User {
  id: string;
  name: string;
  surname: string;
  mail: string;
  profile_picture?: string;
  phone?: string;
  location?: string;
  birthdate?: string;
  role: UserRole;
  studentProfile?: Student;
  professorProfile?: ProfessorDTO;
  password?: string;
}

export interface ProfessorDTO {
  id: string;
  // Cuando viene de la API completa (endpoints internos)
  user: User;
  state?: string;
  courses?: Course[];
  // Cuando viene de la API pública (simplificado)
  name?: string;
  surname?: string;
  profilePicture?: string;
  institution?: Institution;
  managedInstitution?: Institution;
}

export interface Student {
  id: string;
  user: User;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  institution?: Institution;
  imageUrl: string;
  courseType: CourseType;
  professor: ProfessorDTO;
  isFree: boolean;
  priceInCents?: number; // Precio en centavos (ej: 10050 = $100.50)
  status: string;
  rating?: number;
  studentsCount?: number;
  unitsCount?: number; // Contador de unidades (para vistas públicas)
  students?: Student[]; // Solo presente en vistas autorizadas
  units?: Unit[]; // Solo presente para usuarios inscritos
}

export interface CourseType {
  id: string;
  name: string;
  description: string;
  courses: Course[];
}

export interface Institution {
  institutionId?: string; // Opcional en respuestas públicas
  id?: string; // Algunas respuestas usan 'id' en lugar de 'institutionId'
  name: string;
  description?: string;
  normalizedName?: string;
  aliases?: string[];
  manager?: ProfessorDTO;
  professors?: ProfessorDTO[];
}

export type EnrollmentState = 'enrolled' | 'completed' | 'dropped';

export interface Enrollment {
  id: string;
  student: Student;
  course: Course;
  enrolledAt: string; // ISO date string
  state: EnrollmentState;
  grade?: number;
  progress?: number; // Percentage (0-100)
  completedUnits: number[]; // Array de unitNumbers completados
}

export interface Appeal {
  id: string;
  expertise: string;
  experienceMotivation: string;
  documentUrl?: string;
  state: 'pending' | 'accepted' | 'rejected';
  user: User;
  date: Date;
}

export interface JoinRequest {
  id: string;
  professor: ProfessorDTO;
  institution: Institution | string;
  requestDate: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface QuestionPayload {
  options: string[];
  correctAnswer?: number | string; // Opcional - solo disponible para profesores
}

export const QuestionType = {
  MultipleChoiceOption: 'MultipleChoiceOption',
} as const;

export type QuestionTypeValue =
  (typeof QuestionType)[keyof typeof QuestionType];

export type QuestionAnswerType = 'multiple_choice' | 'open_ended';

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id?: string;
  questionText: string;
  questionType: QuestionTypeValue;
  payload: QuestionPayload;
  unitNumber?: number;
  // Propiedades adicionales para evaluaciones (assessments)
  text?: string; // Texto de la pregunta
  type?: QuestionAnswerType; // Tipo de respuesta esperada
  points?: number; // Puntos asignados a la pregunta
  options?: MultipleChoiceOption[]; // Opciones para preguntas de opción múltiple
}

// Versión de Question SIN respuestas correctas para estudiantes
export interface QuestionForStudent {
  id: string;
  text: string;
  type: QuestionAnswerType;
  points: number;
  options?: StudentMultipleChoiceOption[]; // Sin campo isCorrect
}

// Opción de múltiple opción SIN la respuesta correcta
export interface StudentMultipleChoiceOption {
  id: string;
  text: string;
  // NO incluye isCorrect
}

export interface Material {
  // ⚠️ Material es embeddable - NO tiene id propio
  title: string;
  url: string;
}

export interface Unit {
  // ⚠️ Unit es embeddable - NO tiene id propio
  unitNumber: number; // Identificador único + orden
  name: string;
  description?: string;
  // Para vista pública (no inscrito)
  materialsCount?: number;
  questionsCount?: number;
  // Para vista inscrito (con contenido completo)
  detail?: string; // Contenido principal
  questions?: string[]; // Referencias a Question IDs
  materials?: Material[]; // Materiales embebidos
}

// Tipos específicos para edición de cursos
export interface CreateUnitRequest {
  name: string;
  detail?: string;
  unitNumber: number;
}

export interface UpdateUnitRequest {
  name?: string;
  detail?: string;
}

export interface ReorderUnitsRequest {
  units: { unitNumber: number; newOrder: number }[];
}

export interface CreateMaterialRequest {
  title: string;
}

export interface QuickSaveRequest {
  type: 'course-config' | 'unit-content' | 'unit-materials' | 'unit-questions';
  data:
    | CourseConfigData
    | UnitContentData
    | UnitMaterialsData
    | UnitQuestionsData;
}

export interface CourseConfigData {
  name?: string;
  description?: string;
  status?: string;
  isFree?: boolean;
  priceInCents?: number; // Precio en centavos
}

export interface UnitContentData {
  unitNumber: number;
  detail: string;
}

export interface UnitMaterialsData {
  unitNumber: number;
  materials: Material[];
}

export interface UnitQuestionsData {
  unitNumber: number;
  questions: string[];
}

// Tipos extendidos para el editor (incluyen datos locales)
export interface UnitEditorData extends Unit {
  // Datos adicionales para el editor
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
}

export interface MaterialEditorData extends Material {
  id?: string | number; // ID temporal para el editor
  file?: File; // Archivo pendiente de subida
  isUploading?: boolean;
}

// Tipos para Assessments (Evaluaciones Formales)
export interface Assessment {
  id: string;
  title: string;
  description?: string;
  course: {
    id: string;
    name: string;
  };
  questions: Question[];
  durationMinutes?: number | null;
  passingScore: number;
  maxAttempts?: number | null;
  isActive: boolean;
  availableFrom?: string;
  availableUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssessmentRequest {
  title: string;
  description?: string;
  courseId: string;
  questionIds: string[];
  durationMinutes?: number | null;
  passingScore?: number;
  maxAttempts?: number | null;
  isActive?: boolean;
  availableFrom?: string;
  availableUntil?: string;
}

export interface UpdateAssessmentRequest {
  title?: string;
  description?: string;
  questionIds?: string[];
  durationMinutes?: number | null;
  passingScore?: number;
  maxAttempts?: number | null;
  isActive?: boolean;
  availableFrom?: string;
  availableUntil?: string;
}

export type AssessmentAttemptStatus = 'in_progress' | 'submitted';

export interface AssessmentAttempt {
  id: string;
  student: {
    id: string;
    name: string;
    surname?: string;
  };
  assessment: {
    id: string;
    title: string;
    course?: {
      id: string;
      name: string;
    };
    passingScore?: number; // Nota mínima para aprobar
  };
  status: AssessmentAttemptStatus;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  passed?: boolean;
  attemptNumber: number;
  answers?: AttemptAnswer[];
  timeSpent?: number; // Tiempo invertido en minutos
}

export interface AttemptAnswer {
  id: string;
  question: Question;
  answer: number | string;
  isCorrect: boolean;
  answeredAt: string;
  // Propiedades adicionales
  selectedOptions?: string[]; // IDs de opciones seleccionadas (para multiple choice)
  textAnswer?: string; // Respuesta de texto libre (para open ended)
  feedback?: string; // Feedback del profesor sobre la respuesta
  points?: number; // Puntos obtenidos en esta respuesta
}

export interface StartAttemptRequest {
  assessmentId: string;
  studentId: string;
}

export interface AnswerQuestionRequest {
  attemptId: string;
  questionId: string;
  answer: number | string;
}

export interface SubmitAttemptRequest {
  attemptId: string;
  answers: {
    questionId: string;
    answer: number | string;
  }[];
}

export type AssessmentStatus =
  | 'available'
  | 'completed'
  | 'expired'
  | 'no_attempts_left';

export interface AssessmentSummary {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  passingScore: number;
  availableUntil?: string;
  questionsCount: number;
  attemptsCount: number;
  maxAttempts?: number;
  attemptsRemaining?: number;
  bestScore?: number;
  lastAttemptDate?: string;
  status: AssessmentStatus;
  hasActiveAttempt: boolean;
}

export interface AssessmentWithMetadata extends Assessment {
  questionsCount: number;
  attemptsCount: number;
  maxAttempts?: number;
  attemptsRemaining?: number;
  bestScore?: number;
  lastAttemptDate?: string;
  status: AssessmentStatus;
}

export interface PendingAssessment {
  id: string;
  title: string;
  course: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  description?: string;
  duration?: number;
  availableUntil?: string;
  passingScore: number;
  questionsCount: number;
  attemptsRemaining?: number;
  maxAttempts?: number;
  status: AssessmentStatus;
}

export interface SaveAnswersRequest {
  answers: {
    questionId: string;
    answer: number | string;
  }[];
}

export interface SaveAnswersResponse {
  id: string;
  status: AssessmentAttemptStatus;
  answersCount: number;
  lastSavedAt: string;
}

export interface StartAttemptResponse {
  id: string;
  assessment: {
    id: string;
    title: string;
    durationMinutes?: number | null;
    passingScore: number;
    questions: QuestionForStudent[];
  };
  student: string;
  startedAt: string;
  submittedAt: null;
  score: null;
  passed: null;
  answers: AttemptAnswer[];
  status: AssessmentAttemptStatus;
  timeSpent: number;
}

export interface StudentAttemptSummary {
  studentId: string;
  studentName: string;
  attempts: number;
  bestScore: number;
  passed: boolean;
  lastAttemptDate?: string;
}

export interface QuestionStatistic {
  questionId: string;
  questionText: string;
  correctAnswers: number;
  totalAnswers: number;
  successRate: number;
}

export interface AssessmentStatistics {
  assessmentId: string;
  title: string;
  totalAttempts: number;
  uniqueStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  attemptsByStudent: StudentAttemptSummary[];
  questionStatistics: QuestionStatistic[];
}

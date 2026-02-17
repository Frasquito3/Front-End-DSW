import apiClient from '../apiClient';
import type {
  Assessment,
  AssessmentSummary,
  AssessmentWithMetadata,
  AssessmentAttempt,
  PendingAssessment,
  StartAttemptResponse,
  SaveAnswersRequest,
  SaveAnswersResponse,
  SubmitAttemptRequest,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  AssessmentStatistics,
} from '../../types/entities';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * Endpoint #1: Obtener evaluaciones de un curso
 * GET /api/courses/:courseId/assessments
 */
const getAssessmentsByCourse = async (
  courseId: string
): Promise<AssessmentSummary[]> => {
  const response = await apiClient.get<ApiResponse<AssessmentSummary[]>>(
    `/courses/${courseId}/assessments`
  );
  return response.data.data;
};

/**
 * Endpoint #2: Obtener detalle de una evaluación
 * GET /api/assessments/:assessmentId
 */
const getById = async (
  assessmentId: string
): Promise<AssessmentWithMetadata> => {
  const response = await apiClient.get<ApiResponse<AssessmentWithMetadata>>(
    `/assessments/${assessmentId}`
  );
  return response.data.data;
};

/**
 * Endpoint #3: Iniciar un intento de evaluación
 * POST /api/assessments/:assessmentId/attempts
 */
const startAttempt = async (
  assessmentId: string,
  studentId: string
): Promise<StartAttemptResponse> => {
  const response = await apiClient.post<ApiResponse<StartAttemptResponse>>(
    `/assessments/${assessmentId}/attempts`,
    { studentId }
  );
  return response.data.data;
};

/**
 * Endpoint: Obtener intento activo (si existe)
 * GET /api/assessments/:assessmentId/active-attempt
 */
const getActiveAttempt = async (
  assessmentId: string
): Promise<StartAttemptResponse | null> => {
  const response = await apiClient.get<ApiResponse<StartAttemptResponse | null>>(
    `/assessments/${assessmentId}/active-attempt`
  );
  return response.data.data;
};

/**
 * Endpoint #4: Guardar/actualizar respuestas (auto-save)
 * PATCH /api/assessments/attempts/:attemptId/answers
 */
const saveAnswers = async (
  attemptId: string,
  answers: SaveAnswersRequest['answers']
): Promise<SaveAnswersResponse> => {
  const response = await apiClient.patch<ApiResponse<SaveAnswersResponse>>(
    `/assessments/attempts/${attemptId}/answers`,
    { answers }
  );
  return response.data.data;
};

/**
 * Endpoint #5: Enviar evaluación (submit)
 * POST /api/assessments/attempts/:attemptId/submit
 */
const submitAttempt = async (
  attemptId: string,
  submitData: SubmitAttemptRequest
): Promise<AssessmentAttempt> => {
  const response = await apiClient.post<ApiResponse<AssessmentAttempt>>(
    `/assessments/attempts/${attemptId}/submit`,
    submitData
  );
  return response.data.data;
};

/**
 * Endpoint #6: Obtener resultado de un intento
 * GET /api/assessments/attempts/:attemptId
 */
const getAttemptById = async (
  attemptId: string
): Promise<AssessmentAttempt> => {
  const response = await apiClient.get<ApiResponse<AssessmentAttempt>>(
    `/assessments/attempts/${attemptId}`
  );
  return response.data.data;
};

/**
 * Endpoint #7: Listar intentos de una evaluación
 * GET /api/assessments/:assessmentId/attempts
 */
const getAttemptsByAssessment = async (
  assessmentId: string
): Promise<AssessmentAttempt[]> => {
  const response = await apiClient.get<ApiResponse<AssessmentAttempt[]>>(
    `/assessments/${assessmentId}/attempts`
  );
  return response.data.data;
};

/**
 * Endpoint #8: Listar evaluaciones pendientes del estudiante
 * GET /api/students/:studentId/assessments/pending
 */
const getPendingAssessments = async (
  studentId: string
): Promise<PendingAssessment[]> => {
  const response = await apiClient.get<ApiResponse<PendingAssessment[]>>(
    `/students/${studentId}/assessments/pending`
  );

  return response.data.data;
};

/**
 * Crear una nueva evaluación (para profesores)
 * POST /api/assessments
 */
const create = async (data: CreateAssessmentRequest): Promise<Assessment> => {
  const response = await apiClient.post<ApiResponse<Assessment>>(
    '/assessments',
    data
  );
  return response.data.data;
};

/**
 * Actualizar una evaluación (para profesores)
 * PATCH /api/assessments/:assessmentId
 */
const update = async (
  id: string,
  data: UpdateAssessmentRequest
): Promise<Assessment> => {
  const response = await apiClient.patch<ApiResponse<Assessment>>(
    `/assessments/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Eliminar una evaluación (para profesores)
 * DELETE /api/assessments/:assessmentId
 */
const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`/assessments/${id}`);
};

/**
 * Obtener estadísticas de una evaluación (para profesores)
 * GET /api/assessments/:assessmentId/statistics
 */
const getAssessmentStatistics = async (assessmentId: string): Promise<AssessmentStatistics> => {
  const response = await apiClient.get<ApiResponse<AssessmentStatistics>>(
    `/assessments/${assessmentId}/statistics`
  );
  return response.data.data;
};

/**
 * Obtener todos los intentos de una evaluación (para profesores)
 * GET /api/assessments/:assessmentId/all-attempts
 */
const getAllAttemptsForProfessor = async (assessmentId: string): Promise<AssessmentAttempt[]> => {
    const response = await apiClient.get<ApiResponse<AssessmentAttempt[]>>(
        `/assessments/${assessmentId}/all-attempts`
    );
    return response.data.data;
};

const assessmentService = {
  getAssessmentsByCourse,
  getById,
  startAttempt,
  getActiveAttempt,
  saveAnswers,
  submitAttempt,
  getAttemptById,
  getAttemptsByAssessment,
  getPendingAssessments,
  create,
  update,
  remove,
  getAssessmentStatistics,
  getAllAttemptsForProfessor,
};

export default assessmentService;

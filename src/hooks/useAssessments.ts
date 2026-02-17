import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import assessmentService from '../api/services/assessment.service';
import apiClient from '../api/apiClient';
import type {
  Assessment,
  AssessmentSummary,
  AssessmentWithMetadata,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  AssessmentAttempt,
  StartAttemptResponse,
  SaveAnswersRequest,
  SaveAnswersResponse,
  SubmitAttemptRequest,
  AssessmentStatistics,
} from '../types/entities';

/**
 * Endpoint #1: Obtener evaluaciones de un curso con metadata del estudiante
 */
export const useAssessmentsByCourse = (courseId: string | undefined) => {
  return useQuery<AssessmentSummary[], Error>({
    queryKey: ['assessments', 'course', courseId],
    queryFn: () => assessmentService.getAssessmentsByCourse(courseId!),
    enabled: !!courseId,
  });
};

/**
 * Endpoint #2: Obtener detalle de una evaluación con metadata
 */
export const useAssessment = (id: string | undefined) => {
  return useQuery<AssessmentWithMetadata, Error>({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getById(id!),
    enabled: !!id,
  });
};

/**
 * Endpoint #7: Listar intentos de una evaluación
 */
export const useAssessmentAttempts = (assessmentId: string | undefined) => {
  return useQuery<AssessmentAttempt[], Error>({
    queryKey: ['assessment-attempts', assessmentId],
    queryFn: () => assessmentService.getAttemptsByAssessment(assessmentId!),
    enabled: !!assessmentId,
  });
};

/**
 * Endpoint #6: Obtener resultado de un intento
 */
export const useAttemptDetails = (attemptId: string | undefined) => {
  return useQuery<AssessmentAttempt, Error>({
    queryKey: ['attempt', attemptId],
    queryFn: () => assessmentService.getAttemptById(attemptId!),
    enabled: !!attemptId,
  });
};



export const useCreateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<Assessment, Error, CreateAssessmentRequest>({
    mutationFn: (data) => assessmentService.create(data),
    onSuccess: (newAssessment) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({
        queryKey: ['assessments', newAssessment.course.id],
      });
    },
  });
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Assessment,
    Error,
    { id: string; data: UpdateAssessmentRequest }
  >({
    mutationFn: ({ id, data }) => assessmentService.update(id, data),
    onSuccess: (updatedAssessment) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({
        queryKey: ['assessments', updatedAssessment.course.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['assessment', updatedAssessment.id],
      });
    },
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => assessmentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
};

/**
 * Endpoint #3: Iniciar un intento de evaluación
 */
export const useStartAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<
    StartAttemptResponse,
    Error,
    { assessmentId: string; studentId: string }
  >({
    mutationFn: ({ assessmentId, studentId }) =>
      assessmentService.startAttempt(assessmentId, studentId),
    meta: {
      ignoreGlobalError: true,
    },
    onSuccess: (_attempt, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment-attempts', variables.assessmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['active-attempt', variables.assessmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pending-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'course'],
      });
    },
  });
};

/**
 * Hook to check for an active attempt
 */
export const useActiveAttempt = (assessmentId: string | undefined) => {
  return useQuery<StartAttemptResponse | null, Error>({
    queryKey: ['active-attempt', assessmentId],
    queryFn: () =>
      assessmentId
        ? assessmentService.getActiveAttempt(assessmentId)
        : Promise.resolve(null),
    enabled: !!assessmentId,
    retry: false,
  });
};

/**
 * Endpoint #4: Guardar respuestas (auto-save)
 */
export const useSaveAnswers = () => {
  return useMutation<
    SaveAnswersResponse,
    Error,
    { attemptId: string; answers: SaveAnswersRequest['answers'] }
  >({
    mutationFn: ({ attemptId, answers }) =>
      assessmentService.saveAnswers(attemptId, answers),
  });
};

/**
 * Endpoint #5: Enviar evaluación
 */
export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AssessmentAttempt,
    Error,
    { attemptId: string; submitData: SubmitAttemptRequest }
  >({
    mutationFn: ({ attemptId, submitData }) =>
      assessmentService.submitAttempt(attemptId, submitData),
    onSuccess: (attempt) => {
      const assessmentId =
        typeof attempt.assessment === 'string'
          ? attempt.assessment
          : attempt.assessment.id;

      queryClient.invalidateQueries({
        queryKey: ['assessment-attempts', assessmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['attempt', attempt.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['active-attempt', assessmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pending-assessments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['assessments', 'course'],
      });
      queryClient.invalidateQueries({
        queryKey: ['enrollment'],
      });
    },
  });
};

/**
 * Hook para profesores: Obtener todas las evaluaciones o de un curso específico
 * (Sin metadata del estudiante)
 */
export const useAssessmentsForProfessor = (courseId?: string) => {
  return useQuery<Assessment[], Error>({
    queryKey: courseId
      ? ['assessments', 'professor', courseId]
      : ['assessments', 'professor'],
    queryFn: async () => {
      const url = courseId
        ? `/assessments?courseId=${courseId}`
        : '/assessments';
      const response = await apiClient.get(url);
      return response.data.data;
    },
  });
};

/**
 * Hook para profesores: Obtener estadísticas de una evaluación
 */
export const useAssessmentStatistics = (assessmentId: string | undefined) => {
  return useQuery<AssessmentStatistics, Error>({
    queryKey: ['assessment-statistics', assessmentId],
    queryFn: () => assessmentService.getAssessmentStatistics(assessmentId!),
    enabled: !!assessmentId,
  });
};

/**
 * Hook para profesores: Obtener todos los intentos de una evaluación
 */
export const useAllAttemptsForProfessor = (assessmentId: string | undefined) => {
  return useQuery<AssessmentAttempt[], Error>({
    queryKey: ['all-attempts', assessmentId],
    queryFn: () => assessmentService.getAllAttemptsForProfessor(assessmentId!),
    enabled: !!assessmentId,
  });
};

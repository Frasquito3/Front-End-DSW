import apiClient from '../apiClient';
import type { Question } from '../../types/entities';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Crear una nueva pregunta para una unidad
const create = async (
  courseId: string,
  unitNumber: number,
  data: Omit<Question, 'id' | 'unitNumber'>
): Promise<Question> => {
  try {
    // Ensure unitNumber is included in the payload
    const questionData = {
      ...data,
      unitNumber: unitNumber,
    };

    const response = await apiClient.post<ApiResponse<Question>>(
      `/courses/${courseId}/units/${unitNumber}/questions`,
      questionData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Obtener preguntas de una unidad
const getByUnit = async (
  courseId: string,
  unitNumber: number
): Promise<Question[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Question[]>>(
      `/courses/${courseId}/units/${unitNumber}/questions`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Actualizar una pregunta
const update = async (
  courseId: string,
  unitNumber: number,
  questionId: string,
  data: Partial<Question>
): Promise<Question> => {
  try {
    // El backend acepta los datos directamente (sin wrapper)
    // Solo enviamos los campos que queremos modificar (PATCH)
    const payload = {
      questionText: data.questionText,
      questionType: data.questionType,
      payload: data.payload,
    };

    const response = await apiClient.patch<ApiResponse<Question>>(
      `/courses/${courseId}/units/${unitNumber}/questions/${questionId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

const createGeneral = async (
  courseId: string,
  data: Omit<Question, 'id' | 'unitNumber'>
): Promise<Question> => {
  const response = await apiClient.post<ApiResponse<Question>>(
    `/courses/${courseId}/questions`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data;
};

const getAllByCourse = async (courseId: string): Promise<Question[]> => {
  const response = await apiClient.get<ApiResponse<Question[]>>(
    `/courses/${courseId}/questions`
  );
  return response.data.data;
};

const getById = async (
  courseId: string,
  questionId: string
): Promise<Question> => {
  const response = await apiClient.get<ApiResponse<Question>>(
    `/courses/${courseId}/questions/${questionId}`
  );
  return response.data.data;
};

const remove = async (
  courseId: string,
  unitNumber: number,
  questionId: string
): Promise<void> => {
  await apiClient.delete(
    `/courses/${courseId}/units/${unitNumber}/questions/${questionId}`
  );
};

// Validar la respuesta de un estudiante a una pregunta
const validateAnswer = async (
  courseId: string,
  questionId: string,
  answer: number | string
): Promise<{ isCorrect: boolean }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ isCorrect: boolean }>>(
      `/courses/${courseId}/questions/${questionId}/validate`,
      { answer },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error validating answer:', error);
    throw error;
  }
};

export const questionService = {
  create,
  createGeneral,
  getAllByCourse,
  getByUnit,
  getById,
  update,
  delete: remove,
  validateAnswer,
};

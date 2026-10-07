import axios from "axios";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, async (error) => {
  // Handle 401 Unauthorized / Token Expiration
  if (error.response?.status === 401 && !error.config._retry) {
    // If it's a refresh token failure, log out completely
    if (error.config.url === "/auth/refresh") {
      logoutUser();
      window.dispatchEvent(new Event("auth-expired"));
      return Promise.reject(error);
    }
    
    // Attempt to refresh
    error.config._retry = true;
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (refresh_token) {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refresh_token}` }
        });
        localStorage.setItem("access_token", res.data.access_token);
        error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api(error.config);
      }
    } catch (refreshError) {
      logoutUser();
      window.dispatchEvent(new Event("auth-expired"));
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});

// ============================================================
// AUTHENTICATION APIs
// ============================================================

export const signupUser = async (data) => (await api.post("/auth/signup", data)).data;
export const loginUser = async (data) => (await api.post("/auth/login", data)).data;
export const getCurrentUser = async () => (await api.get("/auth/me")).data;
export const updateProfile = async (data) => (await api.put("/auth/profile", data)).data;
export const changePassword = async (data) => (await api.post("/auth/change-password", data)).data;
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

// ============================================================
// PATIENT MANAGEMENT APIs
// ============================================================

export const getPatients = async (params) => (await api.get("/patients", { params })).data;
export const getMyPatientProfile = async () => (await api.get("/patients/me")).data;
export const getPatientById = async (id) => (await api.get(`/patients/${id}`)).data;
export const createPatient = async (data) => (await api.post("/patients", data)).data;
export const updatePatient = async (id, data) => (await api.put(`/patients/${id}`, data)).data;
export const deletePatient = async (id) => (await api.delete(`/patients/${id}`)).data;

// Patient Sub-resources
export const getMedicalHistory = async (id) => (await api.get(`/patients/${id}/medical-history`)).data;
export const addMedicalHistory = async (id, data) => (await api.post(`/patients/${id}/medical-history`, data)).data;
export const getFamilyHistory = async (id) => (await api.get(`/patients/${id}/family-history`)).data;
export const addFamilyHistory = async (id, data) => (await api.post(`/patients/${id}/family-history`, data)).data;
export const getLifestyle = async (id) => (await api.get(`/patients/${id}/lifestyle`)).data;
export const upsertLifestyle = async (id, data) => (await api.put(`/patients/${id}/lifestyle`, data)).data;
export const getMedications = async (id) => (await api.get(`/patients/${id}/medications`)).data;
export const addMedication = async (id, data) => (await api.post(`/patients/${id}/medications`, data)).data;
export const getClinicalNotes = async (id) => (await api.get(`/patients/${id}/notes`)).data;
export const addClinicalNote = async (id, data) => (await api.post(`/patients/${id}/notes`, data)).data;
export const getCognitiveAssessments = async (id) => (await api.get(`/patients/${id}/cognitive-assessments`)).data;
export const addCognitiveAssessment = async (id, data) => (await api.post(`/patients/${id}/cognitive-assessments`, data)).data;

// ============================================================
// MRI PREDICTION APIs
// ============================================================

export const predictMRI = async (imageFile, formDataObj = {}, onUploadProgress) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  Object.keys(formDataObj).forEach(key => formData.append(key, formDataObj[key]));

  const response = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return response.data;
};

export const getPredictionHistory = async (params = {}) => (await api.get("/history", { params })).data;
export const getPredictionById = async (id) => {
  const response = (await api.get(`/history/${id}`)).data;
  return response && response.prediction ? response.prediction : response;
};
export const deletePrediction = async (id) => (await api.delete(`/history/${id}`)).data;

// ============================================================
// CLINICAL REPORTS APIs
// ============================================================

export const generateReport = async (predictionId, data = {}) => (await api.post(`/reports/generate/${predictionId}`, data)).data;
export const getReport = async (predictionId) => (await api.get(`/reports/${predictionId}`)).data;
export const downloadReportUrl = (predictionId) => `${API_BASE_URL}/reports/download/${predictionId}`;

// ============================================================
// RAG ASSISTANT APIs
// ============================================================

export const queryAssistant = async (question) => (await api.post("/assistant/query", { question })).data;
export const uploadDocument = async (file, title, docType, onUploadProgress) => {
  const formData = new FormData();
  formData.append("document", file);
  if (title) formData.append("title", title);
  if (docType) formData.append("document_type", docType);
  return (await api.post("/assistant/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress
  })).data;
};
export const getDocuments = async () => (await api.get("/assistant/documents")).data;
export const deleteDocument = async (id) => (await api.delete(`/assistant/documents/${id}`)).data;

// ============================================================
// ANALYTICS APIs
// ============================================================

export const getDashboardStats = async () => (await api.get("/analytics/dashboard")).data;

// ============================================================
// DOCTOR & HOSPITAL APIs
// ============================================================

export const searchHospitals = async (params) => (await api.get("/hospitals/search", { params })).data;
export const getDoctors = async (params) => (await api.get("/doctors", { params })).data;
export const getDoctorById = async (id) => (await api.get(`/doctors/${id}`)).data;

// ============================================================
// APPOINTMENTS APIs
// ============================================================

export const getAppointmentSlots = async (doctorId, date) => (await api.get(`/appointments/slots/${doctorId}`, { params: { date } })).data;
export const bookAppointment = async (data) => (await api.post("/appointments/book", data)).data;
export const getAppointments = async (params) => (await api.get("/appointments", { params })).data;
export const cancelAppointment = async (id, reason) => (await api.post(`/appointments/${id}/cancel`, { reason })).data;

// ============================================================
// NOTIFICATIONS APIs
// ============================================================

export const getNotifications = async (archived = false) => (await api.get("/notifications", { params: { archived } })).data;
export const markNotificationRead = async (id) => (await api.put(`/notifications/${id}/read`)).data;
export const getAlerts = async (unacknowledged_only = true) => (await api.get("/alerts", { params: { unacknowledged_only } })).data;
export const acknowledgeAlert = async (id) => (await api.put(`/alerts/${id}/acknowledge`)).data;

// ============================================================
// HEALTH & HELPERS
// ============================================================

export const getHealthStatus = async () => (await api.get("/health")).data;
export const fetchHistory = getPredictionHistory;
export const fetchPredictionDetail = getPredictionById;
export const fetchStats = getDashboardStats;

export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  const backendBaseUrl = API_BASE_URL.replace(/\/api$/, "");
  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${backendBaseUrl}${normalizedPath}`;
};

export default api;
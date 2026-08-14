import axios from "axios";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000/api";


// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});


// ============================================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "access_token"
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// Handle authentication errors
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "user"
      );

      // Notify the application that
      // authentication has expired.
      window.dispatchEvent(
        new Event("auth-expired")
      );
    }

    return Promise.reject(error);
  }
);


// ============================================================
// AUTHENTICATION APIs
// ============================================================

export const signupUser = async ({
  fullName,
  email,
  password,
}) => {

  const response = await api.post(
    "/auth/signup",
    {
      full_name: fullName,
      email: email.trim().toLowerCase(),
      password,
    }
  );

  return response.data;
};


export const loginUser = async ({
  email,
  password,
}) => {

  const response = await api.post(
    "/auth/login",
    {
      email: email.trim().toLowerCase(),
      password,
    }
  );

  return response.data;
};


export const getCurrentUser = async () => {

  const response = await api.get(
    "/auth/me"
  );

  return response.data;
};


// ============================================================
// LOGOUT
// ============================================================

export const logoutUser = () => {

  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "user"
  );
};


// ============================================================
// MRI PREDICTION
// ============================================================

export const predictMRI = async (
  imageFile,
  onUploadProgress
) => {

  const formData = new FormData();

  formData.append(
    "image",
    imageFile
  );

  const response = await api.post(
    "/predict",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },

      timeout: 120000,

      onUploadProgress,
    }
  );

  return response.data;
};


// ============================================================
// PREDICTION HISTORY
// ============================================================

export const getPredictionHistory = async (
  params = {}
) => {

  const response = await api.get(
    "/history",
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// SINGLE PREDICTION
// ============================================================

export const getPredictionById = async (
  predictionId
) => {

  const response = await api.get(
    `/history/${predictionId}`
  );

  return response.data;
};


// ============================================================
// DELETE PREDICTION
// ============================================================

export const deletePrediction = async (
  predictionId
) => {

  const response = await api.delete(
    `/history/${predictionId}`
  );

  return response.data;
};


// ============================================================
// DASHBOARD STATISTICS
// ============================================================

export const getDashboardStats = async () => {

  const response = await api.get(
    "/stats"
  );

  return response.data;
};


// ============================================================
// HEALTH CHECK
// ============================================================

export const getHealthStatus = async () => {

  const response = await api.get(
    "/health"
  );

  return response.data;
};


// ============================================================
// IMAGE URL HELPER
// ============================================================

export const getFileUrl = (
  filePath
) => {

  if (!filePath) {
    return null;
  }

  // Already a complete URL
  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  const backendBaseUrl =
    API_BASE_URL.replace(
      /\/api$/,
      ""
    );

  return `${backendBaseUrl}${filePath}`;
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;
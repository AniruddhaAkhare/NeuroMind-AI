import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  signupUser,
  getCurrentUser,
  logoutUser as clearAuth,
} from "../services/api";


// ============================================================
// AUTH CONTEXT
// ============================================================

const AuthContext = createContext(null);


// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error(
        "Failed to read stored user:",
        error
      );

      return null;
    }
  });


  const [loading, setLoading] =
    useState(true);


  // ==========================================================
  // VERIFY EXISTING JWT SESSION
  // ==========================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      setLoading(false);
      return;
    }


    const verifySession = async () => {
      try {
        const response =
          await getCurrentUser();

        if (
          response?.success &&
          response?.user
        ) {
          setUser(response.user);

          localStorage.setItem(
            "user",
            JSON.stringify(
              response.user
            )
          );
        } else {
          clearAuth();
          setUser(null);
        }

      } catch (error) {
        console.error(
          "Session verification failed:",
          error
        );

        clearAuth();
        setUser(null);

      } finally {
        setLoading(false);
      }
    };


    verifySession();

  }, []);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    email,
    password
  ) => {
    try {
      const response =
        await loginUser({
          email,
          password,
        });


      if (
        response?.success &&
        response?.access_token
      ) {
        localStorage.setItem(
          "access_token",
          response.access_token
        );


        if (response.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              response.user
            )
          );

          setUser(
            response.user
          );
        }
      }


      return response;

    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      throw error;
    }
  };


  // ==========================================================
  // SIGNUP
  // ==========================================================

  const signup = async (
    fullName,
    email,
    password
  ) => {
    try {
      const response =
        await signupUser({
          fullName,
          email,
          password,
        });


      /*
       * Your Flask signup endpoint currently
       * returns an access_token.
       *
       * If a token is returned, store it and
       * authenticate the user immediately.
       */

      if (
        response?.success &&
        response?.access_token
      ) {
        localStorage.setItem(
          "access_token",
          response.access_token
        );


        if (response.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              response.user
            )
          );

          setUser(
            response.user
          );
        }
      }


      return response;

    } catch (error) {
      console.error(
        "Signup failed:",
        error
      );

      throw error;
    }
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    clearAuth();
    setUser(null);
  };


  // ==========================================================
  // AUTHENTICATION STATE
  // ==========================================================

  const token =
    localStorage.getItem(
      "access_token"
    );

  const isAuthenticated =
    Boolean(
      token &&
      user
    );


  // ==========================================================
  // HANDLE AUTH EXPIRATION
  // ==========================================================

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);

      clearAuth();
    };


    window.addEventListener(
      "auth-expired",
      handleAuthExpired
    );


    return () => {
      window.removeEventListener(
        "auth-expired",
        handleAuthExpired
      );
    };

  }, []);


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {
    user,

    loading,

    isAuthenticated,

    login,

    signup,

    logout,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ============================================================
// USE AUTH HOOK
// ============================================================

export function useAuth() {
  const context =
    useContext(AuthContext);


  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }


  return context;
}


export default AuthContext;
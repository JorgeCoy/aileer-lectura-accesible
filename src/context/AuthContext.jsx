import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

import FirebaseBackendService from '../services/FirebaseBackendService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [schoolId, setSchoolId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Registro
    const register = async (email, password, name, selectedRole = 'student', assignedSchoolId = null) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Crear el perfil del usuario en Firestore (Cumpliendo reglas multi-tenant)
            const userProfile = {
                uid: firebaseUser.uid,
                email: email,
                name: name,
                role: selectedRole === 'teacher' ? 'student' : 'student', // Todo registro público nace como student
                createdAt: new Date().toISOString()
            };

            if (assignedSchoolId) {
                userProfile.schoolId = assignedSchoolId;
            }

            await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

            setUser(firebaseUser);
            setRole('student');
            setSchoolId(assignedSchoolId);

            return firebaseUser;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    };

    // Login
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential;
            // El onAuthStateChanged se encargará de actualizar el role y user
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
            setRole(null);
            setUser(null);
            setSchoolId(null);
        } catch (error) {
            console.error('Error en logout:', error);
        }
    };

    // Inicialización y Listener de estado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setRole(userData.role);
                        setSchoolId(userData.schoolId);
                    } else {
                        console.warn("No user profile document found in Firestore for UID:", currentUser.uid);
                        setRole(null);
                        setSchoolId(null);
                    }
                } catch (err) {
                    console.error("Error fetching user profile from Firestore:", err);
                    setRole(null);
                    setSchoolId(null);
                }
            } else {
                setUser(null);
                setRole(null);
                setSchoolId(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Canjear código de colegio de forma segura mediante Cloud Function
    const claimSchoolInvitation = async (code) => {
        if (!user) throw new Error("Debes iniciar sesión para canjear un código.");
        try {
            const data = await FirebaseBackendService.redeemInvitationCode(code);
            if (data.success) {
                setRole(data.role);
                setSchoolId(data.schoolId);
                return { success: true, message: `Bienvenido a ${data.schoolName || 'tu institución'}`, role: data.role, schoolId: data.schoolId };
            } else {
                return { success: false, error: data.error || 'Error al canjear código' };
            }
        } catch (error) {
            console.error("Error canjeando código:", error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        role,
        schoolId,
        loading,
        register,
        login,
        logout,
        claimSchoolInvitation
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

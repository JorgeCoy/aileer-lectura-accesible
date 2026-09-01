import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [schoolId, setSchoolId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Registro
    const register = async (email, password, name, selectedRole, assignedSchoolId = 'demo_school_123') => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Crear el perfil del usuario en Firestore
            const userProfile = {
                uid: firebaseUser.uid,
                email: email,
                name: name,
                role: selectedRole,
                schoolId: assignedSchoolId,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

            setUser(firebaseUser);
            setRole(selectedRole);
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

    const value = {
        user,
        role,
        schoolId,
        loading,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

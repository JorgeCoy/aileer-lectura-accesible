import React, { useContext, useState } from 'react';
import AppContext from '../context/AppContext';
import OnboardingTour from '../components/OnboardingTour';
import ReadingTestModal from '../components/ReadingTestModal';
import { UserIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const StartScreen = () => {
  const { userProfile, updateUserProfile, goToView } = useContext(AppContext);
  const [showTour, setShowTour] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '' });

  // Si es la primera vez, mostrar tour después del registro
  const handleRegistration = (e) => {
    e.preventDefault();
    if (formData.name && formData.age) {
      updateUserProfile({
        name: formData.name,
        age: parseInt(formData.age),
        isFirstTime: false // Se marcará false después del tour/test
      });
      setShowTour(true);
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
    // Mostrar el test de iniciación
    setShowTest(true);
  };

  const handleTestComplete = (results) => {
    // Actualizar perfil con resultados
    updateUserProfile({
      isFirstTime: false,
      currentLevel: results.recommendedLevel.toLowerCase(),
      xp: 100 // XP inicial por completar el test
    });
    setShowTest(false);
    goToView('dashboard');
  };

  const handleContinue = () => {
    goToView('dashboard');
  };

  // Render: Registro (Primera Vez)
  if (userProfile.isFirstTime && !showTour && !showTest) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-text-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border-color p-8 rounded-3xl shadow-xl w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-text-main mb-2">¡Hola!</h1>
          <p className="text-text-muted mb-8">Antes de empezar, cuéntanos un poco sobre ti.</p>

          <form onSubmit={handleRegistration} className="space-y-4">
            <div>
              <label className="block text-left text-sm font-medium text-text-main mb-1">¿Cómo te llamas?</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-text-main mb-1">¿Cuántos años tienes?</label>
              <input
                type="number"
                required
                min="5"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border-color bg-surface-elevated text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Tu edad"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mt-6 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Comenzar Aventura <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Render: Tour
  if (showTour) {
    return <OnboardingTour onComplete={handleTourComplete} />;
  }

  // Render: Test de Lectura (Modal)
  if (showTest) {
    return (
      <ReadingTestModal
        isOpen={showTest}
        onClose={() => setShowTest(false)} // Si cierra sin completar, vuelve al inicio o dashboard?
        onComplete={handleTestComplete}
      />
    );
  }

  // Render: Bienvenida (Usuario Recurrente)
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-text-main">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-surface border border-border-color rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <UserIcon className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-4xl font-bold text-text-main mb-4">
          ¡Hola de nuevo, <span className="text-primary">{userProfile.name}</span>!
        </h1>

        <p className="text-xl text-text-muted mb-12">
          ¿Listo para continuar tu aprendizaje?
        </p>

        <button
          onClick={handleContinue}
          className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-bold text-xl transition-all flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Continuar <ArrowRightIcon className="w-6 h-6" />
        </button>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => setShowTour(true)}
            className="block w-full text-text-muted hover:text-primary text-sm font-medium transition-colors"
          >
            Ver tour de bienvenida nuevamente
          </button>
          <button
            onClick={() => setShowTest(true)}
            className="block w-full text-text-muted hover:text-primary text-sm font-medium transition-colors"
          >
            Realizar test de nivelación
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StartScreen;
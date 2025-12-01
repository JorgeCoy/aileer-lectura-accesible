// src/patterns/ReadingComponentFactory.js
// Patrón Abstract Factory para componentes de lectura - Implementación funcional

import React from 'react';
import HighlightedWord from '../components/HighlightedWord';
import LineReader from '../components/LineReader';
import ParagraphReader from '../components/ParagraphReader';
import SpritzReader from '../components/SpritzReader';
import SaccadeReader from '../components/SaccadeReader';
import PreviewReader from '../components/PreviewReader';
import ClozeReader from '../components/ClozeReader';

// Factory functions que retornan configuraciones de componentes
export const createAdultReadingComponents = () => ({
  createSingleWordReader: (props) => ({ component: HighlightedWord, props }),
  createLineReader: (props) => ({ component: LineReader, props }),
  createParagraphReader: (props) => ({ component: ParagraphReader, props }),
  createSpritzReader: (props) => ({ component: SpritzReader, props }),
  createSaccadeReader: (props) => ({ component: SaccadeReader, props }),
  createPreviewReader: (props) => ({ component: PreviewReader, props }),
  createClozeReader: (props) => ({ component: ClozeReader, props })
});

export const createChildReadingComponents = () => ({
  createSingleWordReader: (props) => ({
    component: HighlightedWord,
    props: {
      ...props,
      fontSize: Math.max(props.fontSize, 48) // Tamaño mínimo más grande
    }
  }),
  createLineReader: (props) => ({
    component: LineReader,
    props: {
      ...props,
      multiplier: 4 // Menos palabras por línea para niños
    }
  }),
  createParagraphReader: (props) => ({ component: ParagraphReader, props }),
  createSpritzReader: (props) => ({ component: SpritzReader, props }),
  createSaccadeReader: (props) => ({ component: SaccadeReader, props }),
  createPreviewReader: (props) => ({ component: PreviewReader, props }),
  createClozeReader: (props) => ({ component: ClozeReader, props })
});

export const createTDAHReadingComponents = () => ({
  createSingleWordReader: (props) => ({
    component: HighlightedWord,
    props: {
      ...props,
      fontSize: Math.max(props.fontSize, 40) // Tamaño ligeramente mayor
    }
  }),
  createLineReader: (props) => ({
    component: LineReader,
    props: {
      ...props,
      multiplier: 6 // Más palabras por línea para mantener contexto
    }
  }),
  createParagraphReader: (props) => ({ component: ParagraphReader, props }),
  createSpritzReader: (props) => ({ component: SpritzReader, props }),
  createSaccadeReader: (props) => ({ component: SaccadeReader, props }),
  createPreviewReader: (props) => ({ component: PreviewReader, props }),
  createClozeReader: (props) => ({ component: ClozeReader, props })
});



// Factory Creator - Factory Method Pattern (funcional)
export const createReadingComponentFactory = (mode) => {
  switch (mode) {
    case 'child':
      return createChildReadingComponents();
    case 'ninos_tdah':
      return createTDAHReadingComponents();
    case 'adult':
    case 'teacher':
    case 'baby':
    default:
      return createAdultReadingComponents();
  }
};

// Función helper para renderizar componentes usando la fábrica
export const renderReadingComponent = (technique, factory, props) => {
  if (!factory) {
    throw new Error('No factory provided');
  }

  try {
    let componentConfig;
    switch (technique) {
      case 'singleWord':
      case 'bionic':
      case 'chunking':
        componentConfig = factory.createSingleWordReader(props);
        break;
      case 'lineFocus':
        componentConfig = factory.createLineReader(props);
        break;
      case 'paragraphFocus':
        componentConfig = factory.createParagraphReader(props);
        break;
      case 'spritz':
        componentConfig = factory.createSpritzReader(props);
        break;
      case 'saccade':
        componentConfig = factory.createSaccadeReader(props);
        break;
      case 'preview':
        componentConfig = factory.createPreviewReader(props);
        break;
      case 'cloze':
        componentConfig = factory.createClozeReader(props);
        break;
      default:
        componentConfig = factory.createSingleWordReader(props);
    }

    return componentConfig;
  } catch (error) {
    console.error('Error creating reading component:', error);
    throw error;
  }
};

// Hook para usar la fábrica (simplificado)
export function useReadingComponentFactory(mode) {
  const factory = React.useMemo(() => createReadingComponentFactory(mode), [mode]);

  const renderComponent = React.useCallback((technique, props) => {
    const config = renderReadingComponent(technique, factory, props);
    const { component: Component, props: componentProps } = config;
    return <Component {...componentProps} />;
  }, [factory]);

  return { factory, renderComponent };
}

// Factory configurable avanzada
export const createConfigurableReadingComponents = (config = {}) => {
  const defaultConfig = {
    minFontSize: config.minFontSize || 24,
    maxFontSize: config.maxFontSize || 80,
    defaultMultiplier: config.defaultMultiplier || 8,
    enableAnimations: config.enableAnimations !== false,
    ...config
  };

  return {
    createSingleWordReader: (props) => {
      const fontSize = Math.max(
        Math.min(props.fontSize, defaultConfig.maxFontSize),
        defaultConfig.minFontSize
      );

      return {
        component: HighlightedWord,
        props: {
          ...props,
          fontSize,
          style: {
            ...props.style,
            transition: defaultConfig.enableAnimations ? 'all 0.3s ease' : 'none'
          }
        }
      };
    },

    createLineReader: (props) => ({
      component: LineReader,
      props: {
        ...props,
        multiplier: defaultConfig.defaultMultiplier,
        style: {
          ...props.style,
          transition: defaultConfig.enableAnimations ? 'all 0.3s ease' : 'none'
        }
      }
    }),

    createParagraphReader: (props) => ({ component: ParagraphReader, props }),
    createSpritzReader: (props) => ({ component: SpritzReader, props }),
    createSaccadeReader: (props) => ({ component: SaccadeReader, props }),
    createPreviewReader: (props) => ({ component: PreviewReader, props }),
    createClozeReader: (props) => ({ component: ClozeReader, props })
  };
};

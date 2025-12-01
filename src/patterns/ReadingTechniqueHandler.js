// src/patterns/ReadingTechniqueHandler.js
// Patrón Chain of Responsibility para técnicas de lectura
import React from 'react';
import HighlightedWord from '../components/HighlightedWord';
import LineReader from '../components/LineReader';
import ParagraphReader from '../components/ParagraphReader';
import SpritzReader from '../components/SpritzReader';
import SaccadeReader from '../components/SaccadeReader';
import PreviewReader from '../components/PreviewReader';
import ClozeReader from '../components/ClozeReader';

export class ReadingTechniqueHandler {
  constructor() {
    this.nextHandler = null;
  }

  setNext(handler) {
    this.nextHandler = handler;
    return handler; // Permite encadenamiento fluido
  }

  canHandle(_technique) {
    throw new Error('canHandle debe ser implementado por subclases');
  }

  renderComponent(_props) {
    throw new Error('renderComponent debe ser implementado por subclases');
  }

  // Método helper para crear configuración de componente
  createComponentConfig(Component, props) {
    return { component: Component, props };
  }

  handle(technique, props) {
    if (this.canHandle(technique)) {
      return this.renderComponent(props);
    }

    if (this.nextHandler) {
      return this.nextHandler.handle(technique, props);
    }

    // Técnica no soportada - fallback a singleWord
    return this.createComponentConfig(HighlightedWord, {
      word: props.words[props.currentIndex] || "",
      fontSize: props.fontSize,
      fontFamily: props.fontFamily,
      theme: props.theme,
      technique: "singleWord"
    });
  }
}

export class SingleWordHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'singleWord';
  }

  renderComponent(_props) {
    const { words, currentIndex, fontSize, fontFamily, theme, readingTechnique } = _props;
    return this.createComponentConfig(HighlightedWord, {
      word: words[currentIndex] || "",
      fontSize,
      fontFamily,
      theme,
      technique: readingTechnique
    });
  }
}

export class BionicHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'bionic';
  }

  renderComponent(_props) {
    const { words, currentIndex, fontSize, fontFamily, theme } = _props;
    return this.createComponentConfig(HighlightedWord, {
      word: words[currentIndex] || "",
      fontSize,
      fontFamily,
      theme,
      technique: "bionic"
    });
  }
}

export class LineFocusHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'lineFocus';
  }

  renderComponent(_props) {
    const { words, currentIndex, speed, theme, fontSize, fontFamily } = _props;
    return this.createComponentConfig(LineReader, {
      line: words[currentIndex] || "",
      speed,
      multiplier: 8,
      theme,
      fontSize,
      fontFamily
    });
  }
}

export class ParagraphFocusHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'paragraphFocus';
  }

  renderComponent(_props) {
    const { words, currentIndex, theme, fontSize, fontFamily } = _props;
    return this.createComponentConfig(ParagraphReader, {
      words,
      currentIndex,
      theme,
      fontSize,
      fontFamily
    });
  }
}

export class SpritzHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'spritz';
  }

  renderComponent(_props) {
    const { words, currentIndex, theme, fontSize, fontFamily } = _props;
    return this.createComponentConfig(SpritzReader, {
      word: words[currentIndex] || "",
      theme,
      fontSize,
      fontFamily
    });
  }
}

export class SaccadeHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'saccade';
  }

  renderComponent(_props) {
    const { words, currentIndex, theme, fontSize, fontFamily } = _props;
    return this.createComponentConfig(SaccadeReader, {
      word: words[currentIndex] || "",
      theme,
      fontSize,
      fontFamily
    });
  }
}

export class PreviewHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'preview';
  }

  renderComponent(_props) {
    const { text, theme, fontSize, fontFamily } = _props;
    return this.createComponentConfig(PreviewReader, {
      text,
      theme,
      fontSize,
      fontFamily
    });
  }
}

export class ClozeHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'cloze';
  }

  renderComponent(_props) {
    const { text, theme, fontSize, fontFamily } = _props;
    return this.createComponentConfig(ClozeReader, {
      text,
      theme,
      fontSize,
      fontFamily
    });
  }
}

export class RsvpHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'rsvp';
  }

  renderComponent(_props) {
    const { words, currentIndex, theme, fontSize, fontFamily } = _props;
    return this.createComponentConfig(SpritzReader, {
      word: words[currentIndex] || "",
      theme,
      fontSize,
      fontFamily
    });
  }
}

export class HighlightHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'highlight';
  }

  renderComponent(_props) {
    const { words, currentIndex, fontSize, fontFamily, theme } = _props;
    return this.createComponentConfig(HighlightedWord, {
      word: words[currentIndex] || "",
      fontSize,
      fontFamily,
      theme,
      technique: "singleWord" // HighlightedWord uses 'singleWord' for the standard highlight effect
    });
  }
}

import SemanticChunkReader from '../components/SemanticChunkReader';

export class SemanticChunkingHandler extends ReadingTechniqueHandler {
  canHandle(_technique) {
    return _technique === 'semanticChunking';
  }

  renderComponent(_props) {
    const { words, currentIndex, theme, fontSize, fontFamily } = _props;
    // SemanticChunkReader needs the full text context, usually passed as 'words' array
    return this.createComponentConfig(SemanticChunkReader, {
      words,
      currentIndex,
      theme,
      fontSize,
      fontFamily
    });
  }
}

// Factory para crear la cadena de responsabilidad
export class ReadingTechniqueChain {
  static create() {
    const singleWord = new SingleWordHandler();
    const bionic = new BionicHandler();
    const lineFocus = new LineFocusHandler();
    const paragraphFocus = new ParagraphFocusHandler();
    const spritz = new SpritzHandler();
    const saccade = new SaccadeHandler();
    const preview = new PreviewHandler();
    const cloze = new ClozeHandler();
    const rsvp = new RsvpHandler();
    const highlight = new HighlightHandler();
    const semanticChunking = new SemanticChunkingHandler();

    // Construir la cadena
    singleWord
      .setNext(bionic)
      .setNext(lineFocus)
      .setNext(paragraphFocus)
      .setNext(spritz)
      .setNext(saccade)
      .setNext(preview)
      .setNext(cloze)
      .setNext(rsvp)
      .setNext(highlight)
      .setNext(semanticChunking);

    return singleWord; // Retornar el primer handler
  }
}


import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Download, 
  Settings,
  BookOpen
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { ChordState } from './types';
import ChordDiagram from './components/ChordDiagram';
import Toolbar from './components/Toolbar';
import { OfflineIndicator } from './components/OfflineIndicator';

const DEFAULT_STATE: ChordState = {
  name: 'C Major',
  nameFontSize: 30,
  fretFontSize: 14,
  fingerFontSize: 12,
  markerFontSize: 14,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 'bold',
  italic: false,
  textThickness: 0,
  startFret: 1,
  nutThickness: 6,
  lineThickness: 1.5,
  mainColor: '#000000',
  nameColor: '#000000',
  barreColor: '#000000',
  markerColor: '#64748b',
  editingColor: '#64748b',
  backgroundColor: '#ffffff',
  chordSize: 1,
  widthMultiplier: 1,
  heightMultiplier: 1,
  nameOffset: 24,
  markerOffset: 16,
  fretOffset: 0,
  fingers: [],
  fretLabels: ['', '', '', '', ''],
  bottomMarkers: ['', '', '', '', '', ''],
  strings: 6,
  frets: 5,
  barre: {
    active: false,
    fret: 0,
    startString: 0,
    endString: 5,
    thickness: 14,
  },
  capo: {
    active: false,
    fret: 0,
    color: '#000000',
    thickness: 16,
    showName: false,
    capoName: '',
    capoNameColor: '#FFFFFF',
  },
  capoColor: '#000000',
  fillFingers: true,
  fillMarkers: true,
  orientation: 'vertical',
  customColors: [],
  arrows: [],
  stringColors: [],
  stringColorsGrid: {},
  isStringColoringActive: false,
  selectedStringColor: '#000000',
  isNumberColoringActive: false,
  selectedNumberColor: '#dc2626',
  isEditingFingerLetters: false,
  isRotateChartAndName: false,
  isIndividualDotActive: false,
  individualDotSize: 15,
  individualDotColor: '#16a34a'
};

const MAX_HISTORY = 50;

const App: React.FC = () => {
  const [chord, setChord] = useState<ChordState>(DEFAULT_STATE);
  const [activePoint, setActivePoint] = useState<{ type: 'finger' | 'marker', string: number, fret?: number } | null>(null);
  const [history, setHistory] = useState<ChordState[]>([DEFAULT_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [saveWithoutBorders, setSaveWithoutBorders] = useState<boolean>(() => {
    try {
      return localStorage.getItem('chord-save-without-borders') === 'true';
    } catch {
      return false;
    }
  });
  const diagramRef = useRef<HTMLDivElement>(null);

  const toggleSaveWithoutBorders = useCallback(() => {
    setSaveWithoutBorders(prev => {
      const next = !prev;
      try {
        localStorage.setItem('chord-save-without-borders', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const savedDefault = localStorage.getItem('chord-editor-custom-default');
    if (savedDefault) {
      try {
        const parsed = JSON.parse(savedDefault);
        setChord(parsed);
        setHistory([parsed]);
        setHistoryIndex(0);
      } catch (e) {
        console.error("Erro ao carregar o acorde padrão:", e);
      }
    }

    // Google OAuth Callback Handler
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (chord !== DEFAULT_STATE) {
      localStorage.setItem('chord-editor-autosave', JSON.stringify(chord));
    }
  }, [chord]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setChord(JSON.parse(JSON.stringify(history[prevIndex])));
    }
  }, [history, historyIndex]);

  const addToHistory = useCallback((newState: ChordState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newState)));
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const restoreAutoSave = useCallback(() => {
    const saved = localStorage.getItem('chord-editor-autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChord(parsed);
        addToHistory(parsed);
        alert('Projeto restaurado do salvamento automático!');
      } catch (e) {
        alert('Erro ao restaurar o salvamento automático.');
      }
    } else {
      alert('Nenhum salvamento automático encontrado.');
    }
  }, [addToHistory]);

  const handleUpdate = useCallback((updates: Partial<ChordState>) => {
    setChord(prev => {
      const newState = { ...prev, ...updates };
      setTimeout(() => addToHistory(newState), 0);
      return newState;
    });
  }, [addToHistory]);

  const toggleMarker = useCallback((string: number) => {
    setChord(prev => {
      const stringsCount = prev.strings || 6;
      const newMarkers = [...prev.bottomMarkers];
      const newColors = [...(prev.bottomMarkerColors || Array(stringsCount).fill(''))];
      const newSizes = [...(prev.bottomMarkerSizes || Array(stringsCount).fill(0))];
      const currentVal = newMarkers[string] || '';

      // FUNÇÃO BOLA INDIVIDUAL APLICÁVEL NA BASE
      if (prev.isIndividualDotActive) {
        const ballColor = prev.individualDotColor || '#16a34a';
        const ballSize = prev.individualDotSize ?? 15;

        if (currentVal === '●') {
          // Se já era bola individual na base, remove ao clicar de novo
          newMarkers[string] = '';
          newColors[string] = '';
          newSizes[string] = 0;
        } else {
          // Aplica a bola individual com a cor e tamanho atuais
          newMarkers[string] = '●';
          newColors[string] = ballColor;
          newSizes[string] = ballSize;
        }

        const newState = {
          ...prev,
          bottomMarkers: newMarkers,
          bottomMarkerColors: newColors,
          bottomMarkerSizes: newSizes
        };
        setTimeout(() => addToHistory(newState), 0);
        return newState;
      }
      
      // Ciclo normal quando a Função Bola Individual não está ativa: '' -> 'O' -> 'X' -> 'B' -> '●' -> ''
      const cycle: Record<string, string> = {
        '': 'O',
        'O': 'X',
        'X': 'B',
        'B': '●',
        '●': ''
      };
      
      const nextVal = cycle[currentVal];
      newMarkers[string] = nextVal !== undefined ? nextVal : 'O';
      if (newMarkers[string] === '●') {
        newColors[string] = prev.individualDotColor || '#16a34a';
        newSizes[string] = prev.individualDotSize ?? 15;
      } else {
        newColors[string] = '';
        newSizes[string] = 0;
      }
      
      const newState = {
        ...prev,
        bottomMarkers: newMarkers,
        bottomMarkerColors: newColors,
        bottomMarkerSizes: newSizes
      };
      setTimeout(() => addToHistory(newState), 0);
      return newState;
    });
  }, [addToHistory]);

  const toggleFinger = useCallback((string: number, fret: number) => {
    setChord(prev => {
      if (prev.isStringColoringActive) {
        const key = `${string}-${fret}`;
        const currentGrid = prev.stringColorsGrid || {};
        const targetColor = prev.selectedStringColor || prev.mainColor;
        const newGrid = { ...currentGrid };

        if (newGrid[key] === targetColor) {
          delete newGrid[key];
        } else {
          newGrid[key] = targetColor;
        }

        const newState = { ...prev, stringColorsGrid: newGrid };
        setTimeout(() => addToHistory(newState), 0);
        return newState;
      }

      const existingIdx = prev.fingers.findIndex(f => f.string === string && f.fret === fret);
      let newFingers = [...prev.fingers];
      
      const isTab = prev.isTablatureMode;

      // FUNÇÃO BOLA INDIVIDUAL
      if (prev.isIndividualDotActive) {
        const ballColor = prev.individualDotColor || '#16a34a';
        const ballSize = prev.individualDotSize || 15;

        if (existingIdx > -1) {
          const currentFinger = newFingers[existingIdx];
          if (currentFinger.isIndividualBall || currentFinger.value === '●') {
            // Se já for uma bola individual, remove ao clicar novamente
            newFingers.splice(existingIdx, 1);
          } else {
            // Se for um número de dedo comum, converte para bola individual
            newFingers[existingIdx] = {
              ...currentFinger,
              value: '●',
              isIndividualBall: true,
              color: ballColor,
              size: ballSize
            };
          }
        } else {
          // Insere nova bola individual
          newFingers.push({
            string,
            fret,
            value: '●',
            isIndividualBall: true,
            color: ballColor,
            size: ballSize
          });
        }
        const newState = { ...prev, fingers: newFingers };
        setTimeout(() => addToHistory(newState), 0);
        return newState;
      }

      // Modo Mudar Cor de Um Número (Função Tablatura)
      if (prev.isNumberColoringActive) {
        const targetColor = prev.selectedNumberColor || '#dc2626';
        if (existingIdx > -1) {
          // Ao clicar em um número existente, não aumenta nem diminui, apenas muda a cor
          newFingers[existingIdx] = {
            ...newFingers[existingIdx],
            color: targetColor
          };
        } else {
          // Se for uma posição vazia, insere o número com a cor selecionada
          newFingers.push({ string, fret, value: isTab ? '0' : '1', color: targetColor });
        }
        const newState = { ...prev, fingers: newFingers };
        setTimeout(() => addToHistory(newState), 0);
        return newState;
      }

      if (prev.isEditingFingerLetters) {
        if (existingIdx > -1) {
          newFingers.splice(existingIdx, 1);
        } else {
          newFingers.push({ string, fret, value: 'A' });
        }
        const newState = { ...prev, fingers: newFingers };
        setTimeout(() => addToHistory(newState), 0);
        return newState;
      }

      if (existingIdx > -1) {
        const currentVal = newFingers[existingIdx].value;
        // Ciclo Tab: 0 -> 1 -> 2 -> ... -> 20 -> remover
        const cycleTab: Record<string, string | null> = {
          '0': '1', '1': '2', '2': '3', '3': '4', '4': '5', '5': '6', '6': '7', '7': '8', '8': '9', '9': '10',
          '10': '11', '11': '12', '12': '13', '13': '14', '14': '15', '15': '16', '16': '17', '17': '18', '18': '19', '19': '20',
          '20': null
        };
        // Ciclo Normal: 1 -> 2 -> 3 -> 4 -> O -> remover
        const cycleNormal: Record<string, string | null> = {
          '1': '2', '2': '3', '3': '4', '4': 'O', 'O': null
        };
        
        const cycle = isTab ? cycleTab : cycleNormal;
        const nextVal = cycle[currentVal] !== undefined ? cycle[currentVal] : (isTab ? '0' : '1');
        
        if (nextVal !== null) {
          newFingers[existingIdx] = { ...newFingers[existingIdx], value: nextVal };
        } else {
          newFingers.splice(existingIdx, 1);
        }
      } else {
        newFingers.push({ string, fret, value: isTab ? '0' : '1' });
      }
      
      const newState = { ...prev, fingers: newFingers };
      setTimeout(() => addToHistory(newState), 0);
      return newState;
    });
  }, [addToHistory]);

  const trimCanvasToChord = (canvas: HTMLCanvasElement, bgColorHex: string): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let bgR = 255;
    let bgG = 255;
    let bgB = 255;

    if (bgColorHex) {
      const hex = bgColorHex.trim().replace('#', '');
      if (hex.length === 3) {
        bgR = parseInt(hex[0] + hex[0], 16);
        bgG = parseInt(hex[1] + hex[1], 16);
        bgB = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        bgR = parseInt(hex.substring(0, 2), 16);
        bgG = parseInt(hex.substring(2, 4), 16);
        bgB = parseInt(hex.substring(4, 6), 16);
      }
    }

    // Amostra os 4 cantos para calibrar com precisão o fundo renderizado
    const cornerIndices = [
      0,
      Math.max(0, (width - 1)) * 4,
      Math.max(0, (height - 1) * width) * 4,
      Math.max(0, (height - 1) * width + (width - 1)) * 4
    ];
    let cornerR = 0, cornerG = 0, cornerB = 0, cornerA = 0;
    for (const idx of cornerIndices) {
      cornerR += data[idx];
      cornerG += data[idx + 1];
      cornerB += data[idx + 2];
      cornerA += data[idx + 3];
    }
    cornerR = Math.round(cornerR / 4);
    cornerG = Math.round(cornerG / 4);
    cornerB = Math.round(cornerB / 4);
    cornerA = Math.round(cornerA / 4);

    const refR = Math.abs(cornerR - bgR) < 25 ? cornerR : bgR;
    const refG = Math.abs(cornerG - bgG) < 25 ? cornerG : bgG;
    const refB = Math.abs(cornerB - bgB) < 25 ? cornerB : bgB;
    const isTransparent = cornerA < 15;
    const tolerance = 12;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        let isContent = false;
        if (isTransparent) {
          if (a > 15) isContent = true;
        } else {
          if (
            Math.abs(r - refR) > tolerance ||
            Math.abs(g - refG) > tolerance ||
            Math.abs(b - refB) > tolerance ||
            Math.abs(a - cornerA) > tolerance
          ) {
            isContent = true;
          }
        }

        if (isContent) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return canvas;
    }

    // Salvar beirando o desenho do acorde sem rebarbas
    const margin = 2;

    const cropX = Math.max(0, minX - margin);
    const cropY = Math.max(0, minY - margin);
    const cropMaxX = Math.min(width, maxX + margin + 1);
    const cropMaxY = Math.min(height, maxY + margin + 1);
    const cropWidth = cropMaxX - cropX;
    const cropHeight = cropMaxY - cropY;

    if (cropWidth <= 0 || cropHeight <= 0) {
      return canvas;
    }

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return canvas;

    croppedCtx.fillStyle = bgColorHex || '#ffffff';
    croppedCtx.fillRect(0, 0, cropWidth, cropHeight);

    croppedCtx.drawImage(
      canvas,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    return croppedCanvas;
  };

  const exportImage = async (format: 'png' | 'jpg') => {
    if (!diagramRef.current) return;

    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const element = diagramRef.current;
      
      const options = { 
        backgroundColor: chord.backgroundColor, 
        pixelRatio: 4,
        style: {
          transform: 'none',
          margin: '0',
          padding: saveWithoutBorders ? '0' : '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }
      };
      
      let dataUrl: string;
      try {
        if (saveWithoutBorders) {
          const sourceCanvas = await htmlToImage.toCanvas(element, options);
          const trimmedCanvas = trimCanvasToChord(sourceCanvas, chord.backgroundColor);
          dataUrl = format === 'png' 
            ? trimmedCanvas.toDataURL('image/png') 
            : trimmedCanvas.toDataURL('image/jpeg', 0.98);
        } else {
          dataUrl = format === 'png' 
            ? await htmlToImage.toPng(element, options) 
            : await htmlToImage.toJpeg(element, options);
        }
      } catch (renderErr) {
        console.warn('Tentando fallback de renderização...', renderErr);
        const fallbackOpts = { backgroundColor: chord.backgroundColor, pixelRatio: 2 };
        dataUrl = format === 'png'
          ? await htmlToImage.toPng(element, fallbackOpts)
          : await htmlToImage.toJpeg(element, fallbackOpts);
      }

      const cleanName = (chord.name || 'personalizado').trim().replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '-');
      const fileName = `acorde-${cleanName || 'personalizado'}.${format}`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 500);
    } catch (err) {
      console.error('Erro ao exportar imagem', err);
      alert('Houve um erro na exportação. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const saveAsDefault = () => {
    localStorage.setItem('chord-editor-custom-default', JSON.stringify(chord));
    alert('Configuração salva como padrão!');
  };

  const reset = () => {
    setChord(DEFAULT_STATE);
    addToHistory(DEFAULT_STATE);
  };

  const clearEdits = () => {
    setChord(prev => {
      const stringsCount = prev.strings || 6;
      const fretsCount = prev.frets || 5;

      const newState: ChordState = {
        ...prev,
        name: '',
        fingers: [],
        bottomMarkers: Array(stringsCount).fill(''),
        bottomMarkerColors: Array(stringsCount).fill(''),
        bottomMarkerSizes: Array(stringsCount).fill(0),
        startFret: 1,
        fretLabels: Array(fretsCount).fill(''),
        arrows: [],
        barre: {
          ...prev.barre,
          active: false
        },
        stringColorsGrid: {}
      };

      addToHistory(newState);
      return newState;
    });
    setActivePoint(null);
  };

  const exportProject = () => {
    try {
      const cleanName = (chord.name || 'acorde').trim().replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '-');
      const fileName = `projeto-${cleanName || 'acorde'}.json`;
      const dataStr = JSON.stringify(chord, null, 2);

      // Usar Blob URL compatível
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 500);
    } catch (e) {
      console.error('Erro ao exportar projeto via Blob:', e);
      // Fallback clássico caso Blob falhe
      try {
        const cleanName = (chord.name || 'acorde').trim().replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '-');
        const dataStr = JSON.stringify(chord, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `projeto-${cleanName || 'acorde'}.json`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
        }, 500);
      } catch (err2) {
        alert('Erro ao exportar projeto.');
      }
    }
  };

  const importProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setChord(json);
        addToHistory(json);
      } catch (err) {
        alert('Erro ao importar projeto.');
      }
    };
    reader.readAsText(file);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto h-screen print:hidden z-10">
        <div className="p-6 space-y-8">
          <div className="border-b pb-4 mb-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg shrink-0">
                <Settings className="text-white w-5 h-5" />
              </div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight leading-tight">EDITOR DE ACORDES PARA PC</h1>
            </div>

            <a
              id="btn-baixar-manual-edicao"
              href="https://docs.google.com/uc?export=download&id=16JhDlmZ1ptb_EfM3EJB_wIAYLhRkrjJm"
              target="_blank"
              rel="noopener noreferrer"
              download
              className="w-full flex items-center justify-between px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-lg font-semibold text-xs tracking-wide shadow-sm transition-all group cursor-pointer"
              title="Baixar Manual de Edição de Cifras e VídeoAulas (Download Direto do Google Drive)"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
                <span>BAIXAR MANUAL DE EDIÇÃO</span>
              </span>
              <span className="flex items-center gap-1 bg-emerald-800/60 group-hover:bg-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-100 uppercase tracking-wider">
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </span>
            </a>
          </div>

          <Toolbar 
            chord={chord} 
            onUpdate={handleUpdate} 
            onExport={exportImage}
            onReset={reset}
            onClearEdits={clearEdits}
            onUndo={undo}
            canUndo={historyIndex > 0}
            onSaveAsDefault={saveAsDefault}
            onExportProject={exportProject}
            onImportProject={importProject}
            onRestoreAutoSave={restoreAutoSave}
            saveWithoutBorders={saveWithoutBorders}
            onToggleSaveWithoutBorders={toggleSaveWithoutBorders}
          />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-12 flex flex-col items-center justify-center relative bg-slate-100 overflow-auto">
        <div 
          className="flex items-center justify-center relative transition-transform duration-300 ease-out"
          style={{ 
            transform: isExporting ? 'none' : `scale(${chord.chordSize})`,
          }}
        >
          <div 
            ref={diagramRef}
            className={`${isExporting && saveWithoutBorders ? 'p-0' : 'p-16'} ${isExporting ? '' : 'rounded-2xl shadow-2xl border border-slate-200'}`}
            style={{ 
              backgroundColor: chord.backgroundColor,
              width: 'max-content',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'content-box',
              minWidth: isExporting && saveWithoutBorders ? 'auto' : '400px'
            }}
          >
            <ChordDiagram 
              chord={chord} 
              onToggleFinger={toggleFinger}
              onToggleMarker={toggleMarker}
              onUpdate={handleUpdate}
              isExporting={isExporting}
              activePoint={activePoint}
              onSetActivePoint={setActivePoint}
            />
          </div>
        </div>
      </div>

      <OfflineIndicator />
    </div>
  );
};

export default App;

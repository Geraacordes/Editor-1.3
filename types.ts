
export type LineThickness = number;
export type Orientation = 'vertical' | 'horizontal-left' | 'horizontal-right';

export interface FingerPosition {
  string: number; // 0 to 5 (E to e)
  fret: number;   // 0 to 4 (in-grid position)
  value: string;  // 1, 2, 3, 4, or empty / '●' / 'O'
  color?: string; // Cor individual para o número do dedo ou bola
  size?: number;  // Tamanho individual para a bola
  isIndividualBall?: boolean; // Novo: Marcador de bola individual
}

export interface BarreConfig {
  active: boolean;
  fret: number; // 0 to 4
  startString: number;
  endString: number;
  thickness: number; // Nova propriedade para controlar a grossura da pestana
}

export interface CapoConfig {
  active: boolean;
  fret: number;
  color: string;
  thickness: number;
  showName: boolean;
  capoName?: string;
  capoNameColor?: string;
}

export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

export interface ArrowConfig {
  id: string;
  string: number;
  fret: number;
  direction: ArrowDirection;
  size: number;
  color: string;
  text?: string;
  onlyHead?: boolean;
  active: boolean;
}

export interface ChordState {
  name: string;
  nameFontSize: number;
  fretFontSize: number; // Font size for the fret numbers on the left
  fingerFontSize: number; // New: Font size for the numbers inside the circles
  markerFontSize: number; // New: Font size for the markers at the bottom (X, O, etc)
  fontFamily: string; // New: Global font family for all text elements
  fontWeight: string; // New: Global font weight
  italic: boolean; // New: Global italic style
  textThickness: number; // Novo: Espessura extra do texto (stroke)
  startFret: number;
  nutThickness: number; // New: Thickness of the initial fret (Nut)
  lineThickness: LineThickness;
  mainColor: string;
  nameColor: string; // Nova: Cor independente para o nome do acorde
  barreColor: string; // Nova: Cor independente para a pestana
  capoColor?: string; // Nova: Cor independente para o capotraste
  markerColor: string; // Nova: Cor independente para os marcadores da base
  editingColor: string;
  backgroundColor: string;
  chordSize: number;
  widthMultiplier: number;
  heightMultiplier: number;
  nameOffset: number; // Space between name and grid
  markerOffset: number; // Space between grid and bottom markers
  fretOffset: number; // Space between left fret numbers and grid
  fingers: FingerPosition[];
  fretLabels: string[]; // 5 elements for the left-side circles
  bottomMarkers: string[]; // 6 elements
  strings?: number; // New: Number of strings (vertical lines)
  frets?: number;   // New: Number of frets (horizontal spaces)
  barre: BarreConfig;
  capo?: CapoConfig; // Novo: Configuração do Capotraste
  fillFingers: boolean; // Novo: Se os círculos dos dedos devem ser preenchidos
  fillMarkers: boolean; // Novo: Se os marcadores do rodapé devem ser preenchidos
  orientation: Orientation;
  customColors?: string[]; // Novo: Lista de cores personalizadas usadas no projeto
  isTablatureMode?: boolean; // Novo: Modo Tablatura (remove linhas horizontais do meio)
  isEditingBaseLetters?: boolean; // Novo: Permite digitar letras na base
  isEditingFingerLetters?: boolean; // Novo: Permite escrever letras no local dos dedos (Função Tablatura)
  isRotateChartAndName?: boolean; // Novo: Girar gráfico e nome juntos
  textRotation?: number; // Novo: Rotação dos números e letras (0, 90, 180, 270)
  arrows?: ArrowConfig[]; // Novo: Lista de setas indicativas
  stringColors?: string[]; // Novo: Cores individuais de cada corda
  stringColorsGrid?: { [key: string]: string }; // Novo: Cores segmentadas por traste para cada corda
  isStringColoringActive?: boolean; // Novo: Modo de pintura de cordas ativo
  selectedStringColor?: string; // Novo: Cor da corda selecionada para aplicar
  isNumberColoringActive?: boolean; // Novo: Modo de mudar cor de um número ativo
  selectedNumberColor?: string; // Novo: Cor do número selecionada para aplicar
  isIndividualDotActive?: boolean; // Novo: FUNÇÃO BOLA INDIVIDUAL ativa
  individualDotSize?: number; // Novo: Tamanho da bolinha individual (- e +)
  individualDotColor?: string; // Novo: Cor da bolinha individual (Paleta de cores)
  bottomMarkerColors?: string[]; // Novo: Cores individuais dos marcadores/bolas da base
  bottomMarkerSizes?: number[]; // Novo: Tamanhos individuais dos marcadores/bolas da base
}

export const COLOR_PALETTE = [
  '#000000', // Black
  '#FFFFFF', // White
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#be185d', // Pink
  '#64748b', // Slate
];

export const FONT_OPTIONS = [
  { name: 'Inter (Padrão)', value: "'Inter', sans-serif" },
  { name: 'Arial Black', value: "'Arial Black', 'Arial Bold', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Oswald', value: "'Oswald', sans-serif" },
  { name: 'Bebas Neue', value: "'Bebas Neue', cursive" },
  { name: 'Impact', value: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  { name: 'Roboto Mono', value: "'Roboto Mono', monospace" },
  { name: 'Georgia', value: "Georgia, serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { name: 'Courier New', value: "'Courier New', Courier, monospace" }
];

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { scriptsService } from '@/lib/services/scriptsService';
import type {
  Script,
  ScriptFormat,
  ScriptMode,
  ScriptStatus,
  ScriptVersion,
  ScriptAttachment,
  ScriptBriefing,
  GenerationResult,
  GenerationProgress,
  CalendarSlotForScript,
  ThemeForScript,
  RetinaType,
  Platform,
} from '@/lib/dto/editorial.schema';

interface ScriptsState {
  scriptsByFormat: Record<ScriptFormat, Script[]>;
  currentScript: Script | null;
  versions: ScriptVersion[];
  attachments: ScriptAttachment[];
  generation: {
    status: 'idle' | 'generating' | 'complete' | 'error';
    progress: GenerationProgress | null;
    result: GenerationResult | null;
    error: string | null;
  };
  filters: {
    format: ScriptFormat | null;
    retinaType: RetinaType | null;
    platform: Platform | null;
    status: ScriptStatus | null;
  };
  selectedSource: {
    type: 'slot' | 'theme' | null;
    id: string | null;
    data: CalendarSlotForScript | ThemeForScript | null;
  };
  briefingDraft: Partial<ScriptBriefing> | null;
  availableSlots: CalendarSlotForScript[];
  availableThemes: ThemeForScript[];
  loading: boolean;
  error: string | null;
}

const initialState: ScriptsState = {
  scriptsByFormat: {
    video_curto: [],
    video_longo: [],
    live: [],
    carrossel: [],
    post_estatico: [],
    stories_sequence: [],
  },
  currentScript: null,
  versions: [],
  attachments: [],
  generation: {
    status: 'idle',
    progress: null,
    result: null,
    error: null,
  },
  filters: {
    format: null,
    retinaType: null,
    platform: null,
    status: null,
  },
  selectedSource: {
    type: null,
    id: null,
    data: null,
  },
  briefingDraft: null,
  availableSlots: [],
  availableThemes: [],
  loading: false,
  error: null,
};

export const fetchScripts = createAsyncThunk(
  'scripts/fetchScripts',
  async ({ projectId, format }: { projectId: string; format?: ScriptFormat }, { rejectWithValue }) => {
    try {
      const scripts = await scriptsService.listScripts(projectId, format);
      return { scripts, format };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Falha ao carregar roteiros.');
    }
  },
);

export const fetchScript = createAsyncThunk(
  'scripts/fetchScript',
  async ({ projectId, scriptId }: { projectId: string; scriptId: string }, { rejectWithValue }) => {
    try {
      return await scriptsService.getScript(projectId, scriptId);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Falha ao carregar roteiro.');
    }
  },
);

export const generateScript = createAsyncThunk(
  'scripts/generateScript',
  async (
    { projectId, scriptId, briefing }: { projectId: string; scriptId: string; briefing: ScriptBriefing },
    { rejectWithValue },
  ) => {
    try {
      return await scriptsService.generateScript(projectId, scriptId, briefing);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Falha ao gerar roteiro.');
    }
  },
);

export const fetchVersions = createAsyncThunk(
  'scripts/fetchVersions',
  async ({ projectId, scriptId }: { projectId: string; scriptId: string }, { rejectWithValue }) => {
    try {
      return await scriptsService.listVersions(projectId, scriptId);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Falha ao carregar versões.');
    }
  },
);

export const fetchAttachments = createAsyncThunk(
  'scripts/fetchAttachments',
  async ({ projectId, scriptId }: { projectId: string; scriptId: string }, { rejectWithValue }) => {
    try {
      return await scriptsService.listAttachments(projectId, scriptId);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Falha ao carregar anexos.');
    }
  },
);

export const fetchSlotsByFormat = createAsyncThunk(
  'scripts/fetchSlotsByFormat',
  async ({ projectId, format }: { projectId: string; format: ScriptFormat }, { rejectWithValue }) => {
    try {
      return await scriptsService.listSlotsByFormat(projectId, format);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Falha ao carregar slots.');
    }
  },
);

export const fetchThemesByFormat = createAsyncThunk(
  'scripts/fetchThemesByFormat',
  async ({ projectId, format }: { projectId: string; format: ScriptFormat }, { rejectWithValue }) => {
    try {
      return await scriptsService.listThemesByFormat(projectId, format);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Falha ao carregar temas.');
    }
  },
);

const scriptsSlice = createSlice({
  name: 'scripts',
  initialState,
  reducers: {
    setCurrentScript(state, action: PayloadAction<Script | null>) {
      state.currentScript = action.payload;
    },
    setGenerationStatus(state, action: PayloadAction<ScriptsState['generation']['status']>) {
      state.generation.status = action.payload;
    },
    setGenerationProgress(state, action: PayloadAction<GenerationProgress | null>) {
      state.generation.progress = action.payload;
    },
    setGenerationResult(state, action: PayloadAction<GenerationResult | null>) {
      state.generation.result = action.payload;
    },
    clearGeneration(state) {
      state.generation = { status: 'idle', progress: null, result: null, error: null };
    },
    setFilter(state, action: PayloadAction<Partial<ScriptsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedSource(state, action: PayloadAction<ScriptsState['selectedSource']>) {
      state.selectedSource = action.payload;
    },
    setBriefingDraft(state, action: PayloadAction<Partial<ScriptBriefing> | null>) {
      state.briefingDraft = action.payload;
    },
    updateScriptBlock(state, action: PayloadAction<{ blockId: string; content: string }>) {
      if (!state.currentScript) return;
      state.currentScript.blocks = state.currentScript.blocks.map((b) =>
        b.id === action.payload.blockId ? { ...b, content: action.payload.content } : b,
      );
    },
    updateScriptCaption(state, action: PayloadAction<string>) {
      if (state.currentScript) state.currentScript.caption = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchScripts
      .addCase(fetchScripts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchScripts.fulfilled, (state, action) => {
        state.loading = false;
        const { scripts, format } = action.payload;
        if (format) {
          state.scriptsByFormat[format] = scripts;
        } else {
          const grouped: Record<ScriptFormat, Script[]> = {
            video_curto: [], video_longo: [], live: [], carrossel: [], post_estatico: [], stories_sequence: [],
          };
          for (const script of scripts) {
            if (grouped[script.format]) grouped[script.format].push(script);
          }
          state.scriptsByFormat = grouped;
        }
      })
      .addCase(fetchScripts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // fetchScript
      .addCase(fetchScript.pending, (state) => { state.loading = true; })
      .addCase(fetchScript.fulfilled, (state, action) => { state.loading = false; state.currentScript = action.payload; })
      .addCase(fetchScript.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // generateScript
      .addCase(generateScript.pending, (state) => {
        state.generation.status = 'generating';
        state.generation.progress = { phase: 'analyzing', message: 'Analisando matriz RETINA do calendário e arquitetando o esqueleto...', percent: 10 };
        state.generation.error = null;
      })
      .addCase(generateScript.fulfilled, (state, action) => {
        state.generation.status = 'complete';
        state.generation.progress = { phase: 'complete', message: 'Roteiro gerado com sucesso!', percent: 100 };
        state.generation.result = action.payload;
      })
      .addCase(generateScript.rejected, (state, action) => {
        state.generation.status = 'error';
        state.generation.error = action.payload as string;
      })
      // fetchVersions
      .addCase(fetchVersions.fulfilled, (state, action) => { state.versions = action.payload; })
      // fetchAttachments
      .addCase(fetchAttachments.fulfilled, (state, action) => { state.attachments = action.payload; })
      // fetchSlotsByFormat
      .addCase(fetchSlotsByFormat.fulfilled, (state, action) => { state.availableSlots = action.payload; })
      // fetchThemesByFormat
      .addCase(fetchThemesByFormat.fulfilled, (state, action) => { state.availableThemes = action.payload; });
  },
});

export const {
  setCurrentScript,
  setGenerationStatus,
  setGenerationProgress,
  setGenerationResult,
  clearGeneration,
  setFilter,
  setSelectedSource,
  setBriefingDraft,
  updateScriptBlock,
  updateScriptCaption,
  clearError,
} = scriptsSlice.actions;

export default scriptsSlice.reducer;
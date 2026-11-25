import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { apiFetchMyCompanies } from '@/lib/services/companyService';
import { apiListCompanyBrands } from '@/lib/services/brandService';
import { IBrand, ICompany, ICompanySettings, ICompanyWithAccess } from '@/types/company';

interface CompanyState {
  list: ICompanyWithAccess[];
  currentCompany: ICompanyWithAccess | null;
  brands: IBrand[];
  selectedBrandId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  brandsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CompanyState = {
  list: [],
  currentCompany: null,
  brands: [],
  selectedBrandId: null,
  status: 'idle',
  brandsStatus: 'idle',
  error: null,
};

export const fetchMyCompanies = createAsyncThunk(
  'companies/fetchMyCompanies',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      if (!state.auth.token) {
        return rejectWithValue('Usuário não autenticado');
      }
      return await apiFetchMyCompanies();
    } catch (err: any) {
      return rejectWithValue(err);
    }
  },
);

export const fetchCompanyBrands = createAsyncThunk(
  'companies/fetchCompanyBrands',
  async (companyId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      if (!state.auth.token) {
        return rejectWithValue('Usuário não autenticado');
      }
      return await apiListCompanyBrands(companyId);
    } catch (err: any) {
      return rejectWithValue(err);
    }
  },
);

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setCurrentCompany(state, action: PayloadAction<string>) {
      const selected = state.list.find(
        (item) => item._id === action.payload || item.id === action.payload,
      );
      if (selected) {
        state.currentCompany = selected;
        state.selectedBrandId = null;
        state.brands = [];
        state.brandsStatus = 'idle';
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('last_company_id', selected._id);
        }
      }
    },

    setSelectedBrandId(state, action: PayloadAction<string | null>) {
      state.selectedBrandId = action.payload;
    },

    addCompany(state, action: PayloadAction<ICompanyWithAccess>) {
      state.list.unshift(action.payload);
      state.currentCompany = action.payload;
      state.selectedBrandId = null;
      state.brands = [];
      state.brandsStatus = 'idle';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('last_company_id', action.payload._id);
      }
    },

    updateCurrentCompanySettings(state, action: PayloadAction<ICompanySettings>) {
      if (state.currentCompany) {
        state.currentCompany.settings = action.payload;
        const idx = state.list.findIndex(
          (c) => c._id === state.currentCompany!._id,
        );
        if (idx !== -1) {
          state.list[idx].settings = action.payload;
        }
      }
    },

    updateCompanyInList(
      state,
      action: PayloadAction<Partial<ICompany> & { _id: string }>,
    ) {
      const idx = state.list.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) {
        state.list[idx] = { ...state.list[idx], ...action.payload };
      }
      if (state.currentCompany?._id === action.payload._id) {
        state.currentCompany = { ...state.currentCompany, ...action.payload };
      }
    },

    removeCompanyFromList(state, action: PayloadAction<string>) {
      state.list = state.list.filter((c) => c._id !== action.payload);
      if (state.currentCompany?._id === action.payload) {
        state.currentCompany = state.list[0] || null;
        state.selectedBrandId = null;
        state.brands = [];
        state.brandsStatus = 'idle';
        if (typeof window !== 'undefined') {
          if (state.currentCompany) {
            window.localStorage.setItem('last_company_id', state.currentCompany._id);
          } else {
            window.localStorage.removeItem('last_company_id');
          }
        }
      }
    },

    addBrand(state, action: PayloadAction<IBrand>) {
      state.brands.push(action.payload);
    },

    updateBrandInList(state, action: PayloadAction<IBrand>) {
      const idx = state.brands.findIndex((b) => b._id === action.payload._id);
      if (idx !== -1) {
        state.brands[idx] = action.payload;
      }
    },

    removeBrandFromList(state, action: PayloadAction<string>) {
      state.brands = state.brands.filter((b) => b._id !== action.payload);
      if (state.selectedBrandId === action.payload) {
        state.selectedBrandId = null;
      }
    },

    clearCompanyState(state) {
      state.list = [];
      state.currentCompany = null;
      state.brands = [];
      state.selectedBrandId = null;
      state.status = 'idle';
      state.brandsStatus = 'idle';
      state.error = null;
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('last_company_id');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCompanies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const companies = Array.isArray(action.payload) ? action.payload : [];
        state.list = companies;

        const savedId =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('last_company_id')
            : null;
        const currentId = state.currentCompany?._id || savedId;
        const matched = currentId
          ? companies.find((c) => c._id === currentId || c.id === currentId)
          : undefined;

        state.currentCompany = matched || companies[0] || null;
        if (state.currentCompany && typeof window !== 'undefined') {
          window.localStorage.setItem('last_company_id', state.currentCompany._id);
        }
      })
      .addCase(fetchMyCompanies.rejected, (state, action) => {
        state.status = 'failed';
        const payload = action.payload as any;
        state.error =
          typeof payload === 'string'
            ? payload
            : payload?.error?.message ||
              payload?.message ||
              action.error?.message ||
              'Erro ao carregar empresas';
      })
      .addCase(fetchCompanyBrands.pending, (state) => {
        state.brandsStatus = 'loading';
      })
      .addCase(fetchCompanyBrands.fulfilled, (state, action) => {
        state.brandsStatus = 'succeeded';
        state.brands = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCompanyBrands.rejected, (state) => {
        state.brandsStatus = 'failed';
      });
  },
});

export const {
  setCurrentCompany,
  setSelectedBrandId,
  addCompany,
  updateCurrentCompanySettings,
  updateCompanyInList,
  removeCompanyFromList,
  addBrand,
  updateBrandInList,
  removeBrandFromList,
  clearCompanyState,
} = companySlice.actions;

export const selectAllCompanies = (state: RootState) => state.companies.list;
export const selectCurrentCompany = (state: RootState) =>
  state.companies.currentCompany;
export const selectCompanyBrands = (state: RootState) => state.companies.brands;
export const selectSelectedBrandId = (state: RootState) =>
  state.companies.selectedBrandId;
export const selectCompanyStatus = (state: RootState) => state.companies.status;

export default companySlice.reducer;

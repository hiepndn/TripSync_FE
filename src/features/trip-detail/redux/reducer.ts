import { Group } from '@/models/group';
import {
  FETCH_GROUP_DETAIL_REQUEST,
  FETCH_GROUP_DETAIL_SUCCESS,
  FETCH_GROUP_DETAIL_FAILURE,
  FETCH_ACTIVITIES_REQUEST,
  FETCH_ACTIVITIES_SUCCESS,
  FETCH_ACTIVITIES_FAILURE,
  VOTE_ACTIVITY_SUCCESS,
  FINALIZE_ACTIVITY_SUCCESS,
  ADD_ACTIVITY_SUCCESS,
  ADD_ACTIVITY_REQUEST,
  FINALIZE_ACTIVITY_REQUEST,
  VOTE_ACTIVITY_REQUEST,
  ADD_ACTIVITY_FAILURE,
  FINALIZE_ACTIVITY_FAILURE,
  VOTE_ACTIVITY_FAILURE,
  DELETE_ACTIVITY_FAILURE,
  DELETE_ACTIVITY_REQUEST,
  DELETE_ACTIVITY_SUCCESS,
  UPDATE_ACTIVITY_FAILURE,
  UPDATE_ACTIVITY_REQUEST,
  UPDATE_ACTIVITY_SUCCESS,
  REGENERATE_AI_FAILURE,
  REGENERATE_AI_REQUEST,
  REGENERATE_AI_SUCCESS,
  CREATE_EXPENSE_FAILURE,
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  GET_DEBTS_FAILURE,
  GET_DEBTS_REQUEST,
  GET_DEBTS_SUCCESS,
  GET_EXPENSE_SUMMARY_REQUEST,
  GET_EXPENSE_SUMMARY_SUCCESS,
  GET_EXPENSE_SUMMARY_FAILURE,
  GET_EXPENSE_LIST_REQUEST,
  GET_EXPENSE_LIST_SUCCESS,
  GET_EXPENSE_LIST_FAILURE,
  ASSIGN_CHECKLIST_FAILURE,
  ASSIGN_CHECKLIST_REQUEST,
  ASSIGN_CHECKLIST_SUCCESS,
  CREATE_CHECKLIST_FAILURE,
  CREATE_CHECKLIST_REQUEST,
  CREATE_CHECKLIST_SUCCESS,
  GET_CHECKLIST_FAILURE,
  GET_CHECKLIST_REQUEST,
  GET_CHECKLIST_SUCCESS,
  TOGGLE_CHECKLIST_FAILURE,
  TOGGLE_CHECKLIST_REQUEST,
  TOGGLE_CHECKLIST_SUCCESS,
  DELETE_CHECKLIST_FAILURE,
  DELETE_CHECKLIST_REQUEST,
  DELETE_CHECKLIST_SUCCESS,
} from './types';

interface TripDetailState {
  groupDetail: Group | null; // = group_info từ BE
  members: any[]; // danh sách thành viên
  myRole: string | null; // role của user hiện tại
  activities: any[];
  loading: boolean;
  activitiesLoading: boolean;
  debtsLoading: boolean;
  debts: any[]; // 🌟 Mảng công nợ trả về từ API
  expenseSummary: any;
  summaryLoading: boolean;
  expenseList: any[]; // 🌟 Lịch sử khoản chi thật từ API
  expenseListLoading: boolean;
  error: string | null;
  checklist: any[];
  checklistLoading: boolean;
}

const initialState: TripDetailState = {
  groupDetail: null,
  members: [],
  myRole: null,
  activities: [],
  loading: false,
  activitiesLoading: false,
  debtsLoading: false,
  debts: [],
  expenseSummary: null,
  summaryLoading: false,
  expenseList: [],
  expenseListLoading: false,
  error: null,
  checklist: [],
  checklistLoading: false,
};

export const tripDetailReducer = (state = initialState, action: any): TripDetailState => {
  switch (action.type) {
    // ===== GROUP DETAIL =====
    case FETCH_GROUP_DETAIL_REQUEST:
      return { ...state, loading: true, error: null };

    // payload = { group_info: {...}, members: [...], my_role: "ADMIN" }
    case FETCH_GROUP_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        groupDetail: action.payload.group_info ?? action.payload,
        members: action.payload.members ?? [],
        myRole: action.payload.my_role ?? null,
      };

    case FETCH_GROUP_DETAIL_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ===== ACTIVITIES =====
    case FETCH_ACTIVITIES_REQUEST:
      return { ...state, activitiesLoading: true, error: null };

    case FETCH_ACTIVITIES_SUCCESS:
      return { ...state, activitiesLoading: false, activities: action.payload ?? [] };

    case FETCH_ACTIVITIES_FAILURE:
      return { ...state, activitiesLoading: false, error: action.payload };

    // ===== ADD / VOTE / FINALIZE =====
    case ADD_ACTIVITY_REQUEST:
    case VOTE_ACTIVITY_REQUEST:
    case FINALIZE_ACTIVITY_REQUEST:
      return { ...state, error: null };
    case UPDATE_ACTIVITY_REQUEST:
    case DELETE_ACTIVITY_REQUEST:
      return { ...state, error: null };

    case VOTE_ACTIVITY_SUCCESS:
    case FINALIZE_ACTIVITY_SUCCESS:
    case ADD_ACTIVITY_SUCCESS:
      return { ...state };
    case UPDATE_ACTIVITY_SUCCESS:
    case DELETE_ACTIVITY_SUCCESS:
      return { ...state };

    case ADD_ACTIVITY_FAILURE:
    case VOTE_ACTIVITY_FAILURE:
    case FINALIZE_ACTIVITY_FAILURE:
      return { ...state, activitiesLoading: false, error: action.payload };
    case UPDATE_ACTIVITY_FAILURE:
    case DELETE_ACTIVITY_FAILURE:
      return { ...state, error: action.payload };

    // ===== REGENERATE AI =====
    case REGENERATE_AI_REQUEST:
      return { ...state, error: null };

    case REGENERATE_AI_SUCCESS:
      return {
        ...state,
        // 🌟 Cập nhật thẳng cờ AI thành true để UI tự động đổi sang màn hình Banner Loading
        groupDetail: state.groupDetail ? { ...state.groupDetail, is_ai_generating: true } : null,
      };

    case REGENERATE_AI_FAILURE:
      return { ...state, error: action.payload };

    // ==========================================
    // CHI PHÍ & CÔNG NỢ (SMART BILL SPLITTER)
    // ==========================================

    // 1. Lấy danh sách công nợ
    case GET_DEBTS_REQUEST:
      return { ...state, debtsLoading: true, error: null };

    case GET_DEBTS_SUCCESS:
      return {
        ...state,
        debtsLoading: false,
        debts: action.payload, // 🌟 Đập cái mảng JSON API trả về vào đây
      };

    case GET_DEBTS_FAILURE:
      return { ...state, debtsLoading: false, error: action.payload };

    // 2. Tạo khoản chi mới
    case CREATE_EXPENSE_REQUEST:
      return { ...state, error: null };
    // (Không set loading chung ở đây để tránh giật UI toàn trang, loading của form tạo khoản chi ông tự handle bằng local state trong Component là đẹp nhất)

    case CREATE_EXPENSE_SUCCESS:
      return { ...state }; // Thành công thì giữ nguyên, vì Action đã tự dispatch hàm fetch lại debts rồi

    case CREATE_EXPENSE_FAILURE:
      return { ...state, error: action.payload };

    // 3. Lấy Expense Summary
    case GET_EXPENSE_SUMMARY_REQUEST:
      return { ...state, summaryLoading: true, error: null };
    case GET_EXPENSE_SUMMARY_SUCCESS:
      return { ...state, summaryLoading: false, expenseSummary: action.payload };
    case GET_EXPENSE_SUMMARY_FAILURE:
      return { ...state, summaryLoading: false, error: action.payload };

    // 4. Lịch sử khoản chi thực (dùng cho ExpenseHistory)  
    case GET_EXPENSE_LIST_REQUEST:
      return { ...state, expenseListLoading: true, error: null };
    case GET_EXPENSE_LIST_SUCCESS:
      return { ...state, expenseListLoading: false, expenseList: action.payload ?? [] };
    case GET_EXPENSE_LIST_FAILURE:
      return { ...state, expenseListLoading: false, error: action.payload };
    // ==========================================
    // CHECKLIST
    // ==========================================
    case GET_CHECKLIST_REQUEST:
      return { ...state, checklistLoading: true, error: null };

    case GET_CHECKLIST_SUCCESS:
      return {
        ...state,
        checklistLoading: false,
        checklist: action.payload,
      };

    case GET_CHECKLIST_FAILURE:
      return { ...state, checklistLoading: false, error: action.payload };

    // Bọn Create, Toggle, Assign tui không set loading toàn cục để tránh giật UI,
    // vì action gọi xong sẽ tự trigger fetch lại data ngầm rồi.
    case CREATE_CHECKLIST_REQUEST:
    case TOGGLE_CHECKLIST_REQUEST:
    case ASSIGN_CHECKLIST_REQUEST:
    case DELETE_CHECKLIST_REQUEST:
      return { ...state, error: null };

    case CREATE_CHECKLIST_SUCCESS:
    case TOGGLE_CHECKLIST_SUCCESS:
    case ASSIGN_CHECKLIST_SUCCESS:
    case DELETE_CHECKLIST_SUCCESS:
      return { ...state };

    case CREATE_CHECKLIST_FAILURE:
    case TOGGLE_CHECKLIST_FAILURE:
    case ASSIGN_CHECKLIST_FAILURE:
    case DELETE_CHECKLIST_FAILURE:
      return { ...state, error: action.payload };
    

    default:
      return state;
  }
};

import { Dispatch } from 'redux';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import {
  FETCH_GROUP_DETAIL_REQUEST,
  FETCH_GROUP_DETAIL_SUCCESS,
  FETCH_GROUP_DETAIL_FAILURE,
  FETCH_ACTIVITIES_REQUEST,
  FETCH_ACTIVITIES_SUCCESS,
  FETCH_ACTIVITIES_FAILURE,
  VOTE_ACTIVITY_REQUEST,
  VOTE_ACTIVITY_SUCCESS,
  VOTE_ACTIVITY_FAILURE,
  FINALIZE_ACTIVITY_REQUEST,
  FINALIZE_ACTIVITY_SUCCESS,
  FINALIZE_ACTIVITY_FAILURE,
  ADD_ACTIVITY_REQUEST,
  ADD_ACTIVITY_SUCCESS,
  ADD_ACTIVITY_FAILURE,
  DELETE_ACTIVITY_FAILURE,
  DELETE_ACTIVITY_REQUEST,
  DELETE_ACTIVITY_SUCCESS,
  DELETE_ALL_ACTIVITIES_FAILURE,
  DELETE_ALL_ACTIVITIES_REQUEST,
  DELETE_ALL_ACTIVITIES_SUCCESS,
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
  SETTLE_DEBT_REQUEST,
  SETTLE_DEBT_SUCCESS,
  SETTLE_DEBT_FAILURE,
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
  RATE_ACTIVITY_REQUEST,
  RATE_ACTIVITY_SUCCESS,
  RATE_ACTIVITY_FAILURE,
  FETCH_SUGGESTIONS_REQUEST,
  FETCH_SUGGESTIONS_SUCCESS,
  FETCH_SUGGESTIONS_FAILURE,
  UPDATE_GROUP_REQUEST,
  UPDATE_GROUP_SUCCESS,
  UPDATE_GROUP_FAILURE,
  KICK_MEMBER_REQUEST,
  KICK_MEMBER_SUCCESS,
  KICK_MEMBER_FAILURE,
  DELETE_GROUP_REQUEST,
  DELETE_GROUP_SUCCESS,
  DELETE_GROUP_FAILURE,
  FETCH_DOCUMENTS_REQUEST,
  FETCH_DOCUMENTS_SUCCESS,
  FETCH_DOCUMENTS_FAILURE,
  DELETE_DOCUMENT_REQUEST,
  DELETE_DOCUMENT_SUCCESS,
  DELETE_DOCUMENT_FAILURE,
} from './types';
import { enqueueSnackbar } from 'notistack';

// ===== GET GROUP DETAIL (dùng cho polling is_ai_generating) =====
export const fetchGroupDetailAction = (groupId: string | number) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_GROUP_DETAIL_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.GROUP.GET_DETAIL(groupId),
    });

    // BE endpoint này trả về format: { data: { group_info, members, my_role }, message }
    const groupInfo = response?.data?.data?.group_info;
    console.log('[fetchGroupDetail] group_info:', groupInfo);
    console.log('[fetchGroupDetail] is_ai_generating:', groupInfo?.is_ai_generating);

    if (groupInfo) {
      dispatch({ type: FETCH_GROUP_DETAIL_SUCCESS, payload: response.data.data });
    } else {
      console.warn('[fetchGroupDetail] failed or unexpected format:', error || response?.data);
      dispatch({ type: FETCH_GROUP_DETAIL_FAILURE, payload: error || 'Lỗi khi tải thông tin nhóm' });
    }
  } catch (err: any) {
    dispatch({ type: FETCH_GROUP_DETAIL_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};

// ===== GET ACTIVITIES =====
export const fetchActivitiesAction = (groupId: string | number, isRefetch = false) => async (dispatch: Dispatch) => {
  if (!isRefetch) {
    dispatch({ type: FETCH_ACTIVITIES_REQUEST });
  }
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.ACTIVITY.LIST(groupId),
    });

    // BE trả về: { data: [...], message: "success" }
    const activities = response?.data?.data;
    if (Array.isArray(activities)) {
      dispatch({ type: FETCH_ACTIVITIES_SUCCESS, payload: activities });
    } else {
      dispatch({ type: FETCH_ACTIVITIES_FAILURE, payload: error || 'Lỗi khi tải danh sách hoạt động' });
    }
  } catch (err: any) {
    dispatch({ type: FETCH_ACTIVITIES_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};

// ===== VOTE ACTIVITY =====
export const voteActivityAction =
  (groupId: string | number, activityId: string | number, onSuccess?: () => void) => async (dispatch: any) => {
    dispatch({ type: VOTE_ACTIVITY_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.ACTIVITY.VOTE(groupId, activityId), // 🌟 Gọi hàm từ ENDPOINTS
      });
      console.log(response?.status === 200);
      if (response?.status === 200) {
        console.log('zooo');
        dispatch({ type: VOTE_ACTIVITY_SUCCESS });
        console.log('zooo2');
        if (onSuccess) onSuccess(); 
        
        // Nhớ vẫn phải truyền 'true' để không bật Loading màn hình nhé
        dispatch(fetchActivitiesAction(groupId, true) as any);
      } else {
        dispatch({ type: VOTE_ACTIVITY_FAILURE, payload: error || 'Lỗi khi vote' });
      }
    } catch (err: any) {
      dispatch({ type: VOTE_ACTIVITY_FAILURE, payload: err.message || 'Lỗi hệ thống' });
    }
  };

// ===== FINALIZE (CHỐT) ACTIVITY =====
export const finalizeActivityAction =
  (groupId: string | number, activityId: string | number, onSuccess?: () => void) => async (dispatch: any) => {
    dispatch({ type: FINALIZE_ACTIVITY_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'PATCH',
        url: ENDPOINTS.ACTIVITY.FINALIZE(groupId, activityId), // 🌟 Gọi hàm từ ENDPOINTS
      });

      if (response?.status === 200) { // 🌟 Chuẩn bài!
        dispatch({ type: FINALIZE_ACTIVITY_SUCCESS, payload: response.data?.data });
        if (onSuccess) onSuccess();
        
        dispatch(fetchActivitiesAction(groupId, true) as any);
      } else {
        dispatch({ type: FINALIZE_ACTIVITY_FAILURE, payload: error || 'Lỗi khi chốt hoạt động' });
      }
    } catch (err: any) {
      dispatch({ type: FINALIZE_ACTIVITY_FAILURE, payload: err.message || 'Lỗi hệ thống' });
    }
  };

// ===== ADD ACTIVITY THỦ CÔNG =====
export const addActivityAction =
  (groupId: string | number, data: any, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: ADD_ACTIVITY_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.ACTIVITY.CREATE(groupId),
        payload: data, 
      });

      // 🌟 SỬA Ở ĐÂY: Chỉ cần có response và không có error là Thành công!
      if (response && !error) {
        dispatch({ type: ADD_ACTIVITY_SUCCESS, payload: response.data });
        if (onSuccess) onSuccess();
        
        // 🌟 Gọi lại danh sách để tự động render thẻ mới ra ngoài UI ngay lập tức
        dispatch(fetchActivitiesAction(groupId) as any);
      } else {
        // Ưu tiên lấy message lỗi từ BE trả về
        const errMsg = error || response?.data?.message || response?.data?.error || 'Lỗi khi thêm hoạt động';
        dispatch({ type: ADD_ACTIVITY_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      dispatch({ type: ADD_ACTIVITY_FAILURE, payload: err.message || 'Lỗi hệ thống' });
      if (onError) onError(err.message || 'Lỗi hệ thống');
    }
  };

  // ===== UPDATE ACTIVITY =====
export const updateActivityAction =
  (groupId: string | number, activityId: string | number, data: any, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: UPDATE_ACTIVITY_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'PUT',
        url: ENDPOINTS.ACTIVITY.UPDATE(groupId, activityId),
        payload: data,
      });

      if (response?.status === 200) {
        dispatch({ type: UPDATE_ACTIVITY_SUCCESS });
        if (onSuccess) onSuccess();
        
        // 🌟 Fetch ngầm để cập nhật thẻ
        dispatch(fetchActivitiesAction(groupId, true) as any);
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi cập nhật hoạt động';
        dispatch({ type: UPDATE_ACTIVITY_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      dispatch({ type: UPDATE_ACTIVITY_FAILURE, payload: err.message || 'Lỗi hệ thống' });
      if (onError) onError(err.message || 'Lỗi hệ thống');
    }
  };

// ===== DELETE ACTIVITY =====
export const deleteActivityAction =
  (groupId: string | number, activityId: string | number, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: DELETE_ACTIVITY_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'DELETE',
        url: ENDPOINTS.ACTIVITY.DELETE(groupId, activityId),
      });

      if (response?.status === 200) {
        dispatch({ type: DELETE_ACTIVITY_SUCCESS });
        if (onSuccess) onSuccess();
        
        // 🌟 Fetch ngầm để làm thẻ biến mất ngay lập tức
        dispatch(fetchActivitiesAction(groupId, true) as any);
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi xóa hoạt động';
        dispatch({ type: DELETE_ACTIVITY_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      dispatch({ type: DELETE_ACTIVITY_FAILURE, payload: err.message || 'Lỗi hệ thống' });
      if (onError) onError(err.message || 'Lỗi hệ thống');
    }
  };

// ===== DELETE ALL ACTIVITIES =====
export const deleteAllActivitiesAction =
  (groupId: string | number, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: DELETE_ALL_ACTIVITIES_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'DELETE',
        url: ENDPOINTS.ACTIVITY.DELETE_ALL(groupId),
      });
      if (response?.status === 200) {
        dispatch({ type: DELETE_ALL_ACTIVITIES_SUCCESS });
        if (onSuccess) onSuccess();
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi xóa lịch trình';
        dispatch({ type: DELETE_ALL_ACTIVITIES_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      dispatch({ type: DELETE_ALL_ACTIVITIES_FAILURE, payload: err.message });
      if (onError) onError(err.message);
    }
  };
  export const regenerateAiAction =
  (groupId: string | number, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    // 🌟 1. Báo cho Redux biết đang bắt đầu gọi API
    dispatch({ type: REGENERATE_AI_REQUEST }); 

    try {
      const { response, error } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.GROUP.REGENERATE_AI(groupId),
      });

      if (response?.status === 200) {
        // 🌟 2. Báo thành công
        dispatch({ type: REGENERATE_AI_SUCCESS }); 
        if (onSuccess) onSuccess();
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi khởi tạo lại AI';
        // 🌟 3. Báo lỗi
        dispatch({ type: REGENERATE_AI_FAILURE, payload: errMsg }); 
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống';
      dispatch({ type: REGENERATE_AI_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  };
  
// ===== LẤY DANH SÁCH AI NỢ AI =====
export const fetchOptimalDebtsAction = (groupId: string | number) => async (dispatch: any) => {
  dispatch({ type: GET_DEBTS_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.EXPENSE.GET_DEBTS(groupId),
    });
    if (response?.status === 200) {
      dispatch({ type: GET_DEBTS_SUCCESS, payload: response.data.data }); // Hứng cái mảng "data" từ BE
    } else {
      dispatch({ type: GET_DEBTS_FAILURE, payload: error || 'Lỗi khi lấy công nợ' });
    }
  } catch (err: any) {
    dispatch({ type: GET_DEBTS_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};

// ===== LẤY THỐNG KÊ CHI TIÊU =====
export const fetchExpenseSummaryAction = (groupId: string | number) => async (dispatch: any) => {
  dispatch({ type: GET_EXPENSE_SUMMARY_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.EXPENSE.GET_SUMMARY(groupId),
    });
    if (response?.status === 200) {
      dispatch({ type: GET_EXPENSE_SUMMARY_SUCCESS, payload: response.data.data });
    } else {
      dispatch({ type: GET_EXPENSE_SUMMARY_FAILURE, payload: error || 'Lỗi khi lấy thống kê' });
    }
  } catch (err: any) {
    dispatch({ type: GET_EXPENSE_SUMMARY_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};

// ===== TẠO KHOẢN CHI MỚI =====
export const createExpenseAction = 
  (groupId: string | number, data: any, onSuccess?: () => void, onError?: (msg: string) => void) => 
  async (dispatch: any) => {
  dispatch({ type: CREATE_EXPENSE_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'POST',
      url: ENDPOINTS.EXPENSE.CREATE(groupId),
      payload: data,
    });

    if (response?.status === 201) { // 201 Created
      dispatch({ type: CREATE_EXPENSE_SUCCESS });
      if (onSuccess) onSuccess();
      // Tạo xong thì tự động fetch lại bảng nợ để UI update ngay và luôn
      dispatch(fetchOptimalDebtsAction(groupId) as any); 
      dispatch(fetchExpenseSummaryAction(groupId) as any);
    } else {
      const errMsg = error || response?.data?.error || 'Lỗi khi tạo khoản chi';
      dispatch({ type: CREATE_EXPENSE_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  } catch (err: any) {
    const errMsg = err.message || 'Lỗi hệ thống';
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: errMsg });
    if (onError) onError(errMsg);
  }
};

// ===== CHỐT SỔ / THANH TOÁN CÔNG NỢ =====
export const settleDebtAction = 
  (groupId: string | number, data: { from_user_id: number, to_user_id: number, amount: number }, onSuccess?: () => void, onError?: (msg: string) => void) => 
  async (dispatch: any) => {
  dispatch({ type: SETTLE_DEBT_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'POST',
      url: ENDPOINTS.EXPENSE.SETTLE(groupId),
      payload: data,
    });

    if (response?.status === 200) {
      dispatch({ type: SETTLE_DEBT_SUCCESS });
      if (onSuccess) onSuccess();
      // Tự động đồng bộ lại UI
      dispatch(fetchOptimalDebtsAction(groupId) as any); 
      dispatch(fetchExpenseSummaryAction(groupId) as any);
    } else {
      const errMsg = error || response?.data?.error || 'Lỗi khi thanh toán';
      dispatch({ type: SETTLE_DEBT_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  } catch (err: any) {
    const errMsg = err.message || 'Lỗi hệ thống';
    dispatch({ type: SETTLE_DEBT_FAILURE, payload: errMsg });
    if (onError) onError(errMsg);
  }
};

// ===== LẤY DANH SÁCH LỊCH SỬ KHOẢN CHI (để hiển thị ExpenseHistory) =====
export const fetchExpenseListAction = (groupId: string | number) => async (dispatch: any) => {
  dispatch({ type: GET_EXPENSE_LIST_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.EXPENSE.GET_LIST(groupId),
    });
    if (response?.status === 200) {
      dispatch({ type: GET_EXPENSE_LIST_SUCCESS, payload: response.data.data });
    } else {
      dispatch({ type: GET_EXPENSE_LIST_FAILURE, payload: error || 'Lỗi khi lấy lịch sử chi tiêu' });
    }
  } catch (err: any) {
    dispatch({ type: GET_EXPENSE_LIST_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};

// ===== LẤY DANH SÁCH CHECKLIST =====
export const fetchChecklistAction = (groupId: string | number) => async (dispatch: any) => {
  dispatch({ type: GET_CHECKLIST_REQUEST });
  try {
    const { response, error } = await apiCall({ method: 'GET', url: ENDPOINTS.CHECKLIST.GET_ALL(groupId) });
    if (response?.status === 200) {
      dispatch({ type: GET_CHECKLIST_SUCCESS, payload: response.data.data });
    } else {
      dispatch({ type: GET_CHECKLIST_FAILURE, payload: error });
    }
  } catch (err: any) {
    dispatch({ type: GET_CHECKLIST_FAILURE, payload: err.message });
  }
};

// ===== TẠO CÔNG VIỆC MỚI =====
export const createChecklistAction = (groupId: string | number, data: { title: string, category: string }) => async (dispatch: any) => {
  dispatch({ type: CREATE_CHECKLIST_REQUEST });
  try {
    const { response } = await apiCall({ method: 'POST', url: ENDPOINTS.CHECKLIST.CREATE(groupId), payload: data });
    if (response?.status === 201) {
      dispatch({ type: CREATE_CHECKLIST_SUCCESS });
      dispatch(fetchChecklistAction(groupId) as any); // Render lại UI
    } else {
      dispatch({ type: CREATE_CHECKLIST_FAILURE });
    }
  } catch (error) {
    dispatch({ type: CREATE_CHECKLIST_FAILURE });
  }
};

// ===== TICK HOÀN THÀNH =====
export const toggleChecklistAction = (groupId: string | number, itemId: number) => async (dispatch: any) => {
  dispatch({ type: TOGGLE_CHECKLIST_REQUEST });
  try {
    const { response } = await apiCall({ method: 'PATCH', url: ENDPOINTS.CHECKLIST.TOGGLE(groupId, itemId) });
    if (response?.status === 200) {
      dispatch({ type: TOGGLE_CHECKLIST_SUCCESS });
      dispatch(fetchChecklistAction(groupId) as any);
    } else {
      dispatch({ type: TOGGLE_CHECKLIST_FAILURE });
    }
  } catch (error) {
    dispatch({ type: TOGGLE_CHECKLIST_FAILURE });
  }
};

// ===== NHẬN VIỆC / PHÂN CÔNG =====
export const assignChecklistAction = (groupId: string | number, itemId: number, assigneeId: number | null) => async (dispatch: any) => {
  dispatch({ type: ASSIGN_CHECKLIST_REQUEST });
  try {
    const { response } = await apiCall({ method: 'PATCH', url: ENDPOINTS.CHECKLIST.ASSIGN(groupId, itemId), payload: { assignee_id: assigneeId } });
    if (response?.status === 200) {
      dispatch({ type: ASSIGN_CHECKLIST_SUCCESS });
      dispatch(fetchChecklistAction(groupId) as any);
    } else {
      dispatch({ type: ASSIGN_CHECKLIST_FAILURE });
    }
  } catch (error) {
    dispatch({ type: ASSIGN_CHECKLIST_FAILURE });
  }
};

// ===== XÓA CÔNG VIỆC TỪNG ITEM =====
export const deleteChecklistAction = (groupId: string | number, itemId: number, enqueueSnackbar: any) => async (dispatch: any) => {
  dispatch({ type: DELETE_CHECKLIST_REQUEST });
  try {
    const { response, error } = await apiCall({ 
      method: 'DELETE', 
      url: ENDPOINTS.CHECKLIST.DELETE(groupId, itemId) 
    });
    
    if (response?.status === 200) {
      dispatch({ type: DELETE_CHECKLIST_SUCCESS });
      enqueueSnackbar("Đã xóa công việc!", { variant: 'success', autoHideDuration: 3000 });
      dispatch(fetchChecklistAction(groupId) as any); 
    } else {
      const errMsg = error || response?.data?.error || 'Lỗi khi xóa công việc';
      dispatch({ type: DELETE_CHECKLIST_FAILURE, payload: errMsg });
      enqueueSnackbar(errMsg, { variant: 'error', autoHideDuration: 3000 });
    }
  } catch (error: any) {
    const errMsg = error.message || 'Lỗi hệ thống khi xóa';
    dispatch({ type: DELETE_CHECKLIST_FAILURE, payload: errMsg });
    enqueueSnackbar(errMsg, { variant: 'error', autoHideDuration: 3000 });
  }
};

// ===== RATE ACTIVITY =====
export const rateActivityAction =
  (
    groupId: string | number,
    activityId: string | number,
    rating: number,
    onSuccess?: () => void,
    onError?: (msg: string) => void,
  ) =>
  async (dispatch: any) => {
    dispatch({ type: RATE_ACTIVITY_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.ACTIVITY.RATE(groupId, activityId),
        payload: { rating },
      });

      if (response?.status === 200) {
        dispatch({ type: RATE_ACTIVITY_SUCCESS });
        if (onSuccess) onSuccess();
        dispatch(fetchActivitiesAction(groupId, true) as any);
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi đánh giá hoạt động';
        dispatch({ type: RATE_ACTIVITY_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống';
      dispatch({ type: RATE_ACTIVITY_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  };

// ===== FETCH SUGGESTIONS =====
export const fetchSuggestionsAction =
  (groupId: string | number, type: string, location: string) =>
  async (dispatch: any) => {
    dispatch({ type: FETCH_SUGGESTIONS_REQUEST });
    try {
      const url = `${ENDPOINTS.ACTIVITY.SUGGESTIONS(groupId)}?type=${encodeURIComponent(type)}&location=${encodeURIComponent(location)}`;
      const { response, error } = await apiCall({ method: 'GET', url });

      if (response?.status === 200) {
        const data = response.data?.data ?? [];
        dispatch({ type: FETCH_SUGGESTIONS_SUCCESS, payload: data });
        return data;
      } else {
        dispatch({ type: FETCH_SUGGESTIONS_FAILURE, payload: error || 'Lỗi khi lấy gợi ý' });
        return [];
      }
    } catch (err: any) {
      dispatch({ type: FETCH_SUGGESTIONS_FAILURE, payload: err.message || 'Lỗi hệ thống' });
      return [];
    }
  };

// ===== UPDATE GROUP =====
export const updateGroupAction =
  (groupId: string | number, data: any, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: UPDATE_GROUP_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'PUT',
        url: ENDPOINTS.GROUP.UPDATE(groupId),
        payload: data,
      });
      if (response?.status === 200) {
        dispatch({ type: UPDATE_GROUP_SUCCESS });
        if (onSuccess) onSuccess();
        dispatch(fetchGroupDetailAction(groupId) as any);
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi cập nhật nhóm';
        dispatch({ type: UPDATE_GROUP_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống';
      dispatch({ type: UPDATE_GROUP_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  };

// ===== KICK MEMBER =====
export const kickMemberAction =
  (groupId: string | number, userId: string | number, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: KICK_MEMBER_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'DELETE',
        url: ENDPOINTS.GROUP.KICK_MEMBER(groupId, userId),
      });
      if (response?.status === 200) {
        dispatch({ type: KICK_MEMBER_SUCCESS });
        if (onSuccess) onSuccess();
        dispatch(fetchGroupDetailAction(groupId) as any);
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi xóa thành viên';
        dispatch({ type: KICK_MEMBER_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống';
      dispatch({ type: KICK_MEMBER_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  };

// ===== DELETE GROUP =====
export const deleteGroupAction =
  (groupId: string | number, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: DELETE_GROUP_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'DELETE',
        url: ENDPOINTS.GROUP.DELETE(groupId),
      });
      if (response?.status === 200) {
        dispatch({ type: DELETE_GROUP_SUCCESS });
        if (onSuccess) onSuccess();
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi xóa nhóm';
        dispatch({ type: DELETE_GROUP_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống';
      dispatch({ type: DELETE_GROUP_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  };

// ===== FETCH DOCUMENTS =====
export const fetchDocumentsAction = (groupId: string | number) => async (dispatch: any) => {
  dispatch({ type: FETCH_DOCUMENTS_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.DOCUMENT.LIST(groupId),
    });
    if (response?.status === 200) {
      dispatch({ type: FETCH_DOCUMENTS_SUCCESS, payload: response.data.data ?? [] });
    } else {
      dispatch({ type: FETCH_DOCUMENTS_FAILURE, payload: error || 'Lỗi khi lấy danh sách tài liệu' });
    }
  } catch (err: any) {
    dispatch({ type: FETCH_DOCUMENTS_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};

// ===== DELETE DOCUMENT =====
export const deleteDocumentAction =
  (groupId: string | number, docId: string | number, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: any) => {
    dispatch({ type: DELETE_DOCUMENT_REQUEST });
    try {
      const { response, error } = await apiCall({
        method: 'DELETE',
        url: ENDPOINTS.DOCUMENT.DELETE(groupId, docId),
      });
      if (response?.status === 200) {
        dispatch({ type: DELETE_DOCUMENT_SUCCESS, payload: docId });
        if (onSuccess) onSuccess();
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi khi xóa tài liệu';
        dispatch({ type: DELETE_DOCUMENT_FAILURE, payload: errMsg });
        if (onError) onError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi hệ thống';
      dispatch({ type: DELETE_DOCUMENT_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  };

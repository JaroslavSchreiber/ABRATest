// reducers.ts
import { setData, setCurrentPage, setPageSize } from './actions';


interface CustomerListState {
  pageSize: number;
  currentPage: number;
  pageCount: number;
}

interface RootState {
  data: any[];
  customerList: CustomerListState;
}

const initialState: RootState = {
  data: [],
  customerList: {
    pageSize: 10,
    currentPage: 1,
    pageCount: 1
  }
};

type RootAction = ReturnType<typeof setData> | ReturnType<typeof setPageSize> | ReturnType<typeof setCurrentPage>;


const rootReducer = (state: RootState = initialState, action: RootAction) => {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload as any[],
      };
    case 'SET_PAGE_SIZE':
      return {
        ...state,
        customerList: {
          ...state.customerList,
          pageSize: action.payload,
        },
      };
    case 'SET_CURRENT_PAGE':
      return {
        ...state,
        customerList: {
          ...state.customerList,
          currentPage: action.payload,
        },
      };

    default:
      return state;
  }
};


export default rootReducer;

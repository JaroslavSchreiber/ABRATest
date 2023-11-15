// reducers.ts
import {setData} from './actions';

interface RootState {
    data: any[];
  }
  
  const initialState: RootState = {
    data: [],
  };
  
  type RootAction = ReturnType<typeof setData>;
  
  const rootReducer = (state: RootState = initialState, action: RootAction) => {
    switch (action.type) {
      case 'SET_DATA':
        return {
          ...state,
          data: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default rootReducer;
  
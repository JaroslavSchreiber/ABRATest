export const setData = (data: any[]) => ({
    type: 'SET_DATA' as const,
    payload: data
  });

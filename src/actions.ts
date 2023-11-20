export const setData = (data: any[]) => ({
    type: 'SET_DATA' as const,
    payload: data
  });
  export const setPageSize = (pageSize: number) => ({
    type: 'SET_PAGE_SIZE',
    payload: pageSize,
  });
  
  export const setCurrentPage = (currentPage: number) => ({
    type: 'SET_CURRENT_PAGE',
    payload: currentPage,
  });
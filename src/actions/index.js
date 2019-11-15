import * as types from '../constants';

// ACTIONS START
export const updateLineCounters = (sourceRows, resultRows, sourceScroll, resultScroll) => ({
  type: types.UPDATE_LINE_COUNTERS,
  sourceRows,
  resultRows,
  sourceScroll,
  resultScroll
});

export const editResult = result => ({ type: types.EDIT_RESULT, result });

export const editSource = source => ({ type: types.EDIT_SOURCE, source });

export const editAction = data => ({ type: types.EDIT_ACTION, ...data });

export const addAction = () => ({ type: types.ADD_ACTION });

export const deleteAction = id => ({ type: types.DELETE_ACTION, id });

export const deleteAllActions = () => ({ type: types.DELETE_ALL_ACTIONS });

export const toggleAction = id => ({ type: types.TOGGLE_ACTION, id });

export const toggleAllActions = () => ({ type: types.TOGGLE_ALL_ACTIONS });

// ACTIONS END

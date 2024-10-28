import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/tags', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tags');
      const fetchedTags = await response.json();
     
      return fetchedTags;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTag = createAsyncThunk(
  'tags/addTag',
  async (tagName, { rejectWithValue }) => {
    try {
      
      const response = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: tagName })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log("errorData in addTag in tagsSlice.js",errorData);
        throw new Error(errorData.message || 'Failed to add tag');
      }
      const addedTag = await response.json(); 
      return addedTag;
      
    } catch (error) {
      console.error('Error in addTag:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (tagId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to delete tag');
      return tagId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tags/${tagData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(tagData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error in updateTag:', errorData);
        throw new Error(errorData.message || 'Failed to edit tag');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addTag.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.items = state.items.filter(tag => tag._id !== action.payload);
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        const index = state.items.findIndex(tag => tag._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default tagsSlice.reducer;
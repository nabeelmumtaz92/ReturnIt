import { DataProvider, fetchUtils } from 'react-admin';

const apiUrl = '/api';

// Custom data provider for React Admin that works with our existing API
export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    
    let url = `${apiUrl}/${resource}`;
    
    // Add query parameters for pagination and sorting if needed
    const query: Record<string, string> = {};
    if (params.filter) {
      Object.keys(params.filter).forEach(key => {
        query[key] = params.filter[key];
      });
    }
    
    const { json } = await fetchUtils.fetchJson(url, {
      credentials: 'include',
    });
    
    const data = Array.isArray(json) ? json : [];
    
    // Client-side pagination and sorting for now
    let sortedData = [...data];
    if (field) {
      sortedData.sort((a: any, b: any) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return order === 'ASC' ? -1 : 1;
        if (aVal > bVal) return order === 'ASC' ? 1 : -1;
        return 0;
      });
    }
    
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = sortedData.slice(start, end);
    
    return {
      data: paginatedData,
      total: data.length,
    };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await fetchUtils.fetchJson(url, {
      credentials: 'include',
    });
    return { data: json };
  },

  getMany: async (resource, params) => {
    // Fetch multiple records by ID
    const promises = params.ids.map(id =>
      fetchUtils.fetchJson(`${apiUrl}/${resource}/${id}`, {
        credentials: 'include',
      })
    );
    const results = await Promise.all(promises);
    return { data: results.map(r => r.json) };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      ...params.filter,
      [params.target]: params.id,
    };
    
    const url = `${apiUrl}/${resource}?${new URLSearchParams(query).toString()}`;
    const { json } = await fetchUtils.fetchJson(url, {
      credentials: 'include',
    });
    
    const data = Array.isArray(json) ? json : [];
    return {
      data,
      total: data.length,
    };
  },

  create: async (resource, params) => {
    const url = `${apiUrl}/${resource}`;
    const { json } = await fetchUtils.fetchJson(url, {
      method: 'POST',
      body: JSON.stringify(params.data),
      credentials: 'include',
    });
    return { data: { ...params.data, id: json.id } };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const { json } = await fetchUtils.fetchJson(url, {
      method: 'PATCH',
      body: JSON.stringify(params.data),
      credentials: 'include',
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map(id =>
      fetchUtils.fetchJson(`${apiUrl}/${resource}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(params.data),
        credentials: 'include',
      })
    );
    const results = await Promise.all(promises);
    return { data: params.ids };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    await fetchUtils.fetchJson(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    return { data: params.previousData };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map(id =>
      fetchUtils.fetchJson(`${apiUrl}/${resource}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },
};

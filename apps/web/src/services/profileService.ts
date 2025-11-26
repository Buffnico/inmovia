const API_URL = 'http://localhost:3001/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const ProfileService = {
    getMyProfile: async () => {
        const res = await fetch(`${API_URL}/profile/me`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Error fetching profile');
        return res.json();
    },

    updateMyProfile: async (data: any) => {
        const res = await fetch(`${API_URL}/profile/me`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Error updating profile');
        return res.json();
    },

    getOfficeConfig: async () => {
        const res = await fetch(`${API_URL}/profile/office`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Error fetching office config');
        return res.json();
    },

    updateOfficeConfig: async (data: any) => {
        const res = await fetch(`${API_URL}/profile/office`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Error updating office config');
        return res.json();
    },

    changePassword: async (data: any) => {
        const res = await fetch(`${API_URL}/profile/change-password`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error changing password');
        return json;
    }
};

export default ProfileService;

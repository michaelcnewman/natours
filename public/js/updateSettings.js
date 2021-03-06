/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (data, type) => {
    //type is either data or password
    try {
        const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url: url,
            data: data,
        });

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully.`);
            window.setTimeout(() => {
                location.assign('/me');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

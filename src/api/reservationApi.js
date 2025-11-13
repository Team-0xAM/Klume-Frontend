import axios from './axios'

export const getWeeklyReservations = (organizationId, startDate, endDate) => {
    return axios.get(`/organizations/${organizationId}/reservations/status/week`, {
        params: { startDate, endDate },
    })
}

export const getDailyReservations = (organizationId, date) => {
    return axios.get(`/organizations/${organizationId}/reservations/status/day`, {
        params: { date },
    })
}

export const cancelReservation = (organizationId, roomId, reservationId) => {
    return axios.put(
        `/organizations/${organizationId}/rooms/${roomId}/reservations/${reservationId}`
    )
}

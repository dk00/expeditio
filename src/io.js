import {get, set, keys} from 'idb-keyval'

const getTripKeys = async () => keys()

const getTrip = async tripKey => get(tripKey)

const setTrip = async (tripKey, data) => set(tripKey, data)

export {getTripKeys, getTrip, setTrip}

import axios from 'axios'

const add = "https://localhost:44393/api/Parsel/add"
const list = "https://localhost:44393/api/Parsel/all"

class PolygonService {
    create(polygon) {
        return axios.post(add, polygon)
    }
    liste() {
        return axios.get(list);
    }
}

export default new PolygonService()
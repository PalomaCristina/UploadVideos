import axios from  'axios'

const api = axios.create({
    baseURL: 'https://cgexguqownwatvlxekzj.supabase.co'
})

export default api
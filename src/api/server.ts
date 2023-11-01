import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors' //cors é uma forma da gente bloquear com que o backend seja acessado apenas por alguns front ends especificos
import { getAllPromptsRoute } from './api/routes/get_all'
import { uploadVideoPrompt } from './api/routes/upload_video'
import { createTranscriptionRoute } from './api/routes/create-transcription'
import { generateAiCompletionRoute } from './api/routes/generate-ai-completion'


const app = fastify()

app.register(fastifyCors, {
    origin: '*',
    //o correto é colocar exatamente a url do frontend que ira acessar
})
app.register(getAllPromptsRoute)
app.register(uploadVideoPrompt)
app.register(createTranscriptionRoute)
app.register(generateAiCompletionRoute)
app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP Server Running perfectly!');
    
})

//DDL declaração do schema

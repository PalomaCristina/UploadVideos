import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createReadStream } from 'fs'
import { prisma } from '../lib/prisma'
import { openai } from '../lib/openai'

export async function createTranscriptionRoute(app: FastifyInstance) { //ela deve receber a minha aplicação como parâmetro (definida em server.ts) e preciso falar que ela é fastify
    app.post('/videos/:videoId/transcription', async (req) =>{ // transação deve ser assincrona, pois iremos consultar os dados do banco de dados e não podemos "prender" a interação
        const paramSchema = z.object({
            videoId: z.string().uuid(),
        })
        const { videoId } = paramSchema.parse(req.params)

        const bodySchema = z.object({
            prompt: z.string()
        })
        const { prompt } = bodySchema.parse(req.body)

        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        })

        const videoPath = video.path

        const audioReadStream = createReadStream(videoPath)

        const response = await openai.audio.transcriptions.create({
            file: audioReadStream,
            model: 'whisper-1',
            language: 'pt',
            response_format: 'json',
            temperature: 0,
            prompt,

        })
        
        const transcription = response.text;

        await prisma.video.update({
            where: {
                id: videoId,
            }, 
            data: {
                transcription,
            }
        })

        return {
            response
        } 
        })
}

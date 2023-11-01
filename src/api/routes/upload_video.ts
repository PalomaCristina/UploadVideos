import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { fastifyMultipart } from '@fastify/multipart'
import { randomUUID } from 'node:crypto' 
import path from 'node:path'
import fs  from 'node:fs'
import { pipeline } from 'node:stream' //o pipeline é responsavel por aguardar todo o download do arquivo e nos informa quando está concluido
import { promisify } from 'node:util' //utilizado para transformar bibliotecas do node que so funcionam com callback para trabalharem com promisses (async await)


const pump = promisify(pipeline)

export async function uploadVideoPrompt(app: FastifyInstance) { //ela deve receber a minha aplicação como parâmetro (definida em server.ts) e preciso falar que ela é fastify
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1848576*25 //25mb
            
        }
    })

    app.post('/videos', async (request, response) =>{ // transação deve ser assincrona, pois iremos consultar os dados do banco de dados e não podemos "prender" a interação
    const data = await request.file()  

    if(!data){//tratativa para caso nao venha nenhum arquivo
        return response.status(400).send({ error: 'Missing file input.'})
    }

    const extension = path.extname(data.filename)
    
    if(extension !== '.mp3'){
        return response.status(400).send({ error: 'Invalid input type, please upload MP3.'})
    }

    const fileBaseName = path.basename(data.filename, extension)

    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}` //salbvando o novo nome do arquivo com um id randomico

    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pump(data.file, fs.createWriteStream(uploadDestination)) //conforme vou recebendo o arquivo, já vou salvando ele no disco

    //inserindo no banco de dados o arquivo carregado
    const video = await prisma.video.create({
        data: {
          name: data.filename,
          path: uploadDestination
        }
    })

    return {
        video,
    }
    })
}

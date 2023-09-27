import { Label } from "./label";
import { Separator } from "./separator";
import { FileVideo, Upload } from "lucide-react";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import api from "@/lib/axios";

type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success'

const statusMessages = {
    converting: 'Convertendo...',
    generating: 'Transcrevendo...',
    uploading: 'Carregando...',
    success: 'Sucesso!',
}

interface VideoInputFormProps {
    onVideoUploaded: (id: string) => void
}

export function InputFormVideo(props: VideoInputFormProps) {
    const [videoFile, setVideoFile] = useState<File | null>(null) //estado em react é toda a variavel que queremos monitorar a troca de valores dela
    const [status, setStatus] = useState<Status>('waiting')

    const promptInputRef = useRef<HTMLTextAreaElement>(null)

    //ex: quando o cliente incluir um video, vamos mostar o preview dele
    function handleFileSelect(event: ChangeEvent<HTMLInputElement>) { //precisamos tipar esse parametro
        const { files } = event.currentTarget

        if (!files) {
            return
        }
        const selectedFile = files[0]

        setVideoFile(selectedFile)
    }

    async function convertVideoToAudio(video: File) {
        console.log('Convert started.')

        const ffmpeg = await getFFmpeg()

        await ffmpeg.writeFile('input.mp4', await fetchFile(video))

        // ffmpeg.on('log', log => {
        //   console.log(log)
        // })

        ffmpeg.on('progress', progress => {
            console.log('Convert progress: ' + Math.round(progress.progress * 100))
        })

        await ffmpeg.exec([
            '-i',
            'input.mp4',
            '-map',
            '0:a',
            '-b:a',
            '20k',
            '-acodec',
            'libmp3lame',
            'output.mp3'
        ])

        const data = await ffmpeg.readFile('output.mp3')

        const audioFileBlob = new Blob([data], { type: 'audio/mp3' })
        const audioFile = new File([audioFileBlob], 'output.mp3', {
            type: 'audio/mpeg'
        })
        console.log('Convert finished.')

        return audioFile
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const prompt = promptInputRef.current?.value;

        if (!videoFile) {
            return;
        }
        setStatus('converting')

        const audioFile = await convertVideoToAudio(videoFile);

        const data = new FormData()

        data.append('file', audioFile)

        setStatus('uploading')
        const response = await api.post('/videos', data)

        console.log('response id video: ', response.data);

        const videoId = response.data.video.id;

        setStatus('generating')

        const responseTranscription = await api.post(`videos/${videoId}/transcription`, {
            prompt,
        })

        setStatus('success')
        console.log(responseTranscription);

    props.onVideoUploaded(videoId)
        console.log('finished');

    }

    const previewUrl = useMemo(() => {
        if (!videoFile) {
            return null;
        }
        return URL.createObjectURL(videoFile); //cria uma url de pré visualização
    }, [videoFile]);

    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            <label htmlFor="video"
                className='relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'>

                {previewUrl ? (
                    <video src={previewUrl} controls={false} className='pointer-events-none absolute inset-0' />
                ) : (
                    //fragment, é uma tag html que serve para encapsular um trecho sem comprometer a estilização <></>
                    <>
                        <FileVideo className='w-4 h-4' />
                        Selecione um video
                    </>
                )}
            </label>

            <input type="file" id='video' accept='video/mp4' className='sr-only' onChange={handleFileSelect} />

            <Separator />

            <div className='space-y-2'>
                <Label htmlFor='transcription_prompt'>Prompt de Transcrição</Label>
                <Textarea
                    disabled={status !== 'waiting'}
                    ref={promptInputRef}
                    id='transcription_prompt'
                    className='h-20 leading-relaxed'
                    placeholder='Inclua palavras-chave no video, separadas por virgula (,)' />
            </div>
            <Button 
            data-success={status === 'success'}
            disabled={status !== 'waiting'}
            type='submit'
            className='w-full data-[success=true]:bg-emerald-400'>
            {status === 'waiting'? (
            <>
                Carregar video
                <Upload className="w-4 h-4 ml-2" />
            </>
            ) : statusMessages[status]}

            </Button>
        </form>
    )
}
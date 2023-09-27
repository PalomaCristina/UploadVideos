import { Label } from "./label";
import { Separator } from "./separator";
import { FileVideo, Upload } from "lucide-react";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
//import { api } from "@/lib/axios";

export function InputFormVideo() {
    const [videoFile, setVideoFile] = useState<File | null>(null) //estado em react é toda a variavel que queremos monitorar a troca de valores dela
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
    
        if (!videoFile) {
            return;
        }
    
        try {
            console.log('Converting video to audio...');
            const audioFile = await convertVideoToAudio(videoFile);
            console.log('Conversion successful. audioFile:', audioFile);
        } catch (error) {
            console.error('Error converting video to audio:', error);
        }
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
                    ref={promptInputRef}
                    id='transcription_prompt'
                    className='h-20 leading-relaxed'
                    placeholder='Inclua palavras-chave no video, separadas por virgula (,)' />
            </div>
            <Button type='submit' className='w-full'>
                Carregar video
                <Upload className='w-4 h-4 ml-2' />
            </Button>
        </form>
    )
}
import { FFmpeg } from '@ffmpeg/ffmpeg'

import coreURL from '../ffmpeg/ffmpeg-core.js?url' //ele vai carregar este arquivo somente quando precisar, de uma forma assincrona
import wasmURL from '../ffmpeg/ffmpeg-core.wasm?url' //ele vai carregar este arquivo somente quando precisar, de uma forma assincrona
import workerURL from '../ffmpeg/ffmpeg-worker.js?url' //ele vai carregar este arquivo somente quando precisar, de uma forma assincrona


let ffmpeg: FFmpeg | null

export async function getFFmpeg(){

    if(ffmpeg ){
        return ffmpeg
    }

    ffmpeg = new FFmpeg()

    if(!ffmpeg.loaded) {
        await ffmpeg.load({
            coreURL,
            wasmURL,
            workerURL
        })
    }

    return ffmpeg
}
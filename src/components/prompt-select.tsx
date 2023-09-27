import { useEffect, useState } from "react"
import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from "./ui/select"
import api from '@/lib/axios'

interface Prompt {
    id: string
    title: string
    template: string
}

interface PromptSelectProps { 
    onPromptSelected: (template: string) => void
}
export function PromptSelect(props: PromptSelectProps) {
    const [prompts, setPrompts] = useState<Prompt[] | null>(null)

    useEffect(() => {
        api.get('/prompts').then(response => {
            setPrompts(response.data)
            console.log(response.data);

        })
    }, []) //useEffect nos permite disparar uma função quando um estado mudar

    function handlePromptSelected(promptId: string) {
        const selectedPrompt = prompts?.find(prompt => prompt.id === promptId)
        if(!selectedPrompt) {
            return
        }

        props.onPromptSelected(selectedPrompt.template)
    }

    return (
        <Select onValueChange={handlePromptSelected}>
            <SelectTrigger>
                <SelectValue placeholder="Selecione um prompt..." />
            </SelectTrigger>
            <SelectContent>
                {
                    prompts?.map(prompt => {
                        return (
                            <SelectItem key={prompt.id} value={prompt.id}>{prompt.title}</SelectItem>
                        )
                    })
                }
            </SelectContent>
        </Select>
    )
}
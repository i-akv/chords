import { MUSIC_BASE64 } from "../assets/sound-font"

export const textToAudioHtmls = (text) => {
    const notes = text.split(" ")
    return notes.map(n =>
        new Audio(MUSIC_BASE64[n])
    )
}
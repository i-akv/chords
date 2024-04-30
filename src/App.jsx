import "./App.css";

import { textToAudioHtmls } from "./utils/music";
import {
  Save,
  PlayCircle,
  Music,
  Fullscreen,
  Check,
  ListRestart,
  Music4,
  Music2,
  CheckCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import { OCTAVE3, OCTAVE4, OCTAVE5, OCTAVE6 } from "./assets/sound-font";
import { mergeAndDownloadAudioFiles } from "./utils/chord-to-wav";
// import OCTAVE3 from "./assets/sound-font"

var notes;
var timestamps = [];
var chordsText = [];
var prevTime;

export default function Home() {
  const [idx, setIdx] = useState(-1);
  const [chords2Play, setChords2Play] = useState([]);
  const [isNotesLoaded, setIsNotesLoaded] = useState(false);

  const [isRecorded, setIsRecorded] = useState(false);

  var textareaRef = useRef();

  const onLoadBtn = () => {
    const text = textareaRef.current.value;
    if (text === "") alert("No Chords To Load");

    notes = textToAudioHtmls(text);
    timestamps = [];
    chordsText = text;
    prevTime = null;

    setIsRecorded(false);
    setIdx(0);
    setIsNotesLoaded(true);
  };

  const onPlayBtn = () => {
    if (idx > chords2Play.length - 1) {
      return;
    }

    if (idx == 0) {
      prevTime = Date.now();
    }

    const currTime = Date.now();
    const timeDelta = currTime - prevTime;
    prevTime = currTime;

    timestamps.push(timeDelta);

    notes[idx].play();

    setIdx((prev) => prev + 1);
    if (idx == notes.length - 1) {
      setIdx(-1)
      setIsNotesLoaded(false);
      console.log("chordsText", chordsText);
      console.log("timestamps", timestamps);
      setIsRecorded(true);
      return;
    }
  };

  const onSaveBtn = () => {
    const songName = prompt("Song Name ?");

    const chordsData = JSON.stringify({
      name: songName,
      text: chordsText,
      timestamps: timestamps.map(t=>t/1000),
    });

    const blob = new Blob([chordsData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    console.log(url)
    link.href = url;
    link.download = songName + ".json";

    link.click();
    URL.revokeObjectURL(url);
    link.remove();
  };

  const addChordBtn = (e) => {
    const chord = e.target.getAttribute("data");
    setChords2Play([...chords2Play, chord]);
  };

  const removeChord = (e) => {
    const index = e.target.getAttribute("index");
    const rightArray = chords2Play.filter((val, i) => i > index);
    const leftArray = chords2Play.filter((val, i) => i < index);
    setChords2Play([...leftArray, ...rightArray]);
  };

  return (
    <main
      id="container"
      className="px-10 h-screen flex flex-col justify-center items-center gap-3"
    >
      <textarea
        ref={textareaRef}
        placeholder="C4 G#5 F7 etc...."
        cols="30"
        rows="10"
        hidden
        readOnly
        value={
          chords2Play.length > 0
            ? chords2Play.reduce((acc, c) => acc + " " + c)
            : ""
        }
        className="w-full p-5 outline-none border border-transparent focus:border focus:border-white"
      ></textarea>
      <div className="chordsToPlayContainer">
        {chords2Play.map((chord, i) => (
          <span key={i} index={i} onClick={removeChord} className={`chord2play ${idx==i&&"bg-green-700"}`}>
            {chord}
          </span>
        ))}
      </div>
      <div className="grid grid-rows-4 gap-1">
        <div className="chordsContainer">
          {OCTAVE3.map((i) => (
            <button
              onClick={addChordBtn}
              className="chordButton"
              key={i}
              data={i}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="chordsContainer">
          {OCTAVE4.map((i) => (
            <button
              onClick={addChordBtn}
              className="chordButton"
              key={i}
              data={i}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="chordsContainer">
          {OCTAVE5.map((i) => (
            <button
              onClick={addChordBtn}
              className="chordButton"
              key={i}
              data={i}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="chordsContainer">
          {OCTAVE6.map((i) => (
            <button
              onClick={addChordBtn}
              className="chordButton"
              key={i}
              data={i}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1 w-full justify-center items-center h-fit">
        <button
          className="bg-cyan-500 actionBtn"
          onClick={(e) =>
            document.getElementById("container").requestFullscreen()
          }
        >
          <Fullscreen />
        </button>
        <button
          id="load-btn"
          className="bg-green-600 actionBtn"
          onClick={onLoadBtn}
          disabled={!chords2Play.length}
        >
          {isNotesLoaded ? (
            idx == 0 ? (
              <CheckCircle />
            ) : (
              <ListRestart />
            )
          ) : (
            <Music2 />
          )}
        </button>
        <button
          disabled={!isNotesLoaded}
          id="play-btn"
          onClick={onPlayBtn}
          className="bg-blue-500 actionBtn"
        >
          <PlayCircle />
        </button>
        <button className="bg-green-500 actionBtn" disabled={!isRecorded} onClick={onSaveBtn}>
          <Save />
        </button>
      </div>
    </main>
  );
}

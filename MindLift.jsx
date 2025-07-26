
import React, { useState, useEffect, useRef } from "react";

export default function MindLift() {
  const [feeling, setFeeling] = useState("");
  const [response, setResponse] = useState("");
  const [energy, setEnergy] = useState(50);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setFeeling(transcript);
      };
    }
  }, []);

  const startVoiceInput = () => {
    recognitionRef.current?.start();
  };

  const detectEmotion = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("tired") || lower.includes("drained")) return "tired";
    if (lower.includes("unfocused") || lower.includes("distracted")) return "unfocused";
    if (lower.includes("sad") || lower.includes("down") || lower.includes("fail")) return "sad";
    if (lower.includes("energized") || lower.includes("sharp") || lower.includes("ready")) return "sharp";
    return "neutral";
  };

  const getBoost = async () => {
    setLoading(true);
    const userEmotion = detectEmotion(feeling);
    setEmotion(userEmotion);

    const prompts = {
      tired: "Give a quick mental energy boost, motivational quote, and focus tip.",
      unfocused: "Give a sharp refocus technique and learning boost.",
      sad: "Give a confidence boost, inspiration quote, and focus advice.",
      sharp: "Give an elite-level mental enhancer and challenge.",
      neutral: "Give a brain-boosting tip for creativity and confidence."
    };

    const userPrompt = prompts[userEmotion] || prompts["neutral"];

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userPrompt }]
        })
      });

      const data = await res.json();
      const boost = data.choices?.[0]?.message?.content || "Here's your boost!";
      setResponse(boost);
      setEnergy((prev) => Math.min(prev + 15, 100));
    } catch (err) {
      setResponse("⚠️ Error connecting to Neural Cloud. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', color: 'white', backgroundColor: '#1e293b', minHeight: '100vh' }}>
      <h1>MindLift</h1>
      <p>Speak or type your current mood to get a personalized neural boost.</p>

      <input value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="How are you feeling?" />
      <button onClick={getBoost} disabled={!feeling || loading}>{loading ? "Boosting..." : "Boost Me"}</button>
      <button onClick={startVoiceInput}>🎤 Speak</button>
      <button onClick={toggleMusic}>{isPlaying ? "Pause Music" : "Play Focus Music"}</button>

      {emotion && <p>Detected Emotion: {emotion}</p>}
      {response && <pre>{response}</pre>}

      <p>Energy: {energy}%</p>
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_d00c828a9f.mp3?filename=focus-1116.mp3" type="audio/mp3" />
      </audio>
    </main>
  );
}

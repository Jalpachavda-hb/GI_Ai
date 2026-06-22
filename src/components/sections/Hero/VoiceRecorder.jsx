import React, { useState, useRef, useEffect } from 'react';

export default function VoiceRecorder({ onAudioReady }) {
  const [status, setStatus] = useState('Ready to record');
  const [time, setTime] = useState('00:00');
  const [state, setState] = useState('idle'); // idle | recording | paused
  const [audioUrl, setAudioUrl] = useState('');

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const startAtRef = useRef(0);
  const pausedTotalRef = useRef(0);
  const pauseAtRef = useRef(0);

  // Canvas visualizer refs
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const stateRef = useRef('idle');

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
    if (state === 'idle') {
      setStatus('Ready to record');
    } else if (state === 'recording') {
      setStatus('Recording...');
    } else if (state === 'paused') {
      setStatus('Paused');
    }
  }, [state]);

  const fmtTime = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const now = () => performance.now();

  const elapsedMs = () => {
    if (!startAtRef.current) return 0;
    const currentPauseTime = stateRef.current === 'paused' ? pauseAtRef.current : now();
    const base = currentPauseTime - startAtRef.current;
    return base - pausedTotalRef.current;
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setTime(fmtTime(elapsedMs()));
    }, 200);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = async () => {
    try {
      setAudioUrl('');
      chunksRef.current = [];
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone not supported in this browser.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up Audio Context and Analyser Node for Visualizer
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256; // 128 bins
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);
      
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      
      mr.addEventListener('dataavailable', (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      });
      
      mr.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        chunksRef.current = [];
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (onAudioReady) {
          onAudioReady(blob, url);
        }
        
        // stop tracks so mic icon turns off
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        
        // Clean up audio nodes
        if (sourceRef.current) {
          sourceRef.current.disconnect();
          sourceRef.current = null;
        }
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
          audioCtxRef.current = null;
        }
        analyserRef.current = null;
        mediaRecorderRef.current = null;
        streamRef.current = null;
      });

      startAtRef.current = now();
      pausedTotalRef.current = 0;
      pauseAtRef.current = 0;
      setTime('00:00');
      
      mr.start();
      setState('recording');
      startTimer();
    } catch (e) {
      console.error("Microphone access failed:", e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setStatus('Mic permission denied. Please click the lock icon in your browser URL bar to allow it.');
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setStatus('No microphone found. Please connect a mic.');
      } else if (e.name === 'SecurityError') {
        setStatus('Security Error: Mic access requires localhost or HTTPS connection.');
      } else {
        setStatus(`Error: ${e.message || 'Could not access microphone'}`);
      }
      setState('idle');
      stopTimer();
    }
  };

  const handlePause = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;

    if (mr.state === 'recording') {
      pauseAtRef.current = now();
      mr.pause();
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
      setState('paused');
    } else if (mr.state === 'paused') {
      pausedTotalRef.current += now() - pauseAtRef.current;
      pauseAtRef.current = 0;
      mr.resume();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setState('recording');
    }
  };

  const handleStop = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;

    stopTimer();
    setState('idle');
    mr.stop();
  };

  // Canvas visualizer loop
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      animationFrameIdRef.current = requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameIdRef.current = requestAnimationFrame(draw);
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);
    const currentState = stateRef.current;

    if (analyserRef.current && currentState === 'recording') {
      analyserRef.current.getByteTimeDomainData(dataArray);
    }

    const barWidth = 3;
    const barGap = 3;
    const totalBarWidth = barWidth + barGap;
    const numBars = Math.floor(width / totalBarWidth);

    ctx.fillStyle = '#1e5cc8'; // nice vibrant blue matching the mockup

    for (let i = 0; i < numBars; i++) {
      const dataIndex = Math.floor((i / numBars) * bufferLength);
      let value = 0;

      if (currentState === 'recording' && analyserRef.current) {
        const amplitude = (dataArray[dataIndex] - 128) / 128;
        value = Math.abs(amplitude);
        const envelope = Math.sin((i / numBars) * Math.PI);
        value = Math.max(0.015, value * envelope * 2.2);
      } else if (currentState === 'paused') {
        const envelope = Math.sin((i / numBars) * Math.PI);
        value = (0.04 + 0.012 * Math.sin(i * 0.35)) * envelope;
      } else {
        // idle state moving dummy wave
        const envelope = Math.sin((i / numBars) * Math.PI);
        const timeFactor = Date.now() * 0.0035;
        value = (0.045 + 0.025 * Math.sin(timeFactor + i * 0.16)) * envelope;
      }

      const barHeight = Math.max(6, value * height * 0.9);
      const x = i * totalBarWidth;
      const y = (height - barHeight) / 2;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
      } else {
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();
    }

    animationFrameIdRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    draw();
    return () => {
      stopTimer();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <section className="recorder" aria-label="Voice recorder">
      <div className="recorder__body">
        <div className="recorder__status">{status}</div>
        <div className="recorder__time">{time}</div>

        <div className="recorder__wave-container">
          <canvas 
            ref={canvasRef} 
            width={900} 
            height={160} 
            className="recorder__wave-canvas"
          />
        </div>

        <div className="recorder__controls" role="group" aria-label="Recorder controls">
          <button
            className="recbtn recbtn--start"
            type="button"
            aria-label={state === 'paused' ? 'Resume recording' : 'Start recording'}
            onClick={state === 'paused' ? handlePause : handleStart}
            disabled={state === 'recording'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>

          <button
            className="recbtn recbtn--pause"
            type="button"
            aria-label={state === 'paused' ? 'Resume recording' : 'Pause recording'}
            onClick={handlePause}
            disabled={state === 'idle'}
          >
            {state === 'paused' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </button>

          <button
            className="recbtn recbtn--stop"
            type="button"
            aria-label="Stop recording"
            onClick={handleStop}
            disabled={state === 'idle'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>
        </div>

        {audioUrl && (
          <audio className="recorder__playback" src={audioUrl} controls></audio>
        )}
      </div>
    </section>
  );
}

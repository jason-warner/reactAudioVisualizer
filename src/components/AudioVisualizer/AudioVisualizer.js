// Credits to Nick Jones's original vanilla source: https://codepen.io/nfj525/pen/rVBaab
import { useEffect, useRef } from 'react';
import './AudioVisualizer.css';

const AudioVisualizer = () => {
  const
    canvasRef = useRef(null),
    buttonRef = useRef(null);
  // songRef = useRef(null);

  const audioVisualizerLogic = () => {
    // const
    //   song = songRef.current,
    // context = new window.AudioContext();

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const request = new XMLHttpRequest();
    const source = context.createBufferSource();
    fetch("http://jplayer.org/audio/mp3/RioMez-01-Sleep_together.mp3")
      .then(response => response.arrayBuffer())
      .then((response) => {
        context.decodeAudioData(response, (buffer) => {
          source.buffer = buffer;
          source.connect(context.destination);
          // auto play
          source.start(0); // start was previously noteOn
        });
      })
    // request.open("GET", "http://jplayer.org/audio/mp3/RioMez-01-Sleep_together.mp3", true);
    // request.responseType = "arraybuffer";

    // request.onload = () => {
    //   context.decodeAudioData(request.response, (buffer) => {
    //     source.buffer = buffer;
    //     source.connect(context.destination);
    //     // auto play
    //     source.start(0); // start was previously noteOn
    //   });
    // };

    request.send();

    const audio = new Audio(source);
    const
      canvas = canvasRef.current,
      muteButton = buttonRef.current;

    //mute or play on click
    const mutePlay = () => {
      context.state === 'running' ?
        context.suspend()
          .then(() => audio.pause())
        : context.resume()
          .then(() => audio.play());
    }
    muteButton.onclick = () => mutePlay();

    //config canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    //config audio analyzer
    const
      // src = context.createMediaElementSource(audio),
      analyser = context.createAnalyser();

    source.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 256;
    const
      bufferLength = analyser.frequencyBinCount,
      dataArray = new Uint8Array(bufferLength),
      WIDTH = canvas.width,
      HEIGHT = canvas.height,
      barWidth = (WIDTH / bufferLength) * 2.5;
    let
      barHeight = null,
      x = null;

    //core logic for the visualizer
    const timeouts = [];
    const renderFrame = () => {
      ctx.fillStyle = "rgba(0,0,0,0)";
      requestAnimationFrame(renderFrame);
      x = 0;
      analyser.getByteFrequencyData(dataArray);
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        let
          r = barHeight + (22 * (i / bufferLength)),
          g = 333 * (i / bufferLength),
          b = 47;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        x += barWidth + 1;

        let timer = setTimeout(() => {
          ctx.clearRect(0, 0, WIDTH, HEIGHT)
        }, 50);
        timeouts.push(timer);
      }
    }
    setTimeout(() => {
      for (let i = 0; i < timeouts.length; i++) {
        return clearTimeout(timeouts[i]);
      }
    }, 51);

    renderFrame();
    audio.play();
  };


  //connect audio visualizer logic to DOM and execute logic
  useEffect(() => {
    try {
      audioVisualizerLogic();
    } catch (err) {
      console.log('audioVisualizerLogic error: ', err)
    }
  });






  return (
    <div className="App">

      <header className="App-header">
        <h1>React Audio Visualizer</h1>
      </header>

      {/* <audio ref={songRef} src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3" crossOrigin="anonymous" ></audio> */}

      <main>
        <div>
          <main className="main">
            <button className="contextButton" ref={buttonRef}>
              <canvas ref={canvasRef} className="canvas"></canvas>
            </button>
          </main>
        </div>
      </main>
    </div>
  );
}

export default AudioVisualizer;




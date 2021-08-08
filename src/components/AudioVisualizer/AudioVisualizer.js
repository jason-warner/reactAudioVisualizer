// Credits to Nick Jones's original vanilla source: https://codepen.io/nfj525/pen/rVBaab
import { useEffect, useRef } from 'react';
import './AudioVisualizer.css';

const AudioVisualizer = () => {
  const
    canvasRef = useRef(null),
    buttonRef = useRef(null),
    songRef = useRef(null);

  const audioVisualizerLogic = () => {
    const
      song = songRef.current,
      context = new window.AudioContext();

    const audio = new Audio(song.src);

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
      src = context.createMediaElementSource(audio),
      analyser = context.createAnalyser();

    src.connect(analyser);
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

        setTimeout(() => {
          ctx.clearRect(0, 0, WIDTH, HEIGHT)
        }, 1);
      }
    }
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

      <audio preload="auto" className="audio">
        <source ref={songRef} src="/audioFile.mp3" type="audio/mpeg" />
      </audio>

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


//performance increase on setTimeouts

// var timeouts = [];
// timeouts.push(setTimeout(function(){alert(1);}, 200));
// timeouts.push(setTimeout(function(){alert(2);}, 300));
// timeouts.push(setTimeout(function(){alert(3);}, 400));

// for (var i=0; i<timeouts.length; i++) {
//   clearTimeout(timeouts[i]);
// }

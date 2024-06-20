import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import './App.css';

Modal.setAppElement('#root'); // Set the app element for accessibility

function App() {
  const [inputs, setInputs] = useState({
    moduleWidth: 160,
    moduleHeight: 180,
    modulesX: 4,
    modulesY: 2,
    cabinetsX: 3,
    cabinetsY: 3,
    strokeWidthCabinet: 1,
    moduleStrokeColor: '#c0c0c0', // Default color for module stroke
    showModules: true,
    fontSize: 50, // Added state for text font size
    fontColor: '#808080', // Added state for text font color
    backgroundColor: '#FFFFFF', // New state property for background color
    backgroundPattern: 'none', // New state property for background pattern choice
  });
  
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    calculateResolution();
  }, [inputs]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setInputs({ ...inputs, [e.target.id]: value });
  };

  const calculateResolution = () => {
    const { moduleWidth, moduleHeight, modulesX, modulesY, cabinetsX, cabinetsY } = inputs;
    const width = moduleWidth * modulesX * cabinetsX;
    const height = moduleHeight * modulesY * cabinetsY;
    setResolution({ width, height });
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const applyBackground = (ctx) => {
    const { backgroundPattern, moduleWidth, modulesX, cabinetsX, cabinetsY } = inputs;
    const width = moduleWidth * modulesX * cabinetsX;
    const height = moduleWidth * modulesX * cabinetsY; // Assuming square modules for simplicity

    switch (backgroundPattern) {
      case 'verticalModule':
        for (let i = 0; i < width; i++) {
          const grayscale = Math.floor((i % moduleWidth) / moduleWidth * 255);
          ctx.fillStyle = `rgb(${grayscale},${grayscale},${grayscale})`;
          ctx.fillRect(i, 0, 1, height);
        }
        break;
      case 'verticalCabinet':
        const cabinetWidth = moduleWidth * modulesX;
        for (let i = 0; i < width; i++) {
          const grayscale = Math.floor((i % cabinetWidth) / cabinetWidth * 255);
          ctx.fillStyle = `rgb(${grayscale},${grayscale},${grayscale})`;
          ctx.fillRect(i, 0, 1, height);
        }
        break;
      case 'radial':
        const radialGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        for (let i = 0; i <= 255; i++) {
          const grayscale = 255 - i;
          radialGradient.addColorStop(i / 255, `rgb(${grayscale},${grayscale},${grayscale})`);
        }
        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, width, height);
        break;
      default:
        ctx.fillStyle = inputs.backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }
  };

  const drawGrid = () => {
    const { moduleWidth, moduleHeight, modulesX, modulesY, cabinetsX, cabinetsY, strokeWidthCabinet, moduleStrokeColor, showModules, fontSize, fontColor } = inputs;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = moduleWidth * modulesX * cabinetsX;
    canvas.height = moduleHeight * modulesY * cabinetsY;

    applyBackground(ctx);

    for (let cx = 0; cx < cabinetsX; cx++) {
      for (let cy = 0; cy < cabinetsY; cy++) {
        const cabinetX = cx * moduleWidth * modulesX;
        const cabinetY = cy * moduleHeight * modulesY;

        if (showModules) {
          ctx.strokeStyle = moduleStrokeColor;
          ctx.lineWidth = 1;
          for (let mx = 0; mx < modulesX; mx++) {
            for (let my = 0; my < modulesY; my++) {
              const moduleX = cabinetX + mx * moduleWidth;
              const moduleY = cabinetY + my * moduleHeight;
              ctx.strokeRect(moduleX + 0.5, moduleY + 0.5, moduleWidth - 1, moduleHeight - 1);
            }
          }
        }

        ctx.strokeStyle = getRandomColor();
        ctx.lineWidth = strokeWidthCabinet;
        ctx.strokeRect(cabinetX + strokeWidthCabinet / 2, cabinetY + strokeWidthCabinet / 2, moduleWidth * modulesX - strokeWidthCabinet, moduleHeight * modulesY - strokeWidthCabinet);

        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = fontColor;
        const text = `C${(cy * cabinetsX + cx + 1).toString().padStart(3, '0')}`;
        ctx.fillText(text, cabinetX + (moduleWidth * modulesX) / 2, cabinetY + (moduleHeight * modulesY) / 2);
      }
    }
    
    const dataUrl = canvas.toDataURL();
    setImageSrc(dataUrl);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = 'grid.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullScreen = () => {
    const elem = modalContentRef.current;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="App">
      <h1>ExGrid - LED Wall Grid Generator</h1>
      <p>Current LED resolution is: {resolution.width} x {resolution.height}</p>
      <div className="form-container">
        <div className="form-group">
          <label>Module Width (px): <input type="number" id="moduleWidth" value={inputs.moduleWidth} onChange={handleChange} /></label>
          <label>Module Height (px): <input type="number" id="moduleHeight" value={inputs.moduleHeight} onChange={handleChange} /></label>
        </div>
        <div className="form-group">
          <label>Modules per Cabinet X: <input type="number" id="modulesX" value={inputs.modulesX} onChange={handleChange} /></label>
          <label>Modules per Cabinet Y: <input type="number" id="modulesY" value={inputs.modulesY} onChange={handleChange} /></label>
        </div>
        <div className="form-group">
          <label>Total Cabinets X: <input type="number" id="cabinetsX" value={inputs.cabinetsX} onChange={handleChange} /></label>
          <label>Total Cabinets Y: <input type="number" id="cabinetsY" value={inputs.cabinetsY} onChange={handleChange} /></label>
        </div>
        <div className="form-group">
          <label className="spacing">Cabinet Stroke Width (px): <input type="number" id="strokeWidthCabinet" value={inputs.strokeWidthCabinet} onChange={handleChange} /></label>
          <label className="spacing">Module Stroke Color: <input type="color" id="moduleStrokeColor" value={inputs.moduleStrokeColor} onChange={handleChange} /></label>
          <label className="spacing">Show Modules: <input type="checkbox" id="showModules" checked={inputs.showModules} onChange={handleChange} /></label>
          <label className="spacing">Font Size (px): <input type="number" id="fontSize" value={inputs.fontSize} onChange={handleChange} /></label>
          <label className="spacing">Font Color: <input type="color" id="fontColor" value={inputs.fontColor} onChange={handleChange} /></label>
          <label className="spacing">Background Color: <input type="color" id="backgroundColor" value={inputs.backgroundColor} onChange={handleChange} /></label>
          <label className="spacing">Background Pattern:
            <select id="backgroundPattern" value={inputs.backgroundPattern} onChange={handleChange}>
              <option value="none">None</option>
              <option value="verticalModule">Vertical Grayscale (Module Size)</option>
              <option value="verticalCabinet">Vertical Grayscale (Cabinet Size)</option>
              <option value="radial">Radial Grayscale (Screen Center)</option>
            </select>
          </label>
        </div>
        <button onClick={drawGrid}>Generate Grid</button>
      </div>
      <canvas ref={canvasRef} onClick={openModal} />
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="modal" overlayClassName="overlay">
        <div className="modal-content" ref={modalContentRef}>
          <img src={imageSrc} alt="Zoomed Grid" className="modal-image" />
        </div>
        <button onClick={toggleFullScreen} className="fullscreen-button">Toggle Fullscreen</button>
        <button onClick={downloadImage} className="download-button">Download</button>
        <button onClick={closeModal} className="close-button">Close</button>
      </Modal>
    </div>
  );
}

export default App;

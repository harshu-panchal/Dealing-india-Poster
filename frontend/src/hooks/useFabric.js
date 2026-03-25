import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';

export const useFabric = () => {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvas.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 625,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });
      setIsReady(true);
    }

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
        fabricCanvas.current = null;
      }
    };
  }, []);

  const addText = useCallback((text, options = {}) => {
    if (!fabricCanvas.current) return null;
    const textObj = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#000000',
      ...options
    });
    fabricCanvas.current.add(textObj);
    return textObj;
  }, []);

  const addImage = useCallback((url, options = {}) => {
    if (!fabricCanvas.current) return;
    fabric.Image.fromURL(url, (img) => {
      img.set({
        left: 100,
        top: 100,
        ...options
      });
      if (options.width) {
        img.scaleToWidth(options.width);
      }
      fabricCanvas.current.add(img);
      fabricCanvas.current.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, []);

  const setBackground = useCallback((url, width = 500, height = 625) => {
    if (!fabricCanvas.current) return;
    fabric.Image.fromURL(url, (img) => {
      fabricCanvas.current.setWidth(width);
      fabricCanvas.current.setHeight(height);
      fabricCanvas.current.setBackgroundImage(img, fabricCanvas.current.renderAll.bind(fabricCanvas.current), {
        scaleX: fabricCanvas.current.width / img.width,
        scaleY: fabricCanvas.current.height / img.height,
        crossOrigin: 'anonymous'
      });
    }, { crossOrigin: 'anonymous' });
  }, []);

  const download = (filename = 'poster.png') => {
    if (!fabricCanvas.current) return;
    
    // Deselect all objects before export to hide selection frames
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();

    const dataURL = fabricCanvas.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
  };

  const clear = useCallback(() => {
    if (fabricCanvas.current) {
      fabricCanvas.current.clear();
      fabricCanvas.current.setBackgroundImage(null, fabricCanvas.current.renderAll.bind(fabricCanvas.current));
    }
  }, []);

  return {
    canvasRef,
    fabricCanvas: fabricCanvas.current,
    isReady,
    addText,
    addImage,
    setBackground,
    download,
    clear
  };
};

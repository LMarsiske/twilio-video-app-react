import React, { useCallback, useState } from 'react';
import Konva from 'konva';
import { Color } from 'react-color';

export default function useOverlayImageState() {
  const [markers, setMarkers] = useState<{ id: string; active: boolean }[]>([
    { id: 'n', active: false },
    { id: 'v', active: false },
    { id: 'a', active: false },
    { id: 's', active: false },
  ]);
  const [overlayElements, setOverlayElements] = useState<{
    grid: Konva.Shape | null;
    lines: { tool: string; points: number[] }[] | null;
    activeMarkers: Konva.Text[] | null;
  }>({ grid: null, lines: null, activeMarkers: null });
  const [gridColor, setGridColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#181e85');
  const [markerColor, setMarkerColor] = useState('#000000');

  const [isSavingAllowed, setIsSavingAllowed] = useState(false);
  const [isResetAllowed, setIsResetAllowed] = useState(false);
  const [canUndoLastLine, setCanUndoLastLine] = useState(false);
  const [shouldClearVideoOverlay, setShouldClearVideoOverlay] = useState(false);
  const [shouldUndoLastLine, setShouldUndoLastLine] = useState(false);

  const toggleShouldClearOverlayState = (state: boolean) => {
    setShouldClearVideoOverlay(state);
    if (state === false) {
      setIsResetAllowed(false);
    }
  };

  const toggleShouldUndoLastLine = (state: boolean) => {
    setShouldUndoLastLine(state);
  };

  const updateOverlayElements = useCallback(
    (elements: { grid: Konva.Shape; lines: { tool: string; points: number[] }[]; activeMarkers: Konva.Text[] }) => {
      setOverlayElements(elements);
      setIsSavingAllowed(elements.lines.length > 0 ? true : false);
      setCanUndoLastLine(elements.lines.length > 0 ? true : false);
    },
    [overlayElements]
  );

  const saveImage = () => {
    const { grid, lines, activeMarkers } = overlayElements;
    console.log(grid?.attrs);

    let group = new Konva.Group({ x: 0, y: 0 });

    group.add(
      new Konva.Shape({
        x: 0,
        y: 0,
        width: 500,
        height: 500,
        fill: '#000000',
        stroke: '#000000',
        sceneFunc: function(ctx, shape) {
          let x = 0,
            y = 0;

          ctx.beginPath();
          for (x; x <= 500; x += 50) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 500);
          }
          for (y; y <= 500; y += 50) {
            ctx.moveTo(0, y);
            ctx.lineTo(500, y);
          }

          ctx.setAttr('font', `bold 16px Arial`);
          ctx.setAttr('textAlign', 'center');

          //   ctx.font = `bold 16px Arial`;
          //   ctx.textAlign = 'center';
          let i = 1;
          for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
              ctx.fillText(`${i}`, x * 50 + 25, y * 50 + 30);
              i++;
            }
          }

          ctx.closePath();
          ctx.fillStrokeShape(shape);
        },
      })
    );
    group.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: 500,
        height: 500,
        stroke: '#000000',
        strokeWidth: 10,
      })
    );

    let pos = grid?.absolutePosition();
    console.log(pos);
    console.log(grid);
    if (grid?.attrs.rotation && grid?.attrs.rotation !== 0) {
      let xy = translateAndRotatePoints(
        [grid.absolutePosition().x, grid.absolutePosition().y],
        {
          x: grid.absolutePosition().x,
          y: grid.absolutePosition().y,
          rotation: 0 - grid.attrs.rotation,
          scaleX: grid.attrs.scaleX || 1,
          scaleY: grid.attrs.scaleY || 1,
        },
        0 - grid.attrs.rotation,
        true
      );
      pos = { x: xy[0], y: xy[1] };
    }
    //console.log(pos);
    let offset = {
      x: pos?.x || 0,
      y: pos?.y || 0,
      rotation: grid?.attrs.rotation || 0,
      scaleX: grid?.attrs.scaleX || 1,
      scaleY: grid?.attrs.scaleY || 1,
    };
    console.log(offset);
    if (activeMarkers && activeMarkers.length > 0) {
      activeMarkers.forEach(marker => {
        console.log(marker.attrs);
        let newScale = {
          scaleX: Number.isNaN(marker.attrs.scaleX / grid?.attrs.scaleX) ? 1 : marker.attrs.scaleX / grid?.attrs.scaleX,
          scaleY: Number.isNaN(marker.attrs.scaleY / grid?.attrs.scaleY) ? 1 : marker.attrs.scaleY / grid?.attrs.scaleY,
        };

        let newRotation = Number.isNaN(0 - offset.rotation + marker.attrs.rotation)
          ? 0
          : 0 - offset.rotation + marker.attrs.rotation;
        console.log(newScale, newRotation);
        let coords = translateLandmarks(
          [marker.getAbsolutePosition().x, marker.getAbsolutePosition().y],
          offset,
          { ...newScale, newRotation, markerScaleX: marker.attrs.scaleX, markerScaleY: marker.attrs.scaleY },
          newRotation
        );
        console.log('COORDS: ', coords);
        group.add(
          new Konva.Text({
            text: marker.text(),
            x: coords[0],
            y: coords[1],
            fontSize: 30,
            height: 40,
            width: 40,
            stroke: 'black',
            fill: 'black',
            rotation: newRotation,
          })
        );
      });
    }
    if (lines && lines.length > 0) {
      lines.forEach(line => {
        let points = translateAndRotatePoints([...line.points], offset, 0 - offset.rotation);
        let scale = 1 / offset.scaleX;
        group.add(
          new Konva.Line({
            points: points,
            stroke: '#0e1ef6',
            strokeWidth: scale < 1 ? 1 : 3,
            tension: 0.5,
            lineCap: 'round',
            scaleX: 1 / offset.scaleX,
            scaleY: 1 / offset.scaleY,
          })
        );
      });
    }

    let url = group.toDataURL({ pixelRatio: 2 });
    return { url: url, group: group };

    // let hiddenElement = document.createElement('a');
    // hiddenElement.href = url;
    // hiddenElement.target = '_blank';
    // hiddenElement.download = 'stage.png';
    // hiddenElement.click();
    // setIsResetAllowed(true);
  };

  const translateAndRotatePoints = (
    points: number[],
    offset: { x: number; y: number; rotation: number; scaleX: number; scaleY: number },
    angle: number,
    ignoreOffset: boolean = false
  ) => {
    let cx = (500 * offset.scaleX) / 2;
    let cy = (500 * offset.scaleY) / 2;
    let radians = (Math.PI / 180) * angle;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    console.log(angle, offset);

    let chunked = [];
    for (let i = 0; i < points.length; i += 2) {
      chunked.push(points.slice(i, i + 2));
    }

    let translated = chunked.map(chunk => {
      let x = chunk[0];
      let y = chunk[1];

      let nx = cos * (x - cx) - sin * (y - cy) + cx;
      let ny = cos * (y - cy) + sin * (x - cx) + cy;

      if (ignoreOffset) {
        return [nx, ny];
      } else {
        return [nx - offset.x, ny - offset.y];
      }
    });
    console.log(chunked, translated);

    return translated.flat();
  };

  const translateLandmarks = (
    points: number[],
    offset: { x: number; y: number; rotation: number; scaleX: number; scaleY: number },
    relativeScale: { scaleX: number; scaleY: number; newRotation: number; markerScaleX: number; markerScaleY: number },
    angle: number
  ) => {
    console.log(relativeScale);
    let cx = (500 * offset.scaleX) / 2;
    let cy = (500 * offset.scaleY) / 2;
    let radians = (Math.PI / 180) * angle;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let markerCx = (40 * relativeScale.markerScaleX) / 2;
    let markerCy = (40 * relativeScale.markerScaleY) / 2;
    let markerRadians = (Math.PI / 180) * relativeScale.newRotation;
    let markerCos = Math.cos(markerRadians);
    let markerSin = Math.sin(markerRadians);
    //console.log('Translating landmark: ', angle, offset);

    let chunked = [];
    for (let i = 0; i < points.length; i += 2) {
      chunked.push(points.slice(i, i + 2));
    }

    let translated = chunked.map(chunk => {
      let x = chunk[0];
      let y = chunk[1];

      let nx = cos * (x - cx) - sin * (y - cy) + cx;
      let ny = cos * (y - cy) + sin * (x - cx) + cy;

      let offsetNx = (nx - offset.x) * relativeScale.scaleX;
      let offsetNy = (ny - offset.y) * relativeScale.scaleY;

      let finalNx = markerCos * (offsetNx - markerCx) - markerSin * (offsetNy - markerCy) + markerCx;
      let finalNy = markerCos * (offsetNy - markerCy) - markerSin * (offsetNx - markerCx) + markerCy;

      return [offsetNx, offsetNy];
    });

    console.log(chunked, translated);

    return translated.flat();

    //return [(points[0] - offset.x) * offset.scaleX, (points[1] - offset.y) * offset.scaleY];
  };

  return [
    overlayElements,
    updateOverlayElements,
    isSavingAllowed,
    saveImage,
    isResetAllowed,
    setIsResetAllowed,
    shouldClearVideoOverlay,
    toggleShouldClearOverlayState,
    markers,
    setMarkers,
    canUndoLastLine,
    shouldUndoLastLine,
    toggleShouldUndoLastLine,
    gridColor,
    setGridColor,
    strokeColor,
    setStrokeColor,
    markerColor,
    setMarkerColor,
  ] as const;
}

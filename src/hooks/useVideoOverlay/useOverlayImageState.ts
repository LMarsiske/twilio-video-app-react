import React, { useCallback, useState } from 'react';
import Konva from 'konva';

export default function useOverlayImageState() {
  const [overlayElements, setOverlayElements] = useState<{
    grid: Konva.Shape | null;
    lines: { tool: string; points: number[] }[] | null;
  }>({ grid: null, lines: null });

  const [isSavingAllowed, setIsSavingAllowed] = useState(false);
  const [isResetAllowed, setIsResetAllowed] = useState(false);

  const [shouldClearVideoOverlay, setShouldClearVideoOverlay] = useState(false);

  const toggleShouldClearOverlayState = (state: boolean) => {
    setShouldClearVideoOverlay(state);
    if (state === false) {
      setIsResetAllowed(false);
    }
  };

  const updateOverlayElements = useCallback(
    (elements: { grid: Konva.Shape; lines: { tool: string; points: number[] }[] }) => {
      //console.log('New Elements: ', elements);
      setOverlayElements(elements);
      setIsSavingAllowed(elements.lines.length > 0 ? true : false);
    },
    [overlayElements]
  );

  const saveImage = () => {
    const { grid, lines } = overlayElements;
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
    let hiddenElement = document.createElement('a');
    hiddenElement.href = url;
    hiddenElement.target = '_blank';
    hiddenElement.download = 'stage.png';
    hiddenElement.click();
    setIsResetAllowed(true);
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
    console.log(angle);

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
        return [nx - offset.x || 0, ny - offset.y];
      }
    });
    console.log(chunked, translated);

    return translated.flat();
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
  ] as const;
}

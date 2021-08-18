import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Group, Shape, Transformer, Rect } from 'react-konva';
import { SketchPicker } from 'react-color';
import useDynamicRefs from 'use-dynamic-refs';
import { makeStyles, withStyles, Paper, Button, Slider, FormControl, FormLabel } from '@material-ui/core';
import Konva from 'konva';

import useOverlayContext from '../../hooks/useOverlayContext/useOverlayContext';

const useStyles = makeStyles(theme => ({
  fieldset: {
    margin: theme.spacing(0.5),
    padding: theme.spacing(0.5),
  },
  slider: {
    width: '100%',
  },
}));

const ColorButton = withStyles(theme => ({
  root: {
    width: '100%',
    margin: '2% 0',
    color: '#680000',
    borderColor: '#680000',
    '&:hover': {
      color: 'white',
      backgroundColor: '#680000',
    },
  },
}))(Button);

const ContainedButton = withStyles(theme => ({
  root: {
    width: '100%',
    margin: '2% 0',
    color: '#fff',
    borderColor: '#680000',
    backgroundColor: '#680000',
  },
  disabled: {
    color: theme.palette.action.disabled,
    backgroundColor: theme.palette.action.disabledBackground,
  },
}))(Button);

const VideoOverlay = props => {
  const classes = useStyles();
  const { updateOverlayElements } = useOverlayContext();
  const { isOverlayDrawable } = useOverlayContext();
  const [tool, setTool] = React.useState('pen');
  const [lines, setLines] = React.useState([]);
  const [draggable, setDraggable] = useState(true);
  const [drawable, setDrawable] = useState(false);
  const [gridWidth, setGridWidth] = useState(3);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [gridColor, setGridColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('green');
  const [showGridColorPicker, setShowGridColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const [selected, setSelected] = useState(false);
  const isDrawing = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const gridRef = useRef(null);
  const squareRef = useRef(null);
  const groupRef = useRef(null);
  const lineRefs = useRef([]);
  const layerRef = useRef(null);
  const stageRef = useRef(null);
  const trRef = React.useRef();

  const [getRef, setRef] = useDynamicRefs();

  useEffect(() => {
    if (!isOverlayDrawable) {
      let currents = lineRefs.current.map(el => el.current);
      const nodes = [gridRef.current, squareRef.current, ...currents];
      console.log(nodes);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [isOverlayDrawable]);

  useEffect(() => {
    updateOverlayElements({ grid: gridRef.current, lines: lines });
  }, [lines]);

  const undoLine = () => {
    let [...copy] = lines;
    copy.pop();
    setLines(copy);
  };

  const checkDeselect = e => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelected(null);
    }
  };

  const handleMouseDown = e => {
    const pos = e.target.getStage().getPointerPosition();

    const bound = {
      ...groupRef.current.getAttrs(),
      x: groupRef.current.absolutePosition().x,
      y: groupRef.current.absolutePosition().y,
    };
    //console.log(bound);
    if (isOverlayDrawable) {
      isDrawing.current = true;
      setLines([...lines, { tool, points: [pos.x, pos.y] }]);
    }
    //}
  };

  const handleMouseMove = e => {
    // no drawing - skipping
    if (!isDrawing.current || !isOverlayDrawable) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x - offset.current.x, point.y - offset.current.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const translateAndRotatePoints = (points, offset, angle) => {
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

      if (offset.x || offset.y) {
        return [nx - offset.x, ny - offset.y];
      } else {
        return [nx, ny];
      }
    });

    return translated.flat();
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        height: '100%',
        width: '100%',
        zIndex: 500,
      }}
      id="container"
    >
      <Stage
        ref={stageRef}
        width={props.size.x}
        height={props.size.y}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer ref={layerRef}>
          <Group draggable={!isOverlayDrawable} ref={groupRef} width={500} height={500} x={10} y={10} onDragEnd={null}>
            <Shape
              width={500}
              height={500}
              ref={gridRef}
              fill={gridColor}
              stroke={gridColor}
              strokeWidth={2}
              sceneFunc={(ctx, shape) => {
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

                ctx.font = `bold 16px Arial`;
                ctx.fillStyle = gridColor;
                ctx.textAlign = 'center';
                let i = 1;
                for (let y = 0; y < 10; y++) {
                  for (let x = 0; x < 10; x++) {
                    ctx.fillText(`${i}`, x * 50 + 25, y * 50 + 30);
                    i++;
                  }
                }

                ctx.closePath();
                ctx.fillStrokeShape(shape);
              }}
              onTransform={e => {
                let attrs = {
                  ...gridRef.current.attrs,
                  x: gridRef.current.absolutePosition().x,
                  y: gridRef.current.absolutePosition().y,
                };
                console.table(attrs.rotation, attrs.x, attrs.y);
              }}
            />
            <Rect ref={squareRef} width={500} height={500} strokeWidth={10} stroke={gridColor} />
          </Group>
          {lines.map((line, i) => {
            let ref = setRef(line);
            if (i === 0) {
              lineRefs.current = [ref];
            } else {
              lineRefs.current = [...lineRefs.current, ref];
            }
            return (
              <Line
                draggable={!isOverlayDrawable}
                ref={ref}
                key={i}
                points={line.points}
                stroke={strokeColor}
                strokeWidth={3}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            );
          })}
          {!isOverlayDrawable && (
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                // limit resize
                if (newBox.width < 50 || newBox.height < 50) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
      {/* <Paper
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "0 1%",
          width: `calc((100vw - ${props.size.x}px) / 2)`,
        }}
      >
        <div
          style={{
            width: "90%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <ColorButton variant="outlined" onClick={switchMode}>
              {draggable ? "Start Drawing" : "Adjust Grid"}
            </ColorButton>
            <CustomPicker
              text="Change grid line color"
              handleClick={() => {
                setShowStrokeColorPicker(false);
                setShowGridColorPicker(!showGridColorPicker);
              }}
              handleClose={() => setShowGridColorPicker(false)}
              color={gridColor}
              onChangeComplete={setGridColor}
              shouldShowPicker={showGridColorPicker}
            />
            <CustomPicker
              text="Change marker color"
              handleClick={() => {
                setShowGridColorPicker(false);
                setShowStrokeColorPicker(!showStrokeColorPicker);
              }}
              handleClose={() => setShowStrokeColorPicker(false)}
              color={gridColor}
              onChangeComplete={setStrokeColor}
              shouldShowPicker={showStrokeColorPicker}
            />
            <ContainedButton
              variant="contained"
              onClick={undoLine}
              disabled={draggable || lines.length <= 0}
            >
              Undo
            </ContainedButton>
          </div>

          {props.controls}
          <ContainedButton
            variant="contained"
            onClick={saveImage}
            style={{ fontWeight: "bold" }}
            disabled={lines.length <= 0}
          >
            Save Image
          </ContainedButton>
        </div>
      </Paper> */}
    </div>
  );
};

const CustomPicker = props => {
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        props.handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
  return (
    <div style={{ width: '100%' }}>
      <ColorButton variant="outlined" onClick={props.handleClick}>
        {props.text}
      </ColorButton>
      {props.shouldShowPicker ? (
        <div ref={ref} style={{ position: 'absolute', zIndex: '2' }}>
          {/* <div
            style={{
              position: "fixed",
              top: "0px",
              right: "0px",
              bottom: "0px",
              left: "0px",
            }}
            onClick={props.handleClose}
          /> */}
          <SketchPicker
            color={props.color}
            onChangeComplete={color => {
              console.log(color.hex);
              props.onChangeComplete(color.hex);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default VideoOverlay;

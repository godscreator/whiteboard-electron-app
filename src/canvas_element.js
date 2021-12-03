import React, { useRef, useEffect } from "react";
import { Line, Rect, Transformer, Group, Image, Ellipse } from 'react-konva';
import useImage from 'use-image';
import { TextBox } from './editable_canvas_element.js';

const Transformable = ({ children, shapeProps, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Group
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                draggable
                onDragStart={(e) => {
                    onSelect();
                }}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransform={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                        rotation: node.rotation(),
                    });
                }}
                onTransformEnd={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                        rotation: node.rotation(),
                    });
                }}
            >
                {children}
            </Group>
            {
                isSelected && (
                    <Transformer
                        ref={trRef}

                        boundBoxFunc={(oldBox, newBox) => {
                            // limit resize
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )
            }
        </React.Fragment >
    );
};
const URLImage = ({ x, y, width, height, src, set_shape, id }) => {
    const [img, status] = useImage(src);
    useEffect(() => {
        if (width < 0 && height < 0 && status === "loaded") {
            set_shape(img.width, img.height);
        }
        // eslint-disable-next-line
    }, [status])
    return (
        <Image
            id={id}
            image={img}
            x={x}
            y={y}
            width={width}
            height={height}
        />
    );
};

export const to_canvas_elements = (elem_desc, key, selectedId, selectShape, setShape, setCursor, urls) => {
    var elem = null;
    if (elem_desc !== null)
        switch (elem_desc.name) {
            case "brush":
                elem = <Line
                    key={key}
                    points={elem_desc.points}
                    stroke={elem_desc.color}
                    strokeWidth={Number(elem_desc.radius)}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation={'source-over'}
                />
                break;
            case "eraser":

                elem = <Line
                    key={key}
                    points={elem_desc.points}
                    stroke="white"
                    strokeWidth={Number(elem_desc.radius)}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation={'destination-out'}
                />
                break;
            case "shapes":
                if (elem_desc.points.length === 4)
                    switch (elem_desc.type) {
                        case "line":
                            elem =
                                <Line
                                    key={key}
                                    id={elem_desc.id.toString()}
                                    points={[0, 0, elem_desc.shapeProps.width, elem_desc.shapeProps.height]}
                                    stroke={elem_desc.color}
                                    strokeWidth={Number(elem_desc.radius)}
                                    tension={0.5}
                                    lineCap="round"
                                    globalCompositeOperation={'source-over'}
                                />

                            break;
                        case "rect":
                            elem =
                                <Rect
                                    key={key}
                                    id={elem_desc.id.toString()}
                                    x={0}
                                    y={0}
                                    width={elem_desc.shapeProps.width}
                                    height={elem_desc.shapeProps.height}
                                    stroke={elem_desc.color}
                                    strokeWidth={Number(elem_desc.radius)}
                                />

                            break;
                        case "fill rect":
                            elem =
                                <Rect
                                    key={key}
                                    id={elem_desc.id.toString()}
                                    x={0}
                                    y={0}
                                    width={elem_desc.shapeProps.width}
                                    height={elem_desc.shapeProps.height}
                                    fill={elem_desc.color}
                                />

                            break;
                        case "circle":
                            elem =
                                <Ellipse
                                    key={key}
                                    id={elem_desc.id.toString()}
                                    x={elem_desc.shapeProps.width / 2}
                                    y={elem_desc.shapeProps.height / 2}
                                    radiusX={Math.abs(elem_desc.shapeProps.width / 2)}
                                    radiusY={Math.abs(elem_desc.shapeProps.height / 2)}
                                    stroke={elem_desc.color}
                                    strokeWidth={Number(elem_desc.radius)}
                                />

                            break;
                        case "fill circle":
                            elem =
                                <Ellipse
                                    key={key}
                                    id={elem_desc.id.toString()}
                                    x={elem_desc.shapeProps.width / 2}
                                    y={elem_desc.shapeProps.height / 2}
                                    radiusX={Math.abs(elem_desc.shapeProps.width / 2)}
                                    radiusY={Math.abs(elem_desc.shapeProps.height / 2)}
                                    fill={elem_desc.color}
                                />
                            break;
                        default:
                    }
                elem = <Transformable
                    key={key + ": Transformable"}
                    shapeProps={elem_desc.shapeProps}
                    isSelected={elem_desc.id === selectedId}
                    onSelect={() => {
                        selectShape(key);
                    }}
                    onChange={(newAttrs) => {
                        setShape({ ...elem_desc, shapeProps: newAttrs }, key)
                    }}
                >{elem}</Transformable>;
                break;
            case "text":
                elem = <TextBox
                    key={key}
                    shapeProps={elem_desc.shapeProps}
                    isSelected={elem_desc.id === selectedId}
                    id={elem_desc.id.toString()}
                    onSelect={() => {
                        selectShape(key);
                    }}
                    onShapeChange={(newAttrs) => {
                        setShape({ ...elem_desc, shapeProps: newAttrs }, key)
                    }}
                    text={elem_desc.text}
                    onTextChange={(text) => {
                        setShape({ ...elem_desc, text: text }, key);
                    }}
                />;
                break;
            case "image":
                elem = <Transformable
                    key={key + ": Transformable"}
                    shapeProps={elem_desc.shapeProps > 0 ? { ...elem_desc.shapeProps, width: 100, height: 100 } : elem_desc.shapeProps}
                    isSelected={elem_desc.id === selectedId}

                    onSelect={() => {
                        selectShape(key);
                    }}
                    onChange={(newAttrs) => {
                        setShape({ ...elem_desc, shapeProps: newAttrs }, key)
                    }}
                >
                    <URLImage x={0} y={0}
                        id={elem_desc.id.toString()}
                        width={elem_desc.shapeProps.width}
                        height={elem_desc.shapeProps.height}
                        src={urls[elem_desc.fname]}
                        set_shape={(w, h) => setShape({ ...elem_desc, shapeProps: { ...elem_desc.shapeProps, width: w, height: h } }, key)} />
                </Transformable>;
                break;
            default:
        }
    return elem;
}
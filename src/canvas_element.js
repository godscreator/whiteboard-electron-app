import React, { useRef, useEffect, useState } from "react";
import { Line, Rect, Transformer, Group, Image, Ellipse } from 'react-konva';
import { Html } from "react-konva-utils";
import useImage from 'use-image';
import { toCanvas } from 'html-to-image';

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
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
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
const URLImage = ({ x, y, width, height, src }) => {
    const [img] = useImage(src);
    return (
        <Image
            image={img}
            x={x}
            y={y}
            width={width}
            height={height}
        />
    );
};

const MovableText = ({ value, width, height, onChange, isEditing, onEnterDragbox, onLeaveDragbox }) => {
    const htmlref = useRef(null);
    const [img, setImg] = useState(null);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const padding = 2;
    const remake = () => {
        return new Promise(async (resolve, reject) => {
            if (htmlref.current !== null) {
                const html = htmlref.current;
                var canvas = await toCanvas(html, { pixelRatio: 2 });
                setImg(canvas);
            }
            resolve();
        });
        
    }
    useEffect(() => {
        if(isEditing)
            remake();
    }, [value, width, height, isEditing]);
    useEffect(() => {
        const refresh = async () => {
            await remake();
            setIsFirstRender(false);
        }
        refresh();
    }, []);
    return (
        <React.Fragment>
            <Html divProps={{ style: { display: isEditing || isFirstRender ? "block" : "none", position: "absolute", left: padding+"px", top: padding+"px", width: width-padding + "px", height: height-padding + "px" } }}>
                <div ref={htmlref} style={{
                    width: "100%",
                    height: "100%",
                    resize: "none",
                    outline: "none",
                }}>
                <textarea
                    ref={htmlref}
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                    }}
                    placeholder="Type here"
                    style={{
                        width: "100%",
                        height: "100%",
                        resize: "none",
                        outline: "none",
                    }}
                />
                </div>
            </Html>
            <Rect x={0} y={0} width={width} height={height} fill="silver"/>
            <Image image={img} x={padding/2} y={padding/2} width={width-padding/2} height={height-padding/2} />
        </React.Fragment>
    );
}

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
                        selectShape(elem_desc.id);
                    }}
                    onChange={(newAttrs) => {
                        setShape({ ...elem_desc, shapeProps: newAttrs })
                    }}
                >{elem}</Transformable>;
                break;
            case "text":
                elem = <Transformable
                    key={key + ": Transformable"}
                    shapeProps={elem_desc.shapeProps}
                    isSelected={elem_desc.id === selectedId}
                    onSelect={() => {
                        selectShape(elem_desc.id);
                    }}
                    onChange={(newAttrs) => {
                        setShape({ ...elem_desc, shapeProps: newAttrs })
                    }}
                >
                    <MovableText
                        value={elem_desc.text}
                        onChange={(e) => {
                            setShape({ ...elem_desc, text: e.target.value })
                        }}
                        width={elem_desc.shapeProps.width}
                        height={elem_desc.shapeProps.height}
                        isEditing={elem_desc.id === selectedId}
                        onEnterDragbox={() => setCursor("move")}
                        onLeaveDragbox={() => setCursor("default")}
                    />

                </Transformable>;
                break;
            case "image":
                elem = <Transformable
                    key={key + ": Transformable"}
                    shapeProps={elem_desc.shapeProps}
                    isSelected={elem_desc.id === selectedId}
                    onSelect={() => {
                        selectShape(elem_desc.id);
                    }}
                    onChange={(newAttrs) => {
                        setShape({ ...elem_desc, shapeProps: newAttrs })
                    }}
                >
                    <URLImage x={0} y={0} width={elem_desc.shapeProps.width} height={elem_desc.shapeProps.height} src={urls[elem_desc.fname]} />
                </Transformable>;
                break;
            default:
        }
    return elem;
}
import React, { useRef, useEffect, useState } from "react";
import { Rect, Transformer, Group, Image, Circle } from 'react-konva';
import { Html } from "react-konva-utils";
import { toCanvas } from 'html-to-image';

const TransformableHtml = ({ children, shapeProps, isSelected, onSelect, onChange, id }) => {
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
                draggable={isSelected}
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
                <Rect id={id} x={0} y={-12} width={shapeProps.width} height={shapeProps.height+ 12} cornerRadius={6} fill={"silver"} />
                <Circle x={shapeProps.width - 8} y={-6} radius={4} fill={"red"} />
                <ResizableHtml width={shapeProps.width} height={shapeProps.height}>
                    {children}
                </ResizableHtml>
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

const ResizableHtml = ({ children, width, height ,isSelected}) => {
    const htmlref = useRef(null);
    const [img, setImg] = useState(null);
    const padding = 0;
    const remake = () => {
        if (htmlref.current !== null) {
            const html = htmlref.current;
            toCanvas(html, { pixelRatio: 2 }).then((canvas) => setImg(canvas));
        }
    }
    useEffect(() => {
        remake();
    }, [width, height]);
    useEffect(() => {
        remake();
    }, []);
    return (
        <React.Fragment>
            <Html divProps={{ style: { position: "absolute", left: padding + "px", top: padding + "px", width: width - 2 * padding + "px", height: height - 2 * padding + "px" } }}>
                <div ref={htmlref} style={{
                    width: "100%",
                    height: "100%",
                }}>
                    {children}
                </div>
            </Html>
            <Rect x={0} y={0} width={width} height={height} fill="silver" />
            <Image image={img} x={padding} y={padding} width={width - 2 * padding} height={height - 2 * padding} />
        </React.Fragment>
    );
}

export const TextBox = ({ text, shapeProps, id, isSelected, onSelect, onShapeChange, onTextChange }) => {
    return (
        <TransformableHtml
            shapeProps={shapeProps}
            isSelected={isSelected}
            onSelect={() => { onSelect() }}
            id={id}
            onChange={(newAttrs) => { onShapeChange(newAttrs) }}
        >
            <textarea
                value={text}
                onChange={(e) => { onTextChange(e.target.value) }}
                placeholder="Type here"
                style={{
                    width: "100%",
                    height: "100%",
                    resize: "none",
                    outline: "none",
                }}
            />
        </TransformableHtml>
    );
}

import React, { useRef, useEffect } from "react";
import { Line, Rect, Transformer, Group, Ellipse } from 'react-konva';


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
            {isSelected && (
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
            )}
        </React.Fragment>
    );
};

export const to_canvas_elements = (elem_desc, key, selectedId, selectShape, setShape) => {
    var elem = null;
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
                globalCompositeOperation={'source-over'}
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
                                radiusX={elem_desc.shapeProps.width / 2}
                                radiusY={elem_desc.shapeProps.height / 2}
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
                                radiusX={elem_desc.shapeProps.width / 2}
                                radiusY={elem_desc.shapeProps.height / 2}
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
            >{elem}</Transformable>
            break;
        default:
    }
    return elem;
}
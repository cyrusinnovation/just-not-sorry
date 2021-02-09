import { h } from 'preact';
import WarningHighlight from './WarningHighlight.js';

const YPOS_ADJUSTMENT = 3;

const calculatePosition = (coords) => {
  if (coords) return coords.top <= 200 ? 'bottom' : 'top';
  else return undefined;
};

export const calculateCoords = (parentRect, rect) =>
  parentRect && rect
    ? {
        top: rect.top - parentRect.top + rect.height,
        left: rect.left - parentRect.left,
      }
    : undefined;

export const getHighlight = (rect, coord) =>
  rect && coord
    ? {
        style: {
          top: `${coord.top - YPOS_ADJUSTMENT}px`,
          left: `${coord.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height * 0.2}px`,
          zIndex: 10,
          position: 'absolute',
          padding: '0px',
        },
        position: calculatePosition(coord),
      }
    : undefined;

export const getHighlights = (parentNode, rangeToHighlight) => {
  if (parentNode && rangeToHighlight) {
    const parentRect = parentNode.getBoundingClientRect();
    return Array.from(rangeToHighlight.getClientRects(), (rect) =>
      getHighlight(rect, calculateCoords(parentRect, rect))
    );
  }
  return undefined;
};

export default function Warning(props) {
  const { parentNode, rangeToHighlight } = props.value;
  const highlights = getHighlights(parentNode, rangeToHighlight);

  return (
    <div className="jns-warning">
      {highlights.map((highlight, index) => (
        <WarningHighlight
          key={index}
          styles={highlight.style}
          message={props.value.message}
          position={highlight.position}
        />
      ))}
    </div>
  );
}

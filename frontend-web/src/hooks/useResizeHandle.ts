import { useCallback, useRef } from 'react';

type Side = 'right' | 'left';

export function useResizeHandle(
  side: Side,
  onResize: (width: number) => void,
  min: number,
  max: number,
) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent, currentWidth: number) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = currentWidth;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.getElementById('app')?.classList.add('resizing');

      const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX.current;
        const newWidth =
          side === 'right'
            ? startWidth.current + delta
            : startWidth.current - delta;
        onResize(Math.round(Math.min(max, Math.max(min, newWidth))));
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.getElementById('app')?.classList.remove('resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [side, onResize, min, max],
  );

  return onMouseDown;
}

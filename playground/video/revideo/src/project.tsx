import {Circle, makeScene2D, Rect, Txt} from '@revideo/2d';
import {all, chain, createRef, makeProject, waitFor} from '@revideo/core';

// Self-contained scene: no remote assets, so it renders offline.
const scene = makeScene2D('scene', function* (view) {
  view.fill('#0d0d12');
  const box = createRef<Rect>();
  const dot = createRef<Circle>();
  const title = createRef<Txt>();

  view.add(
    <>
      <Rect ref={box} width={160} height={160} radius={24} fill={'#3366ff'} />
      <Circle ref={dot} size={60} fill={'#ffcc33'} x={-400} />
      <Txt ref={title} text={'Revideo'} fill={'white'} fontSize={96} y={260} opacity={0} />
    </>,
  );

  yield* all(box().rotation(180, 1.2), box().scale(1.6, 1.2), dot().x(400, 1.2), title().opacity(1, 1.2));
  yield* chain(box().radius(80, 0.6), dot().x(-400, 0.8));
  yield* waitFor(0.3);
});

export default makeProject({
  scenes: [scene],
  settings: {shared: {size: {x: 1280, y: 720}}},
});

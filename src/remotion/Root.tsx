import { Composition } from "remotion";
import { FeedApresentacao } from "./compositions/FeedApresentacao";
import { StoriesApresentacao } from "./compositions/StoriesApresentacao";
import { produtos } from "./data/produtos";

const SLIDE_DURATION = 75;
const TRANSITION = 15;
const INTRO_DURATION = 45;
const OUTRO_DURATION = 45;
const FPS = 30;

const totalFrames =
  INTRO_DURATION + produtos.length * (SLIDE_DURATION + TRANSITION) + OUTRO_DURATION;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StoriesApresentacao"
        component={StoriesApresentacao}
        durationInFrames={totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="FeedApresentacao"
        component={FeedApresentacao}
        durationInFrames={totalFrames}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};

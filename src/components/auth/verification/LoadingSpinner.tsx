import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const LoadingSpinner = () => (
  <div className="w-32 h-32 flex items-center justify-center bg-mint/5 rounded-full p-4">
    <DotLottieReact
      src="https://lottie.host/0b32aab0-e1df-4dab-ba4e-f9e8e0195f3d/9CvT9ksxiW.lottie"
      loop
      autoplay
    />
  </div>
);
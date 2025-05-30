import { onMounted, onBeforeMount, ref, Ref, isRef } from 'vue';

const useFullscreen = (target: HTMLElement | Ref<HTMLElement>) => {
  const isFullScreen = ref(false);

  const watchFullscreenchange = () => {
    if (document.fullscreenEnabled || (document as any).msFullscreenEnabled) {
      isFullScreen.value = (window as any).fullScreen || (document as any).webkitIsFullScreen;
    }
  };

  onMounted(() => {
    window.addEventListener('fullscreenchange', watchFullscreenchange);
  });

  onBeforeMount(() => {
    window.removeEventListener('fullscreenchange', watchFullscreenchange);
  });

  const trigger = () => {
    if (isRef(target)) {
      target.value.requestFullscreen();
    } else {
      target.requestFullscreen();
    }
  };

  return {
    isFullScreen,
    trigger
  };
};

export { useFullscreen };

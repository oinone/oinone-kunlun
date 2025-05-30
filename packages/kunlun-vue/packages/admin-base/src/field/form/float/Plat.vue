<template>
  <div
    class="plat_map_container"
    ref="mapContainerRef"
    :class="[disabled && 'location_map_container-disabled']"
    :style="styles"
  ></div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, onBeforeUnmount, computed, onMounted, watch, nextTick } from 'vue';
import { ViewType } from '@kunlun/meta';
import { BaseFormItemProps, OioCommonProps, OioMetadataProps } from '../../../basic';

const loadBaiDuMap = (cb) => {
  const BAIDU_MAP_URL =
    'https://api.map.baidu.com/getscript?type=webgl&v=1.0&ak=KDyzdjTkG8f3gpA7vGexcWP1aRg1BsNz&services=&t=20230209120615';

  if (!(window as any).BMapGL) {
    const script = document.createElement('script');
    script.setAttribute('src', BAIDU_MAP_URL);

    const link = document.createElement('link');
    link.setAttribute('href', 'https://api.map.baidu.com/res/webgl/10/bmap.css');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');

    document.body.appendChild(script);
    document.body.appendChild(link);

    script.onload = () => {
      cb();
    };
  } else {
    cb();
  }
};

export default defineComponent({
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    ...BaseFormItemProps,
    startDefaultValue: {
      type: Number,
      default: null
    },
    endDefaultValue: {
      type: Number,
      default: null
    },
    value: {
      type: Array,
      default: () => [] as PropType<[number, number]>
    },
    disabled: {
      type: Boolean,
      default: false
    },
    viewType: {
      type: String,
      default: ''
    },
    colStyle: {
      type: Object,
      default: () => ({})
    },
    startFieldDecimal: {
      type: Number,
      required: true
    },
    endFieldDecimal: {
      type: Number,
      required: true
    },
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const defaultCoords = {
      longitude: 116.404,
      latitude: 39.915
    };

    let map;
    let point;
    let marker;
    let BMapGL;

    const mapContainerRef = ref<HTMLElement>(null as any);
    const coords = ref({
      longitude: -1,
      latitude: -1
    });

    const styles = computed(() => {
      return {
        height: '420px',
        ...(props.colStyle || {})
      };
    });

    const setCoordValue = () => {
      const [lng, lat] = props.value as [number, number];

      coords.value.longitude = lng || props.startDefaultValue || defaultCoords.longitude;
      coords.value.latitude = lat || props.endDefaultValue || defaultCoords.latitude;
    };

    setCoordValue();

    const watchFormDataId = () => {
      const stop = watch(
        () => props.formData.id,
        async (id) => {
          if (!id) {
            return;
          }

          let t = setTimeout(() => {
            setCoordValue();

            map.removeOverlay(marker);

            point = new BMapGL.Point(coords.value.longitude, coords.value.latitude);
            marker = new BMapGL.Marker(point);
            map.addOverlay(marker);
            map.centerAndZoom(point, 15);

            stop();
            clearTimeout(t);
            t = null as any;
          }, 500);
        },
        {
          deep: true,
          immediate: true
        }
      );
    };

    if (navigator.geolocation) {
      /**
       * 获取当前经纬度
       */
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadBaiDuMap(() => {
            onInitMap();
            watchFormDataId();
          });
        },
        () => {
          loadBaiDuMap(() => {
            onInitMap();
            watchFormDataId();
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 1000
        }
      );
    }

    /**
     * 初始化地图
     */
    const onInitMap = () => {
      if ((window as any).BMapGL) {
        BMapGL = (window as any).BMapGL;
      }

      if (!BMapGL) {
        return;
      }

      map = new BMapGL.Map(mapContainerRef.value);
      point = new BMapGL.Point(coords.value.longitude, coords.value.latitude);

      marker = new BMapGL.Marker(point);
      map.addOverlay(marker);

      map.centerAndZoom(point, 15);
      map.enableScrollWheelZoom(true);

      const zoomCtrl = new BMapGL.ZoomControl();
      map.addControl(zoomCtrl);

      if (props.viewType === ViewType.Detail) {
        return;
      }

      const cityCtrl = new BMapGL.CityListControl();
      map.addControl(cityCtrl);

      const locationControl = new BMapGL.LocationControl({
        anchor: (window as any).BMAP_ANCHOR_BOTTOM_RIGHT,
        offset: new BMapGL.Size(10, 80)
      });

      map.addControl(locationControl);

      map.addEventListener('click', onClickInMap);
    };

    const sliceFloat = (val: number, decimal: number) => {
      const _val = val.toString();
      const [init, float] = _val.split('.');

      return Number(`${init}.${float.slice(0, decimal)}`);
    };

    /**
     * 地图点击事件
     *
     * 先移除原先的标记点，再创建新的标记点
     */
    const onClickInMap = (e) => {
      if (props.disabled) {
        return;
      }

      let BMapGL;

      if ((window as any).BMapGL) {
        BMapGL = (window as any).BMapGL;
      }

      if (!BMapGL) {
        return;
      }

      map.removeOverlay(marker);

      point = new BMapGL.Point(e.latlng.lng, e.latlng.lat);
      marker = new BMapGL.Marker(point);
      map.addOverlay(marker);

      const lng = sliceFloat(e.latlng.lng, props.startFieldDecimal);
      const lat = sliceFloat(e.latlng.lat, props.endFieldDecimal);

      coords.value = {
        longitude: lng,
        latitude: lat
      };

      props.change!([lng, lat]);
    };

    onBeforeUnmount(() => {
      if (map) {
        map.removeEventListener('click', onClickInMap);
      }
    });

    return { mapContainerRef, styles };
  }
});
</script>
<style lang="scss">
#plat_map_container {
  border: 1px solid #e8eaec;
  border-radius: 10px;
  .anchorBL {
    display: none;
  }
}

#location_map_container {
  .BMap_noprint.anchorBR {
    transform: scale(0.8);
  }
}

.location_map_container-disabled {
  position: relative;
  &::after {
    position: absolute;
    display: block;
    content: '';
    width: 100%;
    height: 100%;
    z-index: 100;
  }
}
</style>

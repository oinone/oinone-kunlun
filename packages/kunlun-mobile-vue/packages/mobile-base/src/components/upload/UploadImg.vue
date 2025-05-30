<template>
  <div :class="classes">
    <file-upload
      :value="value"
      listType="picture-card"
      :limit="limit"
      :limit-size="limitSize"
      :all-limit-size="allLimitSize"
      :accept="accept"
      :disabled="disabled"
      :readonly="readonly"
      :managed="managed"
      :multiple="multiple"
      :partSize="partSize"
      :parallel="parallel"
      :chunkUploadThreshold="chunkUploadThreshold"
      @change="onChangeFile"
      @remove="onRemoveFile"
      @preview="handlePreview"
    >
      <!--      <div-->
      <!--        v-if="-->
      <!--          !readonly &&-->
      <!--          (!value ||-->
      <!--            (Array.isArray(value)-->
      <!--              ? limit && (limit === -1 || value.length < limit)-->
      <!--              : Object.keys(value).filter((name) => !name.includes('_')).length === 0))-->
      <!--        "-->
      <!--      >-->
      <!--        <plus-outlined />-->
      <!--        <div class="ant-upload-text">Upload</div>-->
      <!--      </div>-->
      <!--    </file-upload>-->
      <template #default v-if="showCustomUploadBtn">
        <i class="iconfont oinone-circle-add"></i>
      </template>
    </file-upload>
    <van-popup v-model:show="previewVisible" safe-area-inset-bottom teleport="body">
      <van-image alt="example" style="width: 100%" :src="previewImage" />
    </van-popup>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, PropType, computed } from 'vue';
import { Popup as VanPopup, Image as VanImage } from 'vant';
import { FormLayout, useInjectOioFormContext } from '@kunlun/vue-ui-common';
import { CastHelper, DEFAULT_PREFIX, StringHelper } from '@kunlun/vue-ui-mobile-vant';
import { isNil } from 'lodash-es';
import { useMetadataProps } from '../../basic';
import FileUpload from './File.vue';
import { UploadCommonProps } from '../prop';

export default defineComponent({
  name: 'UploadImg',
  components: {
    VanPopup,
    VanImage,
    FileUpload
  },
  inheritAttrs: false,
  props: {
    ...UploadCommonProps,
    value: {
      type: [Array, Object, String] as PropType<string | (string | object)[]>
    },
    fakeVertical: Boolean
  },
  emits: ['change', 'remove'],
  setup(props, { emit, attrs }) {
    const previewVisible = ref<boolean>(false);
    const previewImage = ref<string | undefined>('');
    const { readonly, disabled } = useMetadataProps(props, true);
    const accept = computed(() => {
      const list = Array.isArray(props.limitFileExtensions)
        ? props.limitFileExtensions
        : props.limitFileExtensions?.split(',') || '.jpg,.jpeg,.png,.gif,.bmp'.split(',');
      return list.map((a) => a.replace('.', 'image/')).join(',');
    });

    const handlePreview = async (file) => {
      if (!file.url && !file.preview) {
        return;
      }

      previewImage.value = file.url || file.preview;
      previewVisible.value = true;
    };

    const handleCancel = () => {
      previewVisible.value = false;
    };

    const onChangeFile = (v) => {
      props.change && props.change(v);
      emit('change', v);
    };

    const onRemoveFile = (v) => {
      props.remove && props.remove(v);
      emit('remove', v);
    };

    const formContext = useInjectOioFormContext();
    const vertical = computed(() => {
      let layout;
      if (!layout && formContext) {
        layout = formContext.layout.value!;
      }
      return layout === FormLayout.VERTICAL;
    });
    const fakeVertical = computed(() => props.fakeVertical && !vertical.value);
    const showCustomUploadBtn = computed(() => {
      return (
        fakeVertical.value &&
        !readonly.value &&
        (!props.value ||
          (Array.isArray(props.value)
            ? !isNil(props.limit) && (props.limit === -1 || props.value.length < props.limit)
            : Object.keys(props.value).filter((name) => !name.includes('_')).length === 0))
      );
    });

    const classes = computed(() =>
      StringHelper.append([`${DEFAULT_PREFIX}-default-upload-img`], CastHelper.cast(attrs.class))
    );
    return {
      classes,
      showCustomUploadBtn,
      fakeVertical,
      previewVisible,
      previewImage,
      readonly,
      disabled,
      accept,
      handlePreview,
      handleCancel,
      onChangeFile,
      onRemoveFile,
      DEFAULT_PREFIX
    };
  }
});
</script>
<style lang="scss"></style>

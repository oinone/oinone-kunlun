<template>
  <div class="apps-business-screen-card-list">
    <div class="cardList">
      <div v-for="index in num" :key="index" class="cards">
        <v-card
          :executeAction="executeAction"
          :record="categoryModules[index - 1]"
          v-if="index > 0 && categoryModules[index - 1]"
        ></v-card>
        <div v-else></div>
      </div>
    </div>
    <div v-if="categoryModules.length > cardsSize" class="more">
      <div v-if="showMore">
        <span @click="showMoreFunction" class="showMore"
          >{{ translateValueByKey('查看更多') }}
          <i class="iconfont oinone-xiala" style="display: inline-block"></i>
        </span>
      </div>
      <div v-else>
        <span @click="showLessFunction" class="notShowMore"
          >{{ translateValueByKey('收起') }}
          <i class="iconfont oinone-xiala" style="transform: rotate(180deg); display: inline-block"></i>
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
import Card from './Card.vue';

export default defineComponent({
  data() {
    const num = this.cardsSize === 0 ? 1 : this.cardsSize;
    return {
      showMore: true,
      num,
      translateValueByKey
    };
  },
  props: ['categoryModules', 'cardsSize', 'executeAction'],
  setup() {},
  components: {
    'v-card': Card
  },
  methods: {
    showMoreFunction() {
      this.showMore = !this.showMore;
      this.num = this.categoryModules.length;
    },
    showLessFunction() {
      this.showMore = !this.showMore;
      this.num = this.cardsSize;
    }
  }
});
</script>

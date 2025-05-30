<template>
  <div class="apps-relation-graph" v-show="moduleRelation.id">
    <div class="apps-relation-graph-close" @click="moduleRelation.id = ''">
      <i class="iconfont oinone-guanbi1"></i>
    </div>
    <div style="width: 100%; height: 100%" ref="node" @click.stop></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, watch, nextTick, onMounted } from 'vue';
import { genStaticPath, translateValueByKey } from '@kunlun/engine';

export default defineComponent({
  props: {
    moduleRelation: {
      type: Object as PropType<any>,
      default: () => ({})
    }
  },
  emits: ['click-card'],
  setup(props, { emit }) {
    const node = ref<HTMLElement>('' as any);
    let graph;
    let dataSource: any[] = [];

    const getNode = (module) => ({
      ...module,
      id: module.module,
      code: module.id
    });

    const getEdge = (path) => ({
      source: path.fromModule,
      target: path.toModule
    });

    const dataTransform = (data) => {
      let nodes: any[] = [];
      let edges: any[] = [];
      nodes.push(getNode(data));
      const upNodes = data.upNodes.map((v) => getNode(v));
      const downNodes = data.downNodes.map((v) => getNode(v));
      const upPaths = data.upPaths.map((path) => ({
        source: path.toModule,
        target: path.fromModule,
        style: {
          stroke: '#035DFF',
          lineWidth: 2
        }
      }));
      const downPaths = data.downPaths.map((v) => ({
        ...getEdge(v),
        style: {
          stroke: '#035DFF',
          lineWidth: 2
        }
      }));

      nodes = nodes.concat(upNodes).concat(downNodes);
      edges = edges.concat(upPaths).concat(downPaths);

      dataSource = nodes;

      return {
        nodes,
        edges
      };
    };

    const setEdgeStyleByNode = (code: string, style: Record<string, any>) => {
      const node = graph.getNodes().find((node) => node._cfg.model.code === code);

      if (node) {
        const edges = node._cfg.edges || [];

        edges.forEach((e) => {
          graph.updateItem(e._cfg.id, {
            style
          });
        });
      }
    };

    (window as any)._onMouseenterCard = (code) => {
      setEdgeStyleByNode(code, {
        lineWidth: 4,
        stroke: '#FFFFFF'
      });

      if (props.moduleRelation.id != code) {
        const dom = document.getElementById(code);
        dom && (dom.style.boxShadow = '0 0px 15px #fff');
      }
    };

    (window as any)._onMouseLeaveCard = (code) => {
      setEdgeStyleByNode(code, {
        lineWidth: 2,
        stroke: '#035DFF'
      });

      if (props.moduleRelation.id != code) {
        const dom = document.getElementById(code);
        dom && (dom.style.boxShadow = 'none');
      }
    };

    (window as any)._onClickCard = (code) => {
      const data = dataSource.find((d) => +d.code === +code);
      data &&
        emit('click-card', {
          ...data,
          id: data.code
        });
    };

    onMounted(() => {
      if (typeof window !== 'undefined')
        window.onresize = () => {
          if (!graph || graph.get('destroyed')) return;
          if (!node.value || !node.value.clientWidth || !node.value.clientHeight) return;
          graph.changeSize(node.value.clientWidth, node.value.clientHeight);
        };
    });

    watch(
      () => props.moduleRelation.id,
      (v) => {
        nextTick(() => {
          if (!v) return;

          const width = node.value.clientWidth;
          const height = node.value.clientHeight;

          if (!graph) {
            const G6 = (window as any).G6;

            G6.registerNode(
              'card-node-type',
              {
                draw: (cfg, group) => {
                  const _config = cfg;

                  return group!.addShape('dom', {
                    attrs: {
                      height: 74,
                      width: 190,
                      x: -95,
                      y: -37,
                      html: `<div
                              style="
                                width: 190px;
                                height: 90px;
                                border-radius: 5px;
                                ${
                                  _config.code === props.moduleRelation.id
                                    ? `background: #00102E;border: 1px solid rgba(3,93,255,1);box-shadow: 0px 0px 10px 0px rgba(3,93,255,1);`
                                    : 'background: #fff'
                                }
                              "
                              id="${_config.code}"
                              onmouseenter="_onMouseenterCard('${_config.code}')"
                              onmouseleave="_onMouseLeaveCard('${_config.code}')"
                              onclick="_onClickCard(${_config.code})"
                          >
                            <div class="card apps-business-screen-card ${
                              _config.code === props.moduleRelation.id && 'main-apps-business-screen-card'
                            }" style="overflow: hidden;border: none;">
                              <div class="application-content">
                                <div class="application-text">
                                  <img style="width: 26px" src="${
                                    _config.application
                                      ? `${genStaticPath('标签1_1651399484151.png')}`
                                      : `${genStaticPath('标签2_1651399538680.png')}`
                                  }" alt="" />
                                </div>
                              </div>
                              <img class="logo" src="${_config.logo || `${genStaticPath('default.png')}`}" />
                              <div class="info">
                                <div class="title">${_config.displayName}</div>
                                <div>
                                  <div class="state">${translateValueByKey('已安装')}</div>
                                </div>
                              </div>
                            </div>
                          </div>`
                    },
                    draggable: true
                  });
                },
                update: undefined
              },
              'single-node'
            );

            graph = new G6.Graph({
              container: node.value,
              renderer: 'svg',
              width,
              height,
              layout: {
                type: 'dagre',
                nodesep: 70,
                ranksep: 60,
                controlPoints: true
              },
              defaultNode: {
                type: 'card-node-type'
              },
              defaultEdge: {
                type: 'polyline'
              },
              modes: {
                default: ['drag-canvas', 'zoom-canvas', 'click-select']
              },
              fitView: true
            });
          }

          graph.data(dataTransform(props.moduleRelation));
          graph.render();
          graph.fitView();

          graph.on('edge:mouseenter', (evt) => {
            graph.updateItem(evt.item!._cfg!.id as string, {
              style: {
                lineWidth: 4,
                stroke: '#FFFFFF'
              }
            });
          });

          graph.on('edge:mouseleave', (evt) => {
            graph.updateItem(evt.item!._cfg!.id as string, {
              style: {
                lineWidth: 2,
                stroke: '#035DFF'
              }
            });
          });
        });
      }
    );

    return { node };
  }
});
</script>
<style lang="scss">
.apps-relation-graph {
  position: fixed;
  z-index: 1000;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.8);

  .apps-relation-graph-close {
    position: absolute;
    right: 30px;
    top: 30px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #fff;
    background: rgba(3, 3, 3, 0.63);
    font-size: 16px;
    cursor: pointer;
    border-radius: 20px;
  }
}
</style>

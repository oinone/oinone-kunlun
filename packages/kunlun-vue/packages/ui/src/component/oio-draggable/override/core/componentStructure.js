const getHtmlElementFromNode = ({ el }) => el;
const addContext = (domElement, context) => (domElement.__draggable_context = context);
const getContext = (domElement) => domElement.__draggable_context;

class ComponentStructure {
  constructor({ nodes, root, realList }) {
    const { header, default: defaultNodes, footer } = nodes;
    this.nodes = nodes;
    this.children = [...header, ...defaultNodes, ...footer];
    this.externalComponent = root.externalComponent;
    this.rootTransition = root.transition;
    this.tag = root.tag;
    this.realList = realList;
  }

  get _isRootComponent() {
    return this.externalComponent || this.rootTransition;
  }

  render(h, attributes) {
    const { tag, children, _isRootComponent } = this;
    const option = !_isRootComponent ? children : { default: () => children };
    return h(tag, attributes, option);
  }

  updated() {
    const { nodes, realList } = this;
    nodes.default.forEach((node, index) => {
      addContext(getHtmlElementFromNode(node), {
        element: realList[index],
        index
      });
    });
  }

  getUnderlyingVm(domElement) {
    return getContext(domElement);
  }

  getVmIndexFromDomIndex(domIndex, element) {
    const { nodes } = this;
    const { length } = nodes.default;
    const domChildren = element.children;
    const domElement = domChildren.item(domIndex);

    if (domElement === null) {
      return length;
    }
    const context = getContext(domElement);
    if (context) {
      return context.index;
    }

    if (length === 0) {
      return 0;
    }
    const firstDomListElement = getHtmlElementFromNode(nodes.default[0]);
    const indexFirstDomListElement = [...domChildren].findIndex((element) => element === firstDomListElement);
    return domIndex < indexFirstDomListElement ? 0 : length;
  }
}

export { ComponentStructure };

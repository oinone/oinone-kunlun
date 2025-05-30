function parseXml(xml) {
  let dom: any = null;
  if ((window as any).DOMParser) {
    try {
      dom = new DOMParser().parseFromString(xml, 'application/xml');
    } catch (e) {
      dom = null;
    }
  } else if ((window as any).ActiveXObject) {
    try {
      dom = new ActiveXObject('Microsoft.XMLDOM');
      dom.async = false;
      if (!dom.loadXML(xml)) window.alert(dom.parseError.reason + dom.parseError.srcText);
    } catch (e) {
      dom = null;
    }
  } else alert('cannot parse xml string!');
  return dom;
}

export function xml2json(xml, tab) {
  let X = {
    toObj: function (xml) {
      let o: any = {};
      if (xml.nodeType == 1) {
        // element node ..
        if (xml.attributes.length)
          // element with attributes  ..
          for (let i = 0; i < xml.attributes.length; i++)
            o['_' + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || '').toString();
        if (xml.firstChild) {
          // element has child nodes ..
          let textChild = 0,
            cdataChild = 0,
            hasElementChild = false;
          for (let n = xml.firstChild; n; n = n.nextSibling) {
            if (n.nodeType == 1) hasElementChild = true;
            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++;
            // non-whitespace text
            else if (n.nodeType == 4) cdataChild++; // cdata section node
          }
          if (hasElementChild) {
            if (textChild < 2 && cdataChild < 2) {
              // structured element with evtl. a single text or/and cdata node ..
              X.removeWhite(xml);
              for (let n = xml.firstChild; n; n = n.nextSibling) {
                if (n.nodeType == 3)
                  // text node
                  o['#text'] = X.escape(X.unescape(n.nodeValue));
                else if (n.nodeType == 4)
                  // cdata node
                  o['#cdata'] = X.escape(X.unescape(n.nodeValue));
                else if (o[n.nodeName]) {
                  // multiple occurence of element ..
                  if (o[n.nodeName] instanceof Array) o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                  else o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                } // first occurence of element..
                else o[n.nodeName] = X.toObj(n);
              }
            } else {
              // mixed content
              if (!xml.attributes.length) o = X.escape(X.unescape(X.innerXml(xml)));
              else o['#text'] = X.escape(X.unescape(X.innerXml(xml)));
            }
          } else if (textChild) {
            // pure text
            if (!xml.attributes.length) o = X.escape(X.unescape(X.innerXml(xml)));
            else o['#text'] = X.escape(X.unescape(X.innerXml(xml)));
          } else if (cdataChild) {
            // cdata
            if (cdataChild > 1) o = X.escape(X.unescape(X.innerXml(xml)));
            else for (let n = xml.firstChild; n; n = n.nextSibling) o['#cdata'] = X.escape(X.unescape(n.nodeValue));
          }
        }
        if (!xml.attributes.length && !xml.firstChild) o = null;
      } else if (xml.nodeType == 9) {
        // document.node
        o = X.toObj(xml.documentElement);
      } else alert('unhandled node type: ' + xml.nodeType);
      return o;
    },
    toJson: function (o, name, ind) {
      let json = name ? '"' + name + '"' : '';
      if (o instanceof Array) {
        for (let i = 0, n = o.length; i < n; i++) o[i] = X.toJson(o[i], '', ind + '\t');
        json +=
          (name ? ':[' : '[') +
          (o.length > 1 ? '\n' + ind + '\t' + o.join(',\n' + ind + '\t') + '\n' + ind : o.join('')) +
          ']';
      } else if (o == null) json += (name && ':') + 'null';
      else if (typeof o == 'object') {
        let arr: any[] = [];
        for (let m in o) arr[arr.length] = X.toJson(o[m], m, ind + '\t');
        json +=
          (name ? ':{' : '{') +
          (arr.length > 1 ? '\n' + ind + '\t' + arr.join(',\n' + ind + '\t') + '\n' + ind : arr.join('')) +
          '}';
      } else if (typeof o == 'string') json += (name && ':') + '"' + o.toString() + '"';
      else json += (name && ':') + o.toString();
      return json;
    },
    innerXml: function (node) {
      let s = '';
      if ('innerHTML' in node) s = node.innerHTML;
      else {
        let asXml = function (n) {
          let s = '';
          if (n.nodeType == 1) {
            s += '<' + n.nodeName;
            for (let i = 0; i < n.attributes.length; i++)
              s += ' ' + n.attributes[i].nodeName + '="' + (n.attributes[i].nodeValue || '').toString() + '"';
            if (n.firstChild) {
              s += '>';
              for (let c = n.firstChild; c; c = c.nextSibling) s += asXml(c);
              s += '</' + n.nodeName + '>';
            } else s += '/>';
          } else if (n.nodeType == 3) s += n.nodeValue;
          else if (n.nodeType == 4) s += '<![CDATA[' + n.nodeValue + ']]>';
          return s;
        };
        for (let c = node.firstChild; c; c = c.nextSibling) s += asXml(c);
      }
      return s;
    },
    escape: function (txt) {
      return txt.replace(/[\\]/g, '\\\\').replace(/[\"]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r');
    },
    unescape: function (txt) {
      return txt
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    },
    removeWhite: function (e) {
      e.normalize();
      for (let n = e.firstChild; n; ) {
        if (n.nodeType == 3) {
          // text node
          if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
            // pure whitespace text node
            let nxt = n.nextSibling;
            e.removeChild(n);
            n = nxt;
          } else n = n.nextSibling;
        } else if (n.nodeType == 1) {
          // element node
          X.removeWhite(n);
          n = n.nextSibling;
        } // any other node
        else n = n.nextSibling;
      }
      return e;
    }
  };
  if (xml.nodeType == 9)
    // document node
    xml = xml.documentElement;
  let json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, '\t');
  return '{\n' + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, '')) + '\n}';
}

export function json2xmlFork(o, tab?: string) {
  const toXml = function (v, name, ind) {
    let xml = '';
    if (v instanceof Array) {
      for (let i = 0, n = v.length; i < n; i++) {
        xml += `${ind + toXml(v[i], name, `${ind}\t`)}\n`;
      }
    } else if (typeof v === 'object') {
      if (name.indexOf('-key') > -1) {
        name = name.split('-')[0];
      }
      let hasChild = false;
      xml += `${ind}<${name}`;
      for (const m in v) {
        if (m.charAt(0) === '_') {
          xml += ` ${m.substr(1)}="${v[m].toString()}"`;
        } else {
          hasChild = true;
        }
      }
      xml += hasChild ? '>' : '/>';
      if (hasChild) {
        for (const m in v) {
          if (m == '#text') {
            xml += v[m];
          } else if (m == '#cdata') {
            xml += `<![CDATA[${v[m]}]]>`;
          } else if (m.charAt(0) != '_') {
            xml += toXml(v[m], m, `${ind}\t`);
          }
        }

        xml += `${xml.charAt(xml.length - 1) == '\n' ? ind : ''}</${name}>`;
      }
    } else {
      if (name.indexOf('-key') > -1) {
        name = name.split('-')[0];
      }
      if (v) {
        xml += `${ind}<${name}>${v.toString()}</${name}>`;
      }
    }
    return xml;
  };
  let xml = '';
  for (const m in o) {
    xml += toXml(o[m], m, '');
  }

  return xml.replace(/\t|\n/g, '');
}

function resolvePackConfig(obj): Record<string, unknown> {
  let packConfig = {};
  Object.keys(obj).forEach((key) => {
    if (isObj(obj[key]) || isArr(obj[key])) {
      return;
    }
    if (key.indexOf('_') === 0) {
      packConfig[key.slice(1)] = obj[key];
    }
  });
  return packConfig;
}

const configAttr = ['ACTIONBAR', 'TABLE', 'FORM', 'SEARCH'];
const dslAttr = ['field', 'action', 'widget'];
const widgetAttr = ['group', 'tabs', 'tab', 'block', '_widget', 'row', 'area'];
const metaAttr = ['actionBar', 'content'];
const metaKey = ['_slot'];
const rootAttr = ['view', 'modal'];
const configMap = new Map();
const packsMap = new Map();

function isObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function isArr(arr) {
  return Array.isArray(arr);
}

function getLayoutConfig(dsl) {
  if (isObj(dsl)) {
    Object.keys(dsl).forEach((key) => {
      if (isObj(dsl[key])) {
        getLayoutConfig(dsl[key]);
        return;
      }
      if (isArr(dsl[key])) {
        dsl[key].forEach((d) => {
          getLayoutConfig(d);
        });
        return;
      }
      if (configAttr.includes(dsl[key].toLocaleUpperCase())) {
        configMap.set(dsl[key].toLocaleUpperCase(), dsl);
      }
    });
  }
}

// isContinue 是为了阻止平级标签是否渲染 和前端xml转json的机制有关系
function getPacks(parent, dsl, container, isContinue = false) {
  if (isObj(dsl)) {
    Object.keys(dsl).forEach((key) => {
      // 跟标签
      if (rootAttr.includes(key)) {
        container = {
          ...resolvePackConfig(dsl[key]),
          packs: getPacks(dsl, dsl[key].cloze, [])
        };
        packsMap.set(parent.field || 'rootView', container);
        return container;
      }
      //_slot
      if (metaKey.includes(key)) {
        const metaObj = {
          meta: dsl[key]
        };
        delete dsl[key];
        container.push({
          ...metaObj,
          packs: getPacks('', dsl, [], true)
        });
        return container;
      }
      // field | action | widget
      if (dslAttr.includes(key) && isContinue) {
        if (isArr(dsl[key])) {
          const packs = dsl[key].map((d) => {
            return {
              ...resolvePackConfig(d),
              dslNodeType: key
            };
          });
          container = [...packs];
          return container;
        } else if (dsl[key].field) {
          const packs = dsl[key].field.map((field) => {
            return {
              ...resolvePackConfig(field),
              dslNodeType: 'field'
            };
          });
          container.push({
            ...resolvePackConfig(dsl[key]),
            dslNodeType: key,
            packs
          });
          return container;
        } else {
          let pack = null;
          if (dsl[key].view) {
            pack = getPacks(dsl[key], { view: dsl[key].view }, {}, true);
          }
          container.push({
            ...resolvePackConfig(dsl[key]),
            dslNodeType: key,
            pack
          });
          return container;
        }
      }

      // group | tabs | tab | block
      if (widgetAttr.includes(key) && isContinue) {
        if (isArr(dsl[key])) {
          const widgets = dsl[key].map((widget) => {
            return {
              ...resolvePackConfig(widget),
              widget: key,
              packs: getPacks('', widget, [], true)
            };
          });
          container = [...widgets];
          return container;
        } else {
          container.push({
            ...resolvePackConfig(dsl[key]),
            widget: key,
            packs: getPacks('', dsl[key], [], true)
          });
        }

        return container;
      }
    });

    return container;
  }
  if (isArr(dsl)) {
    dsl.forEach((d) => {
      Object.keys(d).forEach((key) => {
        if (widgetAttr.includes(key) && isContinue) {
          container.push({
            widget: key,
            packs: getPacks(d, d[key], [], true)
          });
          return container;
        }

        if (metaKey.includes(key)) {
          const metaObj = {
            meta: d[key]
          };
          delete d[key];
          container.push({
            ...metaObj,
            packs: getPacks('', d, [], true)
          });
          return container;
        }

        if (dslAttr.includes(key) && isContinue) {
          if (isArr(d[key])) {
            const packs = d[key].map((d) => {
              return {
                ...resolvePackConfig(d),
                dslNodeType: key
              };
            });
            container = [...packs];
            return container;
            // 特殊处理区间组件. 临时处理
          } else if (d['field']) {
            const packs = d['field'].map((field) => {
              return {
                ...resolvePackConfig(field),
                dslNodeType: 'field'
              };
            });
            container = [...packs];
            return container;
          } else {
            container.push({
              ...resolvePackConfig(d[key]),
              dslNodeType: key
            });
            return container;
          }
        }
      });
    });
    return container;
  }
  console.error('compler error');
}

export function getLayoutConfigAndDsl(layout, template) {
  let dsl = {},
    layoutXml = '';
  const layoutDsl = JSON.parse(xml2json(parseXml(layout), ''));
  const templateDsl = JSON.parse(xml2json(parseXml(template), ''));
  getLayoutConfig(templateDsl);
  dsl = getPacks('', templateDsl, dsl);
  console.log(dsl, packsMap, configMap, templateDsl);
  return {
    dsl,
    layout: layoutXml
  };
}

import { IModel } from '@kunlun/meta';
import { queryPage } from '@kunlun/service';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { MaskWidget } from '../../basic';
import QuickSearchComponent from './QuickSearch.vue';

interface ITreeNode {
  title: string;
  key: string;
  children: ITreeNode[];
  isLeaf: boolean;
  url?: string;
  slots?: {
    icon: string;
  };
}

@SPI.ClassFactory(MaskWidget.Token({ widget: 'quick-search' }))
export class QuickSearch extends MaskWidget {
  @Widget.Reactive()
  private rawData: Record<string, unknown>[] = [];

  @Widget.Reactive()
  private showLogo = false;

  @Widget.Reactive()
  private searchCondition = '';

  @Widget.Reactive()
  private model!: IModel;

  @Widget.Reactive()
  private isLazyLoad: boolean = false;

  public initialize(props) {
    super.initialize(props);
    const { showLogo = false, isLazyLoad = true } = props.dslNode || {};
    this.showLogo = showLogo as boolean;
    this.isLazyLoad = isLazyLoad;

    this.setComponent(QuickSearchComponent);
    return this;
  }

  private async loadTreeData(parentCode: string = '') {
    const field = this.model.modelFields.find((mf) => mf.name === this.getDsl().name)!;
    let condition = 'parentCode=isnull=true';
    if (parentCode) {
      condition = `parentCode==${parentCode}`;
    }
    const data = (
      await queryPage(field.references!, { pageSize: 100, condition }, undefined, undefined, {
        maxDepth: 0
      })
    ).content;
    const { labelKey, valueKey } = this.getDsl().children[0];
    return data.map((d) => {
      return {
        ...d,
        title: d[labelKey] as string,
        key: d[valueKey] as string,
        children: [],
        isLeaf: d.hasChild === undefined ? false : !d.hasChild
      };
    });
  }

  private mergeTreeNode(node, data) {
    if (node.id === data.id) {
      return {
        ...data,
        ...node
      };
    }
    if (data.children && data.children.length) {
      data.children = data.children.map((d) => {
        return this.mergeTreeNode(node, d);
      });
      return data;
    }
    return data;
  }

  @Widget.Method()
  private async loadData(node) {
    const code = node.dataRef.code;
    const children = await this.loadTreeData(code);
    this.rawData = this.rawData.concat(children);
    if (children.length) {
      node.dataRef.children = [...children];
      this.treeData = this.treeData.map((data) => {
        return this.mergeTreeNode(node.dataRef, data);
      });
    }
  }

  public async loadMetadata(model: IModel) {
    this.model = model;
  }

  public async mounted() {
    super.mounted();
    if (this.isLazyLoad) {
      this.rawData = await this.loadTreeData();
      this.treeData = this.rawData as any;
    } else {
      const field = this.model.modelFields.find((mf) => mf.name === this.getDsl().name)!;
      this.rawData = (
        await queryPage(
          field.references!,
          { pageSize: 100, condition: 'parentCode=isnull=true' },
          undefined,
          undefined,
          {
            maxDepth: 0
          }
        )
      ).content;
      this.treeData = this.buildTree(null);
    }
  }

  @Widget.Reactive()
  private treeData: ITreeNode[] = [];

  private isLeaf(key) {
    return !this.rawData.find((d) => {
      const parent = d[this.getDsl().children[0].parentKey as string] as Record<string, unknown>;
      return parent && parent[this.getDsl().children[0].valueKey as string] === key;
    });
  }

  private resolveRsql(data: Record<string, unknown>) {
    return this.getDsl().children[0].rsql;
  }

  @Widget.Method()
  private onSelect(selectKeys: string[]) {
    const data = this.rawData.find((d) => d[this.getDsl().children[0].valueKey as string] === selectKeys[0]);

    if (data) {
      const keys: string[] = [];
      const values: any[] = [];

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          keys.push(key);
          values.push(data[key]);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const fun = new Function(...keys, `return \`${this.getDsl().children[0].rsql}\``);
      this.searchCondition = fun.call(null, ...values);
      // fixme @zbh 20230417 改版
      // this.reload$.subject.next(this.searchCondition);
    } else {
      this.searchCondition = '';
      // this.reload$.subject.next(this.searchCondition);
    }
  }

  public getSearchCondition(): string {
    return this.searchCondition;
  }

  @Widget.Reactive()
  private get proxyTreeData() {
    const isShowNode = (node: ITreeNode) => {
      if (node.title.indexOf(this.searchText) !== -1) {
        return true;
      }
      if (!node.children.length) {
        return false;
      }
      return node.children.map((c) => isShowNode(c)).includes(true);
    };

    const filterNode = (node: ITreeNode, arr: ITreeNode[]) => {
      if (isShowNode(node)) {
        const rnode: ITreeNode = { ...node, children: [], slots: { icon: 'icon' } };
        arr.push(rnode);
        node.children.forEach((c) => filterNode(c, rnode.children));
      }
    };

    const res: ITreeNode[] = [];
    this.treeData.forEach((td) => filterNode(td, res));
    return res;
  }

  @Widget.Reactive()
  private searchText = '';

  @Widget.Method()
  private onChange(e) {
    this.searchText = e.target.value;
  }

  private buildTree(node: ITreeNode | null) {
    const result: ITreeNode[] = [];
    if (!node) {
      this.rawData
        .filter((d) => d[this.getDsl().children[0].parentKey as string] === undefined)
        .forEach((d) =>
          result.push({
            title: d[this.getDsl().children[0].labelKey as string] as string,
            key: d[this.getDsl().children[0].valueKey as string] as string,
            children: [],
            isLeaf: false,
            url: (d.logo as any) ? (d.logo as any).url : ''
          })
        );
    } else {
      this.rawData
        .filter((d) => {
          const parent = d[this.getDsl().children[0].parentKey as string] as Record<string, unknown>;
          return parent && parent[this.getDsl().children[0].valueKey as string] === node.key;
        })
        .forEach((d) =>
          result.push({
            title: d[this.getDsl().children[0].labelKey as string] as string,
            key: d[this.getDsl().children[0].valueKey as string] as string,
            children: [],
            isLeaf: false,
            url: (d.logo as any) ? (d.logo as any).url : ''
          })
        );
    }
    result.forEach((r) => (r.children = this.buildTree(r)));
    if (result.length === 0) {
      node && (node.isLeaf = true);
    }
    return result;
  }
}

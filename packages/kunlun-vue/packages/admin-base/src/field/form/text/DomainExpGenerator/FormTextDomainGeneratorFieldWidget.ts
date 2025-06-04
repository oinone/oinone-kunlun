import { SubmitValue } from '@oinone/kunlun-engine';
import { IModel, IModelField, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { getModel } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormTextFieldWidget } from '../FormTextFieldWidget';
import Component from './DomainExpGenerator.vue';

interface IExp {
  left: { name: string; val: string };
  operator: { name: string; val: string };
  right: {
    name: string;
    val: unknown | unknown[];
  };
}

@SPI.ClassFactory(
  FormFieldWidget.Token({ viewType: ViewType.Form, ttype: ModelFieldType.Text, widget: 'DomainExpGenerator' })
)
export class FormTextDomainGeneratorFieldWidget extends FormTextFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Component);
    return this;
  }

  @Widget.Reactive()
  private get exps(): {
    connect: string;
    exps: IExp[];
  } {
    try {
      return JSON.parse(this.formData.domainExpJson as string);
    } catch (e) {
      return { exps: [], connect: 'and' };
    }
  }

  private set _exps(newExp) {
    this.formData.domainExpJson = JSON.stringify(newExp);
  }

  private _ExpsChange(newExps) {
    const str = newExps.exps
      .map((exp) => {
        return `${exp.left.name || ''} ${exp.operator.name || ''} ${
          Array.isArray(exp.right)
            ? exp.right.map((v) => v.name || v.val).join(',')
            : exp.right.name || exp.right.val || ''
        }`;
      })
      .join(` ${newExps.connect} `);
    this.formData.domainExpDisplayName = str;
    this.formData.domainExp = newExps.exps
      .filter((exp) => exp.left.val !== undefined && exp.operator.val !== undefined && exp.right.val !== undefined)
      .map((exp) => this.resolveDomainExp(exp))
      .map((s) => `(${s})`)
      .join(` ${newExps.connect} `);
    this._exps = newExps;
  }

  @Widget.Reactive()
  private fields: IModelField[] = [];

  @Widget.Watch('formData.modelDefinition')
  private async ModelChange(newModel: IModel) {
    const model = await getModel(newModel.model);
    this.fields = model.modelFields.filter((mf) => mf.ttype !== ModelFieldType.Related);
  }

  @Widget.Method()
  private newExp() {
    const exps = this.exps;
    exps.exps.push({
      left: {},
      operator: {},
      right: {}
    } as IExp);
    this._ExpsChange(exps);
  }

  @Widget.Method()
  private changeField(index, field) {
    const f = this.fields.find((mf) => mf.name === field)!;
    this.exps.exps[index].left.val = field;
    this.exps.exps[index].left.name = f.displayName || f.name;
    this._ExpsChange(this.exps);
  }

  @Widget.Method()
  private changeOpt(index, opt) {
    this.exps.exps[index].operator = { val: opt.val, name: opt.name };
    this._ExpsChange(this.exps);
  }

  @Widget.Method()
  private changeValue(index, value) {
    this.exps.exps[index].right = value;
    this._ExpsChange(this.exps);
  }

  @Widget.Method()
  private changeConnect(val) {
    this.exps.connect = val;
    this._ExpsChange(this.exps);
  }

  @Widget.Method()
  private deleteExp(index) {
    this.exps.exps.splice(index, 1);
    this._ExpsChange(this.exps);
  }

  private resolveDomainExp(exp: IExp) {
    const field = this.fields.find((mf) => mf.name === exp.left.val)!;
    if (!field.references) {
      if (exp.operator.val === '=like=' || exp.operator.val === '=notlike=') {
        return `${exp.left.val} ${exp.operator.val} %${exp.right.val}%`;
      }
      return `${exp.left.val} ${exp.operator.val} ${exp.right.val}`;
    }
    return this.resolveComplexDomainExp(exp, field);
  }

  private resolveComplexDomainExp(exp: IExp, field: IModelField) {
    const name = field.relationFields![0];
    switch (field.ttype) {
      case ModelFieldType.ManyToMany:
      case ModelFieldType.OneToMany: {
        const vals = exp.right.val as unknown[];
        if (exp.operator.val === 'include') {
          return vals.map((val) => `${exp.left.val}.${name} == ${val}`).join('or');
        }
        if (exp.operator.val === 'notinclude') {
          return vals.map((val) => `${exp.left.val}.${name} != ${val}`).join('and');
        }
        break;
      }
      case ModelFieldType.OneToOne:
      case ModelFieldType.ManyToOne: {
        return `${exp.left.val}.${name} ${exp.operator.val} ${exp.right.val}`;
        break;
      }
      default:
    }
    return '';
  }

  public submit(submitValue: SubmitValue) {
    this._ExpsChange(this.exps);
    this._exps = JSON.parse(JSON.stringify(this.exps));
    return super.submit(submitValue);
  }

  public async validator() {
    return this.validatorSuccess();
  }
}

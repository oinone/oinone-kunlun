import { translateValueByKey } from '@oinone/kunlun-engine';
import { RoleUserOptionsEnum } from '../typing';

class StrControl {
  private pivot = 0;

  private list: string[] = [];

  public append(str: string) {
    this.list.splice(this.pivot, 0, str);
    this.pivot++;
    return this;
  }

  public prepend(str: string) {
    this.list.unshift(str);
    this.pivot++;
    return this;
  }

  public postpend(str: string) {
    this.list.push(str);
    return this;
  }

  public toString(): string {
    return this.list.join('');
  }
}

class RawValue {
  public constructor(public value: string) {}
}

interface ConditionConfig {
  quote: string;
}

interface LogicalOperator {
  AND: string;
  OR: string;
}

interface ComparisonOperator {
  EQUAL: string;
  IN: string;
}

// Condition 中的 null 需要保留为字符串
type ConditionType = RawValue | string | number | boolean | null;

enum DefaultLogicalOperator {
  AND = '&&',
  OR = '||'
}

enum DefaultComparisonOperator {
  EQUAL = 'EQUALS',
  IN = 'LIST_CONTAINS'
}

export class HomepageSettingCondition extends StrControl {
  private comparisonOps: ComparisonOperator = DefaultComparisonOperator;

  private logicalOps: LogicalOperator = DefaultLogicalOperator;

  private conditionBodyData: Record<string, unknown> = {};

  public constructor(key: string, private config: ConditionConfig = { quote: "'" }) {
    super();
    this.append(key);
  }

  public setConditionBodyData(data: Record<string, unknown>) {
    this.conditionBodyData = data;
  }

  public getConditionBodyData() {
    return this.conditionBodyData;
  }

  // TODO: Condition 合法校验
  public toString(): string {
    return super.toString();
  }

  // operates
  public and(condition: HomepageSettingCondition) {
    return this.append(' ').append(this.logicalOps.AND).append(' ').append(condition.toString());
  }

  public or(condition: HomepageSettingCondition) {
    return this.append(' ').append(this.logicalOps.OR).append(' ').append(condition.toString());
  }

  public equal(condition: string) {
    const finalCondition = condition + 'L';
    if (this.toString() === RoleUserOptionsEnum.CurrentRole) {
      return this.append('[0] == ')
        .append(finalCondition)
        .prepend(`${RoleUserOptionsEnum.CurrentRole}.size == 1 && `)
        .prepend('(')
        .append(')');
    } else {
      return this.prepend(',').prepend(finalCondition).prepend('(').prepend(this.comparisonOps.EQUAL).append(')');
    }
  }

  public in(args: string[]) {
    const finalArgs = args.map((arg) => arg + 'L');
    if (this.toString() === RoleUserOptionsEnum.CurrentRole) {
      const conditionArr: string[] = [];
      finalArgs.forEach((arg) => {
        conditionArr.push(
          new HomepageSettingCondition(RoleUserOptionsEnum.CurrentRole)
            .prepend('(')
            .prepend(this.comparisonOps.IN)
            .append(',')
            .append(arg)
            .append(')')
            .toString()
        );
      });
      return new HomepageSettingCondition(conditionArr.join(' || ')).prepend('(').append(')');
    } else {
      this.prepend(',')
        .prepend(']')
        .prepend(finalArgs.join(','))
        .prepend('[')
        .prepend('(')
        .prepend(this.comparisonOps.IN)
        .append(')');
    }
    return this;
  }
}

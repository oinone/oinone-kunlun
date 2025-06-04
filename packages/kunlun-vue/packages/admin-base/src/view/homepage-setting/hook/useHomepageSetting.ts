import { uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { HomepageConfigRule } from '../typing';

export const UN_COMMITTED = 'MODULE_UN_COMMITTED';
export const ALL = 'MODULE_ALL';
export const sortFn = (a: HomepageConfigRule, b: HomepageConfigRule) =>
  (a.priorityIndex as number) - (b.priorityIndex as number);

export function useHomepageSetting() {
  let selfIncreaseIndex: number = 0;
  const homepageSettingMap: Map<string, HomepageConfigRule[]> = new Map();

  /**
   * 不传拿全部
   * @param option
   * @returns
   */
  function getRulesByOption(option?: { module?: string; enabled?: boolean }): HomepageConfigRule[] {
    if (!option) {
      return [...(homepageSettingMap.get(ALL) || []), ...(homepageSettingMap.get(UN_COMMITTED) || [])].sort(sortFn);
    }
    if (!option.module) {
      if (option.enabled !== undefined) {
        return [
          ...(homepageSettingMap.get(ALL)?.filter((rule) => rule.enabled === option.enabled) || []),
          ...(homepageSettingMap.get(UN_COMMITTED) || [])
        ].sort(sortFn);
      }
      return [...(homepageSettingMap.get(ALL) || []), ...(homepageSettingMap.get(UN_COMMITTED) || [])].sort(sortFn);
    }
    if (option.enabled !== undefined) {
      return [
        ...(homepageSettingMap.get(option.module) || []).filter((rule) => rule.enabled === option.enabled),
        ...(homepageSettingMap.get(UN_COMMITTED) || [])
      ].sort(sortFn);
    }
    return [...(homepageSettingMap.get(option.module) || []), ...(homepageSettingMap.get(UN_COMMITTED) || [])].sort(
      sortFn
    );
  }

  /**
   * 拿已保存的规则
   * @returns
   */
  function getSavedHomepageConfigRules(): HomepageConfigRule[] {
    return [...(homepageSettingMap.get(ALL) || [])].sort(sortFn);
  }

  /**
   * 拿未保存的规则
   * @returns
   */
  function getUncommitedHomepageConfigRules(): HomepageConfigRule[] {
    return [...(homepageSettingMap.get(UN_COMMITTED) || [])].sort(sortFn);
  }

  /**
   * 将规则依据 module 存入 map 的数组中(包括应用和全部)，并根据 ruleId 查，有则覆盖，新增则 push
   * @param rules
   */
  function $setRulesToMapModule(rules: HomepageConfigRule[]) {
    const allModuleRules = homepageSettingMap.get(ALL) || [];
    rules.forEach((rule) => {
      const ruleId = rule.id;
      if (!ruleId) {
        rule.id = uniqueKeyGenerator();
      }
      const priorityIndex = rule.priorityIndex;
      if (priorityIndex == undefined) {
        rule.priorityIndex = selfIncreaseIndex;
        selfIncreaseIndex++;
      }
      const module = rule.bindHomePageModule?.module;
      if (module) {
        // 存入 应用
        const moduleRules = homepageSettingMap.get(module) || [];
        const index = moduleRules.findIndex((r) => r.id === ruleId);
        if (index !== -1) {
          moduleRules[index] = rule;
        } else {
          homepageSettingMap.set(module, [...moduleRules, rule]);
        }

        // 存入 全部
        const allIndex = allModuleRules.findIndex((r) => r.id === ruleId);
        if (allIndex !== -1) {
          allModuleRules[allIndex] = rule;
        } else {
          allModuleRules.push(rule);
        }
      } else {
        console.warn('保存了不存在 module 的规则，保存失败');
      }
    });
    homepageSettingMap.set(ALL, allModuleRules);
  }

  /**
   * 将 rule 存入 rules 中，根据ruleId查，有则覆盖，新增则 push
   * @param rules
   * @param rule
   */
  function $setRuleToRulesById(rules: HomepageConfigRule[], rule: HomepageConfigRule) {
    const ruleId = rule.id;
    if (!ruleId) {
      rule.id = uniqueKeyGenerator();
    }
    const priorityIndex = rule.priorityIndex;
    if (priorityIndex == undefined) {
      rule.priorityIndex = selfIncreaseIndex;
      selfIncreaseIndex++;
    }
    const index = rules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      rules[index] = rule;
    } else {
      rules.push(rule);
    }
  }

  /**
   * 从提交态移除(包括应用和全部)
   * @param rule
   */
  function $removeRuleFromCommitted(rule: HomepageConfigRule) {
    const module = rule.bindHomePageModule?.module;
    if (module) {
      // 从 应用 map 中移除
      const moduleRules = homepageSettingMap.get(module) || [];
      const index = moduleRules.findIndex((r) => r.id === rule.id);
      if (index !== -1) {
        moduleRules.splice(index, 1);
      }
      homepageSettingMap.set(module, moduleRules);
      // 从 全部 map 中移除
      const allModuleRules = homepageSettingMap.get(ALL) || [];
      const allIndex = allModuleRules.findIndex((r) => r.id === rule.id);
      if (allIndex !== -1) {
        allModuleRules.splice(allIndex, 1);
      }
      homepageSettingMap.set(ALL, allModuleRules);
    }
  }

  /**
   * 从暂存态移除
   * @param rule
   */
  function $removeRuleFromUnCommitted(rule: HomepageConfigRule) {
    const unCommittedRules = homepageSettingMap.get(UN_COMMITTED) || [];
    const index = unCommittedRules.findIndex((r) => r.id === rule.id);
    if (index !== -1) {
      unCommittedRules.splice(index, 1);
    }
    homepageSettingMap.set(UN_COMMITTED, unCommittedRules);
  }

  /**
   * 设置已提交的规则，根据 module 加到 map，同时加到全部中
   * @param rules
   */
  function setSavedRules(rules: HomepageConfigRule[]) {
    $setRulesToMapModule(rules);
    const allModuleRules = homepageSettingMap.get(ALL) || [];
    const finalAllModuleRules = allModuleRules;
    rules.forEach((rule) => {
      $setRuleToRulesById(finalAllModuleRules, rule);
    });
    homepageSettingMap.set(ALL, finalAllModuleRules);
  }

  /**
   * 暂存未提交的规则，如果规则存在从保存移入暂存，不存在 直接push
   * @param rule
   */
  function setUnCommittedRule(rule: HomepageConfigRule) {
    $removeRuleFromCommitted(rule);
    const unCommittedRules = homepageSettingMap.get(UN_COMMITTED) || [];
    $setRuleToRulesById(unCommittedRules, rule);
    homepageSettingMap.set(UN_COMMITTED, unCommittedRules);
  }

  /**
   * 将暂存未提交的规则保存到已提交
   */
  function saveUncommitedRules() {
    const unCommittedRules = homepageSettingMap.get(UN_COMMITTED) || [];
    $setRulesToMapModule(unCommittedRules);
    homepageSettingMap.set(UN_COMMITTED, []);
  }

  /**
   * 从已提交移除(包括应用和全部)、暂存移除
   * @param rule
   */
  function removeRule(rule: HomepageConfigRule) {
    $removeRuleFromCommitted(rule);
    $removeRuleFromUnCommitted(rule);
  }

  /**
   * 检查 ruleName是否应用下唯一, 检查 module 下和 暂存下
   * @param rule
   */
  function checkRuleName(rule: HomepageConfigRule): boolean {
    const ruleName = rule.ruleName;
    if (!ruleName) {
      // 理论上不存在这种情况，因为 ruleName 字段已经经过了必填校验
      return false;
    }
    const module = rule.bindHomePageModule?.module;
    // 有 module 校验 module 下和 暂存下唯一
    if (module) {
      const moduleRules = homepageSettingMap.get(module) || [];
      const finalRules = moduleRules.filter(
        (r) => (r.bindHomePageModule?.module === module || !r.bindHomePageModule?.module) && r.id !== rule.id
      );
      return finalRules.every((r) => r.ruleName !== ruleName);
    }
    // 校验暂存下唯一
    else {
      const unCommittedRules = (homepageSettingMap.get(UN_COMMITTED) || []).filter(
        (r) => (r.bindHomePageModule?.module === module || !r.bindHomePageModule?.module) && r.id !== rule.id
      );
      return unCommittedRules.every((r) => r.ruleName !== ruleName);
    }
  }

  /**
   * 规则排序，根据id，找到两条数据，交换两条数据的 index，不修改提交状态
   * @param ruleA
   * @param ruleB
   */
  function sortTwoRules(ruleA: HomepageConfigRule, ruleB: HomepageConfigRule) {
    [ruleA.priorityIndex, ruleB.priorityIndex] = [ruleB.priorityIndex, ruleA.priorityIndex];

    $setSortRules([ruleA, ruleB]);
  }

  function $setSortRules(rules: HomepageConfigRule[]): void {
    rules.forEach((rule) => {
      const module = rule.bindHomePageModule?.module;
      if (module) {
        $setRulesToMapModule([rule]);
      } else {
        const rules = homepageSettingMap.get(UN_COMMITTED) || [];
        const index = rules.findIndex((r) => r.id === rule.id);
        if (index !== -1) {
          rules[index] = rule;
          homepageSettingMap.set(UN_COMMITTED, rules);
        }
      }
    });
  }

  return {
    getRulesByOption,
    getSavedHomepageConfigRules,
    getUncommitedHomepageConfigRules,
    setSavedRules,
    setUnCommittedRule,
    saveUncommitedRules,
    removeRule,
    checkRuleName,
    sortTwoRules
  };
}

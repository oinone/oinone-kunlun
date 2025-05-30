# Contributing to Pamirs

Pamirs 规范

 - [Commit Message 规范](#commit)

## <a name="commit"></a> Commit Message 规范（Angular Commit Message Conventions）

### 目标

- 允许通过脚本自动生成变更日志
- 允许通过命令过滤某些提交信息（例如不重要的格式变动信息）
- 提供更多的历史记录信息

### 格式化提交信息
每次提交，Commit message 都包括三个部分：**header**，**body** 和 **footer**。Header 又包含三个部分：**type**， **scope** 和 **subject**。

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

其中，**header** 是必需的，**body** 和 **footer** 可以省略。Header 中的 **scope** 也是可选项。

不管是哪一个部分，任何一行都不得超过72个字符（或100个字符）。这是为了避免自动换行影响美观。

例子: ([更多例子](https://github.com/angular/angular/commits/master))

```
docs(changelog): update changelog to beta.5
```
```
fix(release): need to depend on latest rxjs and zone.js

The version in our package.json gets copied to the one we publish, and users need the latest of these.
```

### Revert

还有一种特殊情况，如果当前 commit 用于撤销以前的 commit，则必须以revert:开头，后面跟着被撤销 Commit 的 Header。

```
revert: feat(pencil): add 'graphiteWidth' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```
Body部分的格式是固定的，必须写成 `This reverts commit <hash>.`, 其中的hash是被撤销 commit 的 SHA 标识符。

### Type
必须为以下类型之一:

* **feat**: 新增功能
* **build**: 构建相关、项目依赖的修改
* **fix**: bug 修复
* **refactor**: 重构，不包含 bug 修复与功能新增
* **enh**: 优化、性能优化
* **test**: 新增、修改测试用例
* **ci**: 持续集成相关配置的修改、调试
* **docs**: 文档变更
* **style**: 代码格式修改
* **chore**: 其他修改

### Scope
scope 应该列出本次提交影响到的 package

### Subject
subject是 commit 目的的简短描述:

* 以动词开头，使用第一人称现在时，比如change，而不是changed或changes
* 第一个字母小写
* 结尾不加句号（.）

### Body
Body 部分是对本次 commit 的详细描述，可以分成多行。

### Footer
Footer 部分只用于两种情况。

- Breaking Changes
- 关闭 Issue

**Breaking Changes** 以 `BREAKING CHANGE:` 开头，后面是对变动的描述、以及变动理由和迁移方法。

[更多 Commit Message 相关的信息](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#).

/**
 * 完整icon的map数组, 参数都为0时代表取所有
 * @param beginIndex 开始索引 >=0
 * @param length 需要的条数  >=0
 */
export function getOioIconMapList(beginIndex: number, length: number) {
  let mapList;
  if (beginIndex === 0 && length === 0) {
    mapList = JSON.parse(JSON.stringify(OioIconJson.glyphs));
  } else {
    mapList = JSON.parse(JSON.stringify(OioIconJson.glyphs)).splice(beginIndex, length);
  }
  for (const map of mapList) {
    map.font_class = OioIconJson.css_prefix_text + map.font_class;
  }
  return mapList;
}

/**
 * 仅含有完整icon的字符串数组, 参数都为0时代表取所有
 * @param beginIndex 开始索引 >=0
 * @param length 需要的条数  >=0
 */
export function getOioIconList(beginIndex: number, length: number) {
  const list = [] as string[];
  for (const glyph of getOioIconMapList(beginIndex, length)) {
    list.push(glyph.font_class);
  }
  return list;
}

/**
 * 数据来源:https://www.iconfont.cn/
 * oio项目
 */
export const OioIconJson = {
  id: '2657071',
  name: 'oinone',
  font_family: 'iconfont',
  css_prefix_text: 'oinone-',
  description: '',
  glyphs: [
    {
      icon_id: '29769491',
      name: '菜单展开',
      font_class: 'menu-caidanzhankai',
      unicode: 'e7a8',
      unicode_decimal: 59304
    },
    {
      icon_id: '29769492',
      name: '菜单收起',
      font_class: 'menu-caidanshouqi',
      unicode: 'e7a9',
      unicode_decimal: 59305
    },
    {
      icon_id: '29769276',
      name: '菜单默认',
      font_class: 'menu-caidanmoren',
      unicode: 'e7a6',
      unicode_decimal: 59302
    },
    {
      icon_id: '29769277',
      name: '菜单下拉',
      font_class: 'menu-caidanxiala',
      unicode: 'e7a7',
      unicode_decimal: 59303
    },
    {
      icon_id: '8610644',
      name: '标准代码',
      font_class: 'diwuyiti',
      unicode: 'e655',
      unicode_decimal: 58965
    },
    {
      icon_id: '10885625',
      name: '多媒体',
      font_class: 'duomeiti',
      unicode: 'e619',
      unicode_decimal: 58905
    },
    {
      icon_id: '5484528',
      name: '超链接',
      font_class: 'chaolianjie',
      unicode: 'e60f',
      unicode_decimal: 58895
    },
    {
      icon_id: '16413615',
      name: 'iframe-braces',
      font_class: 'iframe',
      unicode: 'ea0b',
      unicode_decimal: 59915
    },
    {
      icon_id: '29371938',
      name: '清除',
      font_class: 'qingchu',
      unicode: 'e7a5',
      unicode_decimal: 59301
    },
    {
      icon_id: '29192152',
      name: '视频',
      font_class: 'shipin2',
      unicode: 'e7a4',
      unicode_decimal: 59300
    },
    {
      icon_id: '29192149',
      name: '文档',
      font_class: 'wendang',
      unicode: 'e7a3',
      unicode_decimal: 59299
    },
    {
      icon_id: '29174412',
      name: '收藏',
      font_class: 'shoucang',
      unicode: 'e7a1',
      unicode_decimal: 59297
    },
    {
      icon_id: '29174413',
      name: '未收藏',
      font_class: 'weishoucang',
      unicode: 'e7a2',
      unicode_decimal: 59298
    },
    {
      icon_id: '17531980',
      name: 'bpstudio-云架构设计工具',
      font_class: 'jiagou',
      unicode: 'e7a0',
      unicode_decimal: 59296
    },
    {
      icon_id: '29152663',
      name: '更多',
      font_class: 'gengduo2',
      unicode: 'e79c',
      unicode_decimal: 59292
    },
    {
      icon_id: '29152664',
      name: '应用分类',
      font_class: 'yingyongfenlei',
      unicode: 'e79d',
      unicode_decimal: 59293
    },
    {
      icon_id: '29152665',
      name: '设计页面',
      font_class: 'shejiyemian',
      unicode: 'e79e',
      unicode_decimal: 59294
    },
    {
      icon_id: '29152666',
      name: '设计模型',
      font_class: 'shejimoxing',
      unicode: 'e79f',
      unicode_decimal: 59295
    },
    {
      icon_id: '29147970',
      name: '常用',
      font_class: 'changyong',
      unicode: 'e6cc',
      unicode_decimal: 59084
    },
    {
      icon_id: '29115601',
      name: '表单',
      font_class: 'biaodan',
      unicode: 'e79a',
      unicode_decimal: 59290
    },
    {
      icon_id: '29115603',
      name: '表格',
      font_class: 'biaoge',
      unicode: 'e79b',
      unicode_decimal: 59291
    },
    {
      icon_id: '29081086',
      name: '重置筛选',
      font_class: 'zhongzhishaixuan',
      unicode: 'e799',
      unicode_decimal: 59289
    },
    {
      icon_id: '29066380',
      name: '系统通知',
      font_class: 'xitongtongzhi',
      unicode: 'e798',
      unicode_decimal: 59288
    },
    {
      icon_id: '16805335',
      name: '归位',
      font_class: 'guiwei',
      unicode: 'e797',
      unicode_decimal: 59287
    },
    {
      icon_id: '29013549',
      name: '生成',
      font_class: 'shengcheng',
      unicode: 'e794',
      unicode_decimal: 59284
    },
    {
      icon_id: '29013550',
      name: '上传',
      font_class: 'shangchuan2',
      unicode: 'e795',
      unicode_decimal: 59285
    },
    {
      icon_id: '29013552',
      name: '下载',
      font_class: 'xiazai',
      unicode: 'e796',
      unicode_decimal: 59286
    },
    {
      icon_id: '28996410',
      name: '重置',
      font_class: 'zhongzhi1',
      unicode: 'e6c7',
      unicode_decimal: 59079
    },
    {
      icon_id: '28985057',
      name: '界面设计',
      font_class: 'jiemiansheji1',
      unicode: 'e722',
      unicode_decimal: 59170
    },
    {
      icon_id: '28969042',
      name: '选择',
      font_class: 'xuanze',
      unicode: 'e793',
      unicode_decimal: 59283
    },
    {
      icon_id: '28967018',
      name: '历史版本',
      font_class: 'lishibanben',
      unicode: 'e792',
      unicode_decimal: 59282
    },
    {
      icon_id: '28966335',
      name: '最大化',
      font_class: 'zuidahua',
      unicode: 'e790',
      unicode_decimal: 59280
    },
    {
      icon_id: '28966336',
      name: '最小化',
      font_class: 'zuixiaohua',
      unicode: 'e791',
      unicode_decimal: 59281
    },
    {
      icon_id: '28902559',
      name: '隐藏',
      font_class: 'yincang',
      unicode: 'e78f',
      unicode_decimal: 59279
    },
    {
      icon_id: '28893988',
      name: '段落',
      font_class: 'paragraph',
      unicode: 'e78e',
      unicode_decimal: 59278
    },
    {
      icon_id: '28864102',
      name: '上传',
      font_class: 'shangchuan1',
      unicode: 'e78b',
      unicode_decimal: 59275
    },
    {
      icon_id: '28864103',
      name: '下载',
      font_class: 'xiazai1',
      unicode: 'e78c',
      unicode_decimal: 59276
    },
    {
      icon_id: '28864104',
      name: '生成',
      font_class: 'shengcheng2',
      unicode: 'e78d',
      unicode_decimal: 59277
    },
    {
      icon_id: '28814942',
      name: '报表',
      font_class: 'baobiao',
      unicode: 'e789',
      unicode_decimal: 59273
    },
    {
      icon_id: '28814943',
      name: '图表',
      font_class: 'tubiao',
      unicode: 'e78a',
      unicode_decimal: 59274
    },
    {
      icon_id: '28810359',
      name: '返回',
      font_class: 'fanhui',
      unicode: 'e6bf',
      unicode_decimal: 59071
    },
    {
      icon_id: '630083',
      name: '下拉',
      font_class: 'xiala',
      unicode: 'e65f',
      unicode_decimal: 58975
    },
    {
      icon_id: '28485932',
      name: '问号',
      font_class: 'wenhao',
      unicode: 'e788',
      unicode_decimal: 59272
    },
    {
      icon_id: '28429506',
      name: '大纲',
      font_class: 'shejidagang',
      unicode: 'e787',
      unicode_decimal: 59271
    },
    {
      icon_id: '28413142',
      name: '添加',
      font_class: 'xingzhuang4',
      unicode: 'e6bd',
      unicode_decimal: 59069
    },
    {
      icon_id: '28413140',
      name: '设置',
      font_class: 'shezhi1',
      unicode: 'e6bc',
      unicode_decimal: 59068
    },
    {
      icon_id: '28413114',
      name: '删除',
      font_class: 'a-ShapeCopy3beifen',
      unicode: 'e6bb',
      unicode_decimal: 59067
    },
    {
      icon_id: '28413105',
      name: '编辑',
      font_class: 'xingzhuang3',
      unicode: 'e6ba',
      unicode_decimal: 59066
    },
    {
      icon_id: '28413052',
      name: '替换',
      font_class: 'tihuan',
      unicode: 'e6b9',
      unicode_decimal: 59065
    },
    {
      icon_id: '28342435',
      name: '视频',
      font_class: 'shipin1',
      unicode: 'e6b7',
      unicode_decimal: 59063
    },
    {
      icon_id: '28342295',
      name: '图片',
      font_class: 'shangchuantupian',
      unicode: 'e6b2',
      unicode_decimal: 59058
    },
    {
      icon_id: '28342276',
      name: '轮播图',
      font_class: 'lunbotu1',
      unicode: 'e6b1',
      unicode_decimal: 59057
    },
    {
      icon_id: '28308321',
      name: 'dictionary',
      font_class: 'dictionary',
      unicode: 'e74f',
      unicode_decimal: 59215
    },
    {
      icon_id: '28308322',
      name: 'text',
      font_class: 'text',
      unicode: 'e784',
      unicode_decimal: 59268
    },
    {
      icon_id: '28308323',
      name: 'time',
      font_class: 'time',
      unicode: 'e785',
      unicode_decimal: 59269
    },
    {
      icon_id: '28308324',
      name: 'year',
      font_class: 'year',
      unicode: 'e786',
      unicode_decimal: 59270
    },
    {
      icon_id: '28300081',
      name: '页面设计器',
      font_class: 'yemianshejiqi',
      unicode: 'e783',
      unicode_decimal: 59267
    },
    {
      icon_id: '28247810',
      name: 'richtext',
      font_class: 'richtext',
      unicode: 'e782',
      unicode_decimal: 59266
    },
    {
      icon_id: '28078908',
      name: '拖拽',
      font_class: 'tuozhuai',
      unicode: 'e6aa',
      unicode_decimal: 59050
    },
    {
      icon_id: '27968069',
      name: '进入控制台',
      font_class: 'jinrukongzhitai',
      unicode: 'e77d',
      unicode_decimal: 59261
    },
    {
      icon_id: '27968070',
      name: '设置',
      font_class: 'shezhi',
      unicode: 'e77e',
      unicode_decimal: 59262
    },
    {
      icon_id: '27968071',
      name: '卸载',
      font_class: 'xiezai',
      unicode: 'e77f',
      unicode_decimal: 59263
    },
    {
      icon_id: '27968072',
      name: '升级',
      font_class: 'shengji',
      unicode: 'e780',
      unicode_decimal: 59264
    },
    {
      icon_id: '27968073',
      name: '更换版本',
      font_class: 'genghuanbanben',
      unicode: 'e781',
      unicode_decimal: 59265
    },
    {
      icon_id: '27909301',
      name: '选中',
      font_class: 'lujing',
      unicode: 'e6a9',
      unicode_decimal: 59049
    },
    {
      icon_id: '27909194',
      name: '模板',
      font_class: 'moban',
      unicode: 'e6a8',
      unicode_decimal: 59048
    },
    {
      icon_id: '27852117',
      name: '播放',
      font_class: 'bofang2',
      unicode: 'e6a7',
      unicode_decimal: 59047
    },
    {
      icon_id: '27852042',
      name: '暂停播放',
      font_class: 'zantingbofang',
      unicode: 'e6a6',
      unicode_decimal: 59046
    },
    {
      icon_id: '27836823',
      name: '动态气泡图',
      font_class: 'dynamic-bubble-active',
      unicode: 'e6a5',
      unicode_decimal: 59045
    },
    {
      icon_id: '27836821',
      name: '动态气泡图',
      font_class: 'dynamic-bubble',
      unicode: 'e6a4',
      unicode_decimal: 59044
    },
    {
      icon_id: '27747851',
      name: '更多',
      font_class: 'gengduo1',
      unicode: 'e77b',
      unicode_decimal: 59259
    },
    {
      icon_id: '27929082',
      name: '文本',
      font_class: 'string-copy',
      unicode: 'e77c',
      unicode_decimal: 59260
    },
    {
      icon_id: '27738556',
      name: '文本',
      font_class: 'string',
      unicode: 'e77a',
      unicode_decimal: 59258
    },
    {
      icon_id: '27724812',
      name: '多条形图',
      font_class: 'multi-bar',
      unicode: 'e6a3',
      unicode_decimal: 59043
    },
    {
      icon_id: '27724804',
      name: '多条形图',
      font_class: 'multi-bar-active',
      unicode: 'e6a2',
      unicode_decimal: 59042
    },
    {
      icon_id: '27724799',
      name: '环形图',
      font_class: 'pie-donut-active',
      unicode: 'e6a1',
      unicode_decimal: 59041
    },
    {
      icon_id: '27724794',
      name: '环形图',
      font_class: 'pie-donut',
      unicode: 'e6a0',
      unicode_decimal: 59040
    },
    {
      icon_id: '27724791',
      name: '基础条形图',
      font_class: 'base-bar-active',
      unicode: 'e69f',
      unicode_decimal: 59039
    },
    {
      icon_id: '27724787',
      name: '基础条形图',
      font_class: 'base-bar',
      unicode: 'e69e',
      unicode_decimal: 59038
    },
    {
      icon_id: '27724783',
      name: '气泡图',
      font_class: 'base-bubble',
      unicode: 'e69d',
      unicode_decimal: 59037
    },
    {
      icon_id: '27724778',
      name: '气泡图',
      font_class: 'base-bubble-active',
      unicode: 'e69c',
      unicode_decimal: 59036
    },
    {
      icon_id: '27724772',
      name: '散点图',
      font_class: 'scatter-series-active',
      unicode: 'e69b',
      unicode_decimal: 59035
    },
    {
      icon_id: '27724763',
      name: '散点图',
      font_class: 'scatter-series',
      unicode: 'e69a',
      unicode_decimal: 59034
    },
    {
      icon_id: '27724760',
      name: '双Y轴折线图',
      font_class: 'double-y-line-active',
      unicode: 'e699',
      unicode_decimal: 59033
    },
    {
      icon_id: '27724758',
      name: '双Y轴折线图',
      font_class: 'double-y-line',
      unicode: 'e698',
      unicode_decimal: 59032
    },
    {
      icon_id: '27724756',
      name: '中国地图',
      font_class: 'map-china',
      unicode: 'e697',
      unicode_decimal: 59031
    },
    {
      icon_id: '27724753',
      name: '中国地图',
      font_class: 'map-china-active',
      unicode: 'e696',
      unicode_decimal: 59030
    },
    {
      icon_id: '27724749',
      name: '指标统计图',
      font_class: 'base-exponent-active',
      unicode: 'e695',
      unicode_decimal: 59029
    },
    {
      icon_id: '27724747',
      name: '指标统计图',
      font_class: 'base-exponent',
      unicode: 'e694',
      unicode_decimal: 59028
    },
    {
      icon_id: '27724736',
      name: '仪表盘',
      font_class: 'base-gauge',
      unicode: 'e693',
      unicode_decimal: 59027
    },
    {
      icon_id: '27724730',
      name: '仪表盘',
      font_class: 'base-gauge-active',
      unicode: 'e692',
      unicode_decimal: 59026
    },
    {
      icon_id: '27724729',
      name: '双Y轴柱状图',
      font_class: 'double-y-column',
      unicode: 'e691',
      unicode_decimal: 59025
    },
    {
      icon_id: '27724723',
      name: '双Y轴柱状图',
      font_class: 'double-y-column-active',
      unicode: 'e690',
      unicode_decimal: 59024
    },
    {
      icon_id: '27724112',
      name: '倒计时',
      font_class: 'daojishi',
      unicode: 'e68e',
      unicode_decimal: 59022
    },
    {
      icon_id: '27724098',
      name: '轮播图',
      font_class: 'lunbotu',
      unicode: 'e68c',
      unicode_decimal: 59020
    },
    {
      icon_id: '27724095',
      name: '全屏',
      font_class: 'quanping',
      unicode: 'e68b',
      unicode_decimal: 59019
    },
    {
      icon_id: '27724082',
      name: '上传',
      font_class: 'shangchuan',
      unicode: 'e68a',
      unicode_decimal: 59018
    },
    {
      icon_id: '27724081',
      name: '时间器',
      font_class: 'shijianqi',
      unicode: 'e689',
      unicode_decimal: 59017
    },
    {
      icon_id: '27724079',
      name: '视频',
      font_class: 'shipin',
      unicode: 'e688',
      unicode_decimal: 59016
    },
    {
      icon_id: '27724076',
      name: '通用标题',
      font_class: 'tongyongbiaoti',
      unicode: 'e686',
      unicode_decimal: 59014
    },
    {
      icon_id: '27724070',
      name: '图片',
      font_class: 'tupian',
      unicode: 'e685',
      unicode_decimal: 59013
    },
    {
      icon_id: '27701681',
      name: '添加数据大屏',
      font_class: 'shujudaping',
      unicode: 'e684',
      unicode_decimal: 59012
    },
    {
      icon_id: '27691893',
      name: '编辑',
      font_class: 'bianji1',
      unicode: 'e682',
      unicode_decimal: 59010
    },
    {
      icon_id: '27682922',
      name: '收起',
      font_class: 'shouqi2',
      unicode: 'e681',
      unicode_decimal: 59009
    },
    {
      icon_id: '27682916',
      name: '展开',
      font_class: 'zhankai3',
      unicode: 'e680',
      unicode_decimal: 59008
    },
    {
      icon_id: '27622414',
      name: '注意',
      font_class: 'zhuyi',
      unicode: 'e67f',
      unicode_decimal: 59007
    },
    {
      icon_id: '27530737',
      name: '图钉',
      font_class: 'tuding',
      unicode: 'e779',
      unicode_decimal: 59257
    },
    {
      icon_id: '27499076',
      name: '展开',
      font_class: 'zhankai2',
      unicode: 'e778',
      unicode_decimal: 59256
    },
    {
      icon_id: '27337465',
      name: '取消置顶',
      font_class: 'topping',
      unicode: 'e67a',
      unicode_decimal: 59002
    },
    {
      icon_id: '27180716',
      name: '添加报表',
      font_class: 'report-add',
      unicode: 'e679',
      unicode_decimal: 59001
    },
    {
      icon_id: '27164592',
      name: '复制',
      font_class: 'chart-copy',
      unicode: 'e678',
      unicode_decimal: 59000
    },
    {
      icon_id: '27164588',
      name: '更新',
      font_class: 'chart-refresh',
      unicode: 'e677',
      unicode_decimal: 58999
    },
    {
      icon_id: '27164584',
      name: '添加图表',
      font_class: 'chart-add',
      unicode: 'e676',
      unicode_decimal: 58998
    },
    {
      icon_id: '27164581',
      name: '编辑',
      font_class: 'chart-tree-edit',
      unicode: 'e675',
      unicode_decimal: 58997
    },
    {
      icon_id: '27120292',
      name: '保存',
      font_class: 'chart-save',
      unicode: 'e674',
      unicode_decimal: 58996
    },
    {
      icon_id: '27058556',
      name: '单条折线图',
      font_class: 'base-line-active',
      unicode: 'e672',
      unicode_decimal: 58994
    },
    {
      icon_id: '27058521',
      name: '单条 柱状图',
      font_class: 'base-column-active',
      unicode: 'e671',
      unicode_decimal: 58993
    },
    {
      icon_id: '27048985',
      name: '官网首页',
      font_class: 'guanwangshouye',
      unicode: 'e775',
      unicode_decimal: 59253
    },
    {
      icon_id: '27048940',
      name: '表单页',
      font_class: 'biaodanye1',
      unicode: 'e774',
      unicode_decimal: 59252
    },
    {
      icon_id: '27048942',
      name: '详情页',
      font_class: 'xiangqingye1',
      unicode: 'e776',
      unicode_decimal: 59254
    },
    {
      icon_id: '27048943',
      name: '表格页',
      font_class: 'biaogeye',
      unicode: 'e777',
      unicode_decimal: 59255
    },
    {
      icon_id: '27031218',
      name: '按钮',
      font_class: 'anniu',
      unicode: 'e773',
      unicode_decimal: 59251
    },
    {
      icon_id: '827631',
      name: '个人',
      font_class: 'geren',
      unicode: 'e653',
      unicode_decimal: 58963
    },
    {
      icon_id: '27008020',
      name: '表单页',
      font_class: 'biaodanye',
      unicode: 'e76c',
      unicode_decimal: 59244
    },
    {
      icon_id: '27008021',
      name: '收起',
      font_class: 'shouqi1',
      unicode: 'e76d',
      unicode_decimal: 59245
    },
    {
      icon_id: '27008022',
      name: '结果页',
      font_class: 'jieguoye',
      unicode: 'e76e',
      unicode_decimal: 59246
    },
    {
      icon_id: '27008023',
      name: '列表页',
      font_class: 'liebiaoye',
      unicode: 'e76f',
      unicode_decimal: 59247
    },
    {
      icon_id: '27008024',
      name: '详情页',
      font_class: 'xiangqingye',
      unicode: 'e770',
      unicode_decimal: 59248
    },
    {
      icon_id: '27008025',
      name: '仪表盘',
      font_class: 'yibiaopan',
      unicode: 'e771',
      unicode_decimal: 59249
    },
    {
      icon_id: '27008026',
      name: '异常页',
      font_class: 'yichangye',
      unicode: 'e772',
      unicode_decimal: 59250
    },
    {
      icon_id: '26898443',
      name: '数据可视化',
      font_class: 'shuju',
      unicode: 'e670',
      unicode_decimal: 58992
    },
    {
      icon_id: '26858486',
      name: '面积图',
      font_class: 'base-area-active',
      unicode: 'e66f',
      unicode_decimal: 58991
    },
    {
      icon_id: '26858469',
      name: '多条折线图',
      font_class: 'multi-line-active',
      unicode: 'e66e',
      unicode_decimal: 58990
    },
    {
      icon_id: '26858454',
      name: '表格',
      font_class: 'base-table-active',
      unicode: 'e66d',
      unicode_decimal: 58989
    },
    {
      icon_id: '26858422',
      name: '漏斗图',
      font_class: 'base-funnel-active',
      unicode: 'e66c',
      unicode_decimal: 58988
    },
    {
      icon_id: '26858417',
      name: '饼状图',
      font_class: 'base-pie-active',
      unicode: 'e66b',
      unicode_decimal: 58987
    },
    {
      icon_id: '26858391',
      name: '多条柱状图',
      font_class: 'multi-column-active',
      unicode: 'e66a',
      unicode_decimal: 58986
    },
    {
      icon_id: '26858248',
      name: '未发布',
      font_class: 'weifabu',
      unicode: 'e669',
      unicode_decimal: 58985
    },
    {
      icon_id: '26858152',
      name: '发布成功',
      font_class: 'dingbudankuang-fabuchenggong',
      unicode: 'e668',
      unicode_decimal: 58984
    },
    {
      icon_id: '26858005',
      name: '全部展开',
      font_class: 'zhankaibeifen',
      unicode: 'e667',
      unicode_decimal: 58983
    },
    {
      icon_id: '26857979',
      name: '全部折叠',
      font_class: 'zhankai1',
      unicode: 'e666',
      unicode_decimal: 58982
    },
    {
      icon_id: '26857468',
      name: '设置',
      font_class: 'xingzhuang2',
      unicode: 'e663',
      unicode_decimal: 58979
    },
    {
      icon_id: '26857442',
      name: '删除',
      font_class: 'a-ShapeCopy3',
      unicode: 'e662',
      unicode_decimal: 58978
    },
    {
      icon_id: '26857410',
      name: '编辑',
      font_class: 'xingzhuang1',
      unicode: 'e661',
      unicode_decimal: 58977
    },
    {
      icon_id: '26831900',
      name: '节点动作',
      font_class: 'jiediandongzuo',
      unicode: 'e768',
      unicode_decimal: 59240
    },
    {
      icon_id: '26831901',
      name: '切换列表',
      font_class: 'qiehuanliebiao',
      unicode: 'e769',
      unicode_decimal: 59241
    },
    {
      icon_id: '26831902',
      name: '切换方格列表',
      font_class: 'qiehuanfanggeliebiao',
      unicode: 'e76a',
      unicode_decimal: 59242
    },
    {
      icon_id: '26701976',
      name: '请选择操作',
      font_class: 'qingxuanzecaozuo',
      unicode: 'e767',
      unicode_decimal: 59239
    },
    {
      icon_id: '26555565',
      name: '多条柱状图',
      font_class: 'multi-column',
      unicode: 'e65e',
      unicode_decimal: 58974
    },
    {
      icon_id: '26554922',
      name: '折线图',
      font_class: 'base-line',
      unicode: 'e65d',
      unicode_decimal: 58973
    },
    {
      icon_id: '26554919',
      name: '多条折线图',
      font_class: 'multi-line',
      unicode: 'e65c',
      unicode_decimal: 58972
    },
    {
      icon_id: '26554917',
      name: '表格',
      font_class: 'base-table',
      unicode: 'e65b',
      unicode_decimal: 58971
    },
    {
      icon_id: '26554908',
      name: '面积图',
      font_class: 'base-area',
      unicode: 'e659',
      unicode_decimal: 58969
    },
    {
      icon_id: '26554862',
      name: '漏斗图',
      font_class: 'base-funnel',
      unicode: 'e658',
      unicode_decimal: 58968
    },
    {
      icon_id: '26554858',
      name: '饼状图',
      font_class: 'base-pie',
      unicode: 'e657',
      unicode_decimal: 58967
    },
    {
      icon_id: '26554676',
      name: '柱状图',
      font_class: 'base-column',
      unicode: 'e656',
      unicode_decimal: 58966
    },
    {
      icon_id: '26515136',
      name: '暂停',
      font_class: 'zanting',
      unicode: 'e760',
      unicode_decimal: 59232
    },
    {
      icon_id: '26515137',
      name: '运行',
      font_class: 'yunhang',
      unicode: 'e765',
      unicode_decimal: 59237
    },
    {
      icon_id: '26515138',
      name: '流程',
      font_class: 'liucheng',
      unicode: 'e766',
      unicode_decimal: 59238
    },
    {
      icon_id: '26501294',
      name: '隐藏',
      font_class: 'yincang2',
      unicode: 'e764',
      unicode_decimal: 59236
    },
    {
      icon_id: '26501230',
      name: '分享',
      font_class: 'fenxiang',
      unicode: 'e75b',
      unicode_decimal: 59227
    },
    {
      icon_id: '26501231',
      name: '复制',
      font_class: 'fuzhi',
      unicode: 'e75c',
      unicode_decimal: 59228
    },
    {
      icon_id: '26501232',
      name: '提醒',
      font_class: 'tixing',
      unicode: 'e75d',
      unicode_decimal: 59229
    },
    {
      icon_id: '26501233',
      name: '删除',
      font_class: 'shanchu1',
      unicode: 'e75e',
      unicode_decimal: 59230
    },
    {
      icon_id: '26501234',
      name: '逻辑名称',
      font_class: 'luojimingcheng',
      unicode: 'e75f',
      unicode_decimal: 59231
    },
    {
      icon_id: '26501236',
      name: '显示',
      font_class: 'xianshi',
      unicode: 'e761',
      unicode_decimal: 59233
    },
    {
      icon_id: '26501237',
      name: '已发布',
      font_class: 'yifabu',
      unicode: 'e762',
      unicode_decimal: 59234
    },
    {
      icon_id: '26501238',
      name: '修改',
      font_class: 'xiugai1',
      unicode: 'e763',
      unicode_decimal: 59235
    },
    {
      icon_id: '26471184',
      name: '移除列表项',
      font_class: 'yichuliebiaoxiang',
      unicode: 'e755',
      unicode_decimal: 59221
    },
    {
      icon_id: '26471185',
      name: '新数据',
      font_class: 'xinshuju',
      unicode: 'e756',
      unicode_decimal: 59222
    },
    {
      icon_id: '26471186',
      name: '异常处理',
      font_class: 'yichangchuli',
      unicode: 'e757',
      unicode_decimal: 59223
    },
    {
      icon_id: '26471187',
      name: '循环操作',
      font_class: 'xunhuancaozuo',
      unicode: 'e758',
      unicode_decimal: 59224
    },
    {
      icon_id: '26471188',
      name: '移除键值',
      font_class: 'yichujianzhi',
      unicode: 'e759',
      unicode_decimal: 59225
    },
    {
      icon_id: '26471189',
      name: '数据设置',
      font_class: 'shujushezhi',
      unicode: 'e75a',
      unicode_decimal: 59226
    },
    {
      icon_id: '26471168',
      name: '不作处理',
      font_class: 'buzuochuli',
      unicode: 'e743',
      unicode_decimal: 59203
    },
    {
      icon_id: '26471169',
      name: '发送邮件',
      font_class: 'fasongyoujian',
      unicode: 'e744',
      unicode_decimal: 59204
    },
    {
      icon_id: '26471170',
      name: '发送事件',
      font_class: 'fasongshijian',
      unicode: 'e745',
      unicode_decimal: 59205
    },
    {
      icon_id: '26471171',
      name: '定时任务',
      font_class: 'dingshirenwu',
      unicode: 'e746',
      unicode_decimal: 59206
    },
    {
      icon_id: '26471172',
      name: '发送消息',
      font_class: 'fasongxiaoxi',
      unicode: 'e747',
      unicode_decimal: 59207
    },
    {
      icon_id: '26471173',
      name: '逻辑块',
      font_class: 'luojikuai',
      unicode: 'e748',
      unicode_decimal: 59208
    },
    {
      icon_id: '26471174',
      name: '返回数据',
      font_class: 'fanhuishuju',
      unicode: 'e749',
      unicode_decimal: 59209
    },
    {
      icon_id: '26471175',
      name: '逻辑调用',
      font_class: 'luojidiaoyong',
      unicode: 'e74a',
      unicode_decimal: 59210
    },
    {
      icon_id: '26471176',
      name: '条件操作',
      font_class: 'tiaojiancaozuo',
      unicode: 'e74b',
      unicode_decimal: 59211
    },
    {
      icon_id: '26471177',
      name: '事务处理',
      font_class: 'shiwuchuli',
      unicode: 'e74c',
      unicode_decimal: 59212
    },
    {
      icon_id: '26471178',
      name: '添加键值',
      font_class: 'tianjiajianzhi',
      unicode: 'e74d',
      unicode_decimal: 59213
    },
    {
      icon_id: '26471179',
      name: '添加列表项',
      font_class: 'tianjialiebiaoxiang',
      unicode: 'e750',
      unicode_decimal: 59216
    },
    {
      icon_id: '26471180',
      name: '新键值对',
      font_class: 'xinjianzhidui',
      unicode: 'e751',
      unicode_decimal: 59217
    },
    {
      icon_id: '26471181',
      name: '新列表',
      font_class: 'xinliebiao',
      unicode: 'e752',
      unicode_decimal: 59218
    },
    {
      icon_id: '26471182',
      name: '发送短信',
      font_class: 'fasongduanxin',
      unicode: 'e753',
      unicode_decimal: 59219
    },
    {
      icon_id: '26471183',
      name: '异步处理',
      font_class: 'yibuchuli',
      unicode: 'e754',
      unicode_decimal: 59220
    },
    {
      icon_id: '26101557',
      name: '移动',
      font_class: 'yidong',
      unicode: 'e742',
      unicode_decimal: 59202
    },
    {
      icon_id: '26030136',
      name: '颜色选择器',
      font_class: 'yansexuanzeqi',
      unicode: 'e739',
      unicode_decimal: 59193
    },
    {
      icon_id: '26029648',
      name: '复选框',
      font_class: 'fuxuankuang',
      unicode: 'e73a',
      unicode_decimal: 59194
    },
    {
      icon_id: '26029649',
      name: '选项卡',
      font_class: 'xuanxiangka',
      unicode: 'e73b',
      unicode_decimal: 59195
    },
    {
      icon_id: '26029650',
      name: '图片上传',
      font_class: 'tupianshangchuan',
      unicode: 'e73c',
      unicode_decimal: 59196
    },
    {
      icon_id: '26029651',
      name: '下拉多选',
      font_class: 'xialaduoxuan',
      unicode: 'e73d',
      unicode_decimal: 59197
    },
    {
      icon_id: '26029652',
      name: '标签',
      font_class: 'biaoqian',
      unicode: 'e73e',
      unicode_decimal: 59198
    },
    {
      icon_id: '26029653',
      name: '下拉单选',
      font_class: 'xialadanxuan',
      unicode: 'e73f',
      unicode_decimal: 59199
    },
    {
      icon_id: '26029654',
      name: '提交按钮',
      font_class: 'tijiaoanniu',
      unicode: 'e740',
      unicode_decimal: 59200
    },
    {
      icon_id: '26029655',
      name: '单选框',
      font_class: 'danxuankuang',
      unicode: 'e741',
      unicode_decimal: 59201
    },
    {
      icon_id: '26029640',
      name: '日期时间范围',
      font_class: 'riqishijianfanwei',
      unicode: 'e732',
      unicode_decimal: 59186
    },
    {
      icon_id: '26029641',
      name: '跳转按钮',
      font_class: 'tiaozhuananniu',
      unicode: 'e733',
      unicode_decimal: 59187
    },
    {
      icon_id: '26029642',
      name: '分组',
      font_class: 'fenzu',
      unicode: 'e734',
      unicode_decimal: 59188
    },
    {
      icon_id: '26029643',
      name: '客户端按钮',
      font_class: 'kehuduananniu',
      unicode: 'e735',
      unicode_decimal: 59189
    },
    {
      icon_id: '26029644',
      name: '密码',
      font_class: 'mima',
      unicode: 'e736',
      unicode_decimal: 59190
    },
    {
      icon_id: '26029645',
      name: '文件上传',
      font_class: 'wenjianshangchuan',
      unicode: 'e737',
      unicode_decimal: 59191
    },
    {
      icon_id: '26029646',
      name: '链接按钮',
      font_class: 'lianjieanniu',
      unicode: 'e738',
      unicode_decimal: 59192
    },
    {
      icon_id: '26014095',
      name: '属性设置空页面',
      font_class: 'shuxingshezhikongyemian',
      unicode: 'e731',
      unicode_decimal: 59185
    },
    {
      icon_id: '25932500',
      name: '表单',
      font_class: 'report',
      unicode: 'e63b',
      unicode_decimal: 58939
    },
    {
      icon_id: '25932024',
      name: '图表',
      font_class: 'chart',
      unicode: 'e63a',
      unicode_decimal: 58938
    },
    {
      icon_id: '25932017',
      name: '数据大屏',
      font_class: 'data-dashboard',
      unicode: 'e639',
      unicode_decimal: 58937
    },
    {
      icon_id: '25703881',
      name: '页面设置',
      font_class: 'yemianshezhi',
      unicode: 'e727',
      unicode_decimal: 59175
    },
    {
      icon_id: '25703882',
      name: '国际化',
      font_class: 'guojihua',
      unicode: 'e72e',
      unicode_decimal: 59182
    },
    {
      icon_id: '25703883',
      name: '模型',
      font_class: 'moxing',
      unicode: 'e72f',
      unicode_decimal: 59183
    },
    {
      icon_id: '25703884',
      name: '组件库',
      font_class: 'zujianku',
      unicode: 'e730',
      unicode_decimal: 59184
    },
    {
      icon_id: '25491038',
      name: '返回顶部',
      font_class: 'backtop',
      unicode: 'e729',
      unicode_decimal: 59177
    },
    {
      icon_id: '25491039',
      name: '表模式',
      font_class: 'biaomoshi1',
      unicode: 'e72c',
      unicode_decimal: 59180
    },
    {
      icon_id: '25491040',
      name: '图模式',
      font_class: 'tumoshi1',
      unicode: 'e72d',
      unicode_decimal: 59181
    },
    {
      icon_id: '25490564',
      name: '收缩',
      font_class: 'shousuo',
      unicode: 'e72a',
      unicode_decimal: 59178
    },
    {
      icon_id: '25490565',
      name: '展开',
      font_class: 'zhankai',
      unicode: 'e72b',
      unicode_decimal: 59179
    },
    {
      icon_id: '25355526',
      name: '键对值',
      font_class: 'map',
      unicode: 'e728',
      unicode_decimal: 59176
    },
    {
      icon_id: '25353490',
      name: '数据编码',
      font_class: 'sequence',
      unicode: 'e726',
      unicode_decimal: 59174
    },
    {
      icon_id: '27000716',
      name: '数据编码',
      font_class: 'sequence-copy',
      unicode: 'e76b',
      unicode_decimal: 59243
    },
    {
      icon_id: '25326578',
      name: '二进制',
      font_class: 'binary',
      unicode: 'e637',
      unicode_decimal: 58935
    },
    {
      icon_id: '25325188',
      name: '浮点数',
      font_class: 'float',
      unicode: 'e634',
      unicode_decimal: 58932
    },
    {
      icon_id: '25325174',
      name: '整数',
      font_class: 'integer',
      unicode: 'e633',
      unicode_decimal: 58931
    },
    {
      icon_id: '25316607',
      name: '业务类型',
      font_class: 'ttype',
      unicode: 'e721',
      unicode_decimal: 59169
    },
    {
      icon_id: '6218921',
      name: '字段拼接',
      font_class: 'data-label',
      unicode: 'e6b8',
      unicode_decimal: 59064
    },
    {
      icon_id: '25258366',
      name: '应用分组',
      font_class: 'yingyongfenzu1',
      unicode: 'e723',
      unicode_decimal: 59171
    },
    {
      icon_id: '25258367',
      name: '逻辑设计',
      font_class: 'luojisheji1',
      unicode: 'e724',
      unicode_decimal: 59172
    },
    {
      icon_id: '25258368',
      name: '继承关系',
      font_class: 'jichengguanxi1',
      unicode: 'e725',
      unicode_decimal: 59173
    },
    {
      icon_id: '7896617',
      name: '过滤',
      font_class: 'filter',
      unicode: 'e611',
      unicode_decimal: 58897
    },
    {
      icon_id: '25199742',
      name: '点击',
      font_class: 'dianji',
      unicode: 'e71d',
      unicode_decimal: 59165
    },
    {
      icon_id: '25189234',
      name: '不支持',
      font_class: 'buzhichi',
      unicode: 'e71c',
      unicode_decimal: 59164
    },
    {
      icon_id: '25166522',
      name: '单向关联',
      font_class: 'danxiangguanlian1',
      unicode: 'e71f',
      unicode_decimal: 59167
    },
    {
      icon_id: '25166523',
      name: '双向关联',
      font_class: 'shuangxiangguanlian1',
      unicode: 'e720',
      unicode_decimal: 59168
    },
    {
      icon_id: '25166370',
      name: '支持',
      font_class: 'zhichi',
      unicode: 'e71e',
      unicode_decimal: 59166
    },
    {
      icon_id: '25120075',
      name: '变量',
      font_class: 'variable-x',
      unicode: 'e632',
      unicode_decimal: 58930
    },
    {
      icon_id: '25100672',
      name: '邮箱',
      font_class: 'email',
      unicode: 'e631',
      unicode_decimal: 58929
    },
    {
      icon_id: '25100450',
      name: '手机号',
      font_class: 'phone',
      unicode: 'e62f',
      unicode_decimal: 58927
    },
    {
      icon_id: '24887018',
      name: '新增',
      font_class: 'xinzeng',
      unicode: 'e71a',
      unicode_decimal: 59162
    },
    {
      icon_id: '24887019',
      name: '减少',
      font_class: 'jianshao',
      unicode: 'e71b',
      unicode_decimal: 59163
    },
    {
      icon_id: '24885270',
      name: '放大',
      font_class: 'fangda',
      unicode: 'e717',
      unicode_decimal: 59159
    },
    {
      icon_id: '24885271',
      name: '重置',
      font_class: 'zhongzhi',
      unicode: 'e718',
      unicode_decimal: 59160
    },
    {
      icon_id: '24885272',
      name: '缩小',
      font_class: 'suoxiao',
      unicode: 'e719',
      unicode_decimal: 59161
    },
    {
      icon_id: '24817067',
      name: '展开',
      font_class: 'xingzhuangjiehebeifen',
      unicode: 'e629',
      unicode_decimal: 58921
    },
    {
      icon_id: '24817056',
      name: '折叠',
      font_class: 'xingzhuangjiehe',
      unicode: 'e628',
      unicode_decimal: 58920
    },
    {
      icon_id: '24774683',
      name: 'web应用',
      font_class: 'app-web',
      unicode: 'e627',
      unicode_decimal: 58919
    },
    {
      icon_id: '24774671',
      name: '选择应用模块',
      font_class: 'app-server',
      unicode: 'e626',
      unicode_decimal: 58918
    },
    {
      icon_id: '24738799',
      name: '可见',
      font_class: 'visible-filled',
      unicode: 'e623',
      unicode_decimal: 58915
    },
    {
      icon_id: '24737744',
      name: '金额',
      font_class: 'currency',
      unicode: 'e622',
      unicode_decimal: 58914
    },
    {
      icon_id: '24737731',
      name: '日期',
      font_class: 'date',
      unicode: 'e621',
      unicode_decimal: 58913
    },
    {
      icon_id: '24737712',
      name: '日期时间',
      font_class: 'datetime',
      unicode: 'e61f',
      unicode_decimal: 58911
    },
    {
      icon_id: '24723850',
      name: '键值对',
      font_class: 'map-filled',
      unicode: 'e61d',
      unicode_decimal: 58909
    },
    {
      icon_id: '24651474',
      name: '布尔型',
      font_class: 'boolean',
      unicode: 'e61b',
      unicode_decimal: 58907
    },
    {
      icon_id: '24650361',
      name: '隐藏',
      font_class: 'invisible',
      unicode: 'e618',
      unicode_decimal: 58904
    },
    {
      icon_id: '24650355',
      name: '全部类型',
      font_class: 'all-type',
      unicode: 'e617',
      unicode_decimal: 58903
    },
    {
      icon_id: '24650336',
      name: '可见',
      font_class: 'visible',
      unicode: 'e616',
      unicode_decimal: 58902
    },
    {
      icon_id: '24650333',
      name: '引用',
      font_class: 'reference',
      unicode: 'e615',
      unicode_decimal: 58901
    },
    {
      icon_id: '24650317',
      name: '删除',
      font_class: 'remove',
      unicode: 'e614',
      unicode_decimal: 58900
    },
    {
      icon_id: '24650309',
      name: '隐藏',
      font_class: 'invisible-filled',
      unicode: 'e613',
      unicode_decimal: 58899
    },
    {
      icon_id: '24650259',
      name: '全部',
      font_class: 'checked-all',
      unicode: 'e612',
      unicode_decimal: 58898
    },
    {
      icon_id: '24649692',
      name: '浮点数',
      font_class: 'float-old',
      unicode: 'e607',
      unicode_decimal: 58887
    },
    {
      icon_id: '24649662',
      name: '整数',
      font_class: 'integer-old',
      unicode: 'e606',
      unicode_decimal: 58886
    },
    {
      icon_id: '24649657',
      name: '用户ID',
      font_class: 'ttype-userid',
      unicode: 'e605',
      unicode_decimal: 58885
    },
    {
      icon_id: '24649647',
      name: '修改',
      font_class: 'xingzhuang',
      unicode: 'e604',
      unicode_decimal: 58884
    },
    {
      icon_id: '24546935',
      name: '表模式',
      font_class: 'biaomoshi',
      unicode: 'e70f',
      unicode_decimal: 59151
    },
    {
      icon_id: '24546936',
      name: '抽象模型',
      font_class: 'chouxiangmoxing1',
      unicode: 'e710',
      unicode_decimal: 59152
    },
    {
      icon_id: '24546937',
      name: '传输模型',
      font_class: 'chuanshumoxing1',
      unicode: 'e711',
      unicode_decimal: 59153
    },
    {
      icon_id: '24546938',
      name: '后退',
      font_class: 'houtui',
      unicode: 'e712',
      unicode_decimal: 59154
    },
    {
      icon_id: '24546939',
      name: '存储模型',
      font_class: 'cunchumoxing1',
      unicode: 'e713',
      unicode_decimal: 59155
    },
    {
      icon_id: '24546940',
      name: '前进',
      font_class: 'qianjin',
      unicode: 'e714',
      unicode_decimal: 59156
    },
    {
      icon_id: '24546941',
      name: '图模式',
      font_class: 'tumoshi',
      unicode: 'e715',
      unicode_decimal: 59157
    },
    {
      icon_id: '24546942',
      name: '代理模型',
      font_class: 'dailimoxing1',
      unicode: 'e716',
      unicode_decimal: 59158
    },
    {
      icon_id: '24481857',
      name: '抽象模型',
      font_class: 'chouxiangmoxing',
      unicode: 'e70a',
      unicode_decimal: 59146
    },
    {
      icon_id: '24481858',
      name: '传输模型',
      font_class: 'chuanshumoxing',
      unicode: 'e70b',
      unicode_decimal: 59147
    },
    {
      icon_id: '24481859',
      name: '存储模型',
      font_class: 'cunchumoxing',
      unicode: 'e70c',
      unicode_decimal: 59148
    },
    {
      icon_id: '24481860',
      name: '代理模型',
      font_class: 'dailimoxing',
      unicode: 'e70d',
      unicode_decimal: 59149
    },
    {
      icon_id: '24481861',
      name: '更换模型',
      font_class: 'genghuanmoxing',
      unicode: 'e70e',
      unicode_decimal: 59150
    },
    {
      icon_id: '24453373',
      name: '代码',
      font_class: 'code-mode',
      unicode: 'e705',
      unicode_decimal: 59141
    },
    {
      icon_id: '24453374',
      name: '翻译',
      font_class: 'translate',
      unicode: 'e706',
      unicode_decimal: 59142
    },
    {
      icon_id: '24453375',
      name: '括号',
      font_class: 'circle-bracket',
      unicode: 'e707',
      unicode_decimal: 59143
    },
    {
      icon_id: '24453382',
      name: '函数',
      font_class: 'circle-function',
      unicode: 'e708',
      unicode_decimal: 59144
    },
    {
      icon_id: '24453394',
      name: '增加',
      font_class: 'circle-add',
      unicode: 'e709',
      unicode_decimal: 59145
    },
    {
      icon_id: '13155176',
      name: '信息',
      font_class: 'xinxi',
      unicode: 'e600',
      unicode_decimal: 58880
    },
    {
      icon_id: '7742548',
      name: '错误',
      font_class: 'cuowu',
      unicode: 'e636',
      unicode_decimal: 58934
    },
    {
      icon_id: '18024058',
      name: '外部链接、分享',
      font_class: 'waibulianjiefenxiang',
      unicode: 'e74e',
      unicode_decimal: 59214
    },
    {
      icon_id: '24338424',
      name: '警告 icon',
      font_class: 'a-jinggaoicon',
      unicode: 'e704',
      unicode_decimal: 59140
    },
    {
      icon_id: '24315207',
      name: '垃圾桶',
      font_class: 'filled-delete',
      unicode: 'e703',
      unicode_decimal: 59139
    },
    {
      icon_id: '24315175',
      name: '参数配置',
      font_class: 'filled-param',
      unicode: 'e702',
      unicode_decimal: 59138
    },
    {
      icon_id: '24171377',
      name: '变量',
      font_class: 'variable',
      unicode: 'e701',
      unicode_decimal: 59137
    },
    {
      icon_id: '24056487',
      name: '收起菜单',
      font_class: 'shouqicaidan',
      unicode: 'e6ff',
      unicode_decimal: 59135
    },
    {
      icon_id: '24056488',
      name: '展开菜单',
      font_class: 'zhankaicaidan',
      unicode: 'e700',
      unicode_decimal: 59136
    },
    {
      icon_id: '23997642',
      name: '添加',
      font_class: 'tianjia',
      unicode: 'e6fe',
      unicode_decimal: 59134
    },
    {
      icon_id: '23956818',
      name: '修改',
      font_class: 'xiugai',
      unicode: 'e6fc',
      unicode_decimal: 59132
    },
    {
      icon_id: '23956790',
      name: 'Webhook',
      font_class: 'Webhook',
      unicode: 'e6e8',
      unicode_decimal: 59112
    },
    {
      icon_id: '23956791',
      name: '备注',
      font_class: 'beizhu',
      unicode: 'e6e9',
      unicode_decimal: 59113
    },
    {
      icon_id: '23956792',
      name: '短信',
      font_class: 'duanxin',
      unicode: 'e6ea',
      unicode_decimal: 59114
    },
    {
      icon_id: '23956793',
      name: '结束',
      font_class: 'jieshu',
      unicode: 'e6eb',
      unicode_decimal: 59115
    },
    {
      icon_id: '23956794',
      name: '发布',
      font_class: 'fabu',
      unicode: 'e6ec',
      unicode_decimal: 59116
    },
    {
      icon_id: '23956795',
      name: '更新数据',
      font_class: 'gengxinshuju',
      unicode: 'e6ed',
      unicode_decimal: 59117
    },
    {
      icon_id: '23956796',
      name: '更新流程参数',
      font_class: 'gengxinliuchengcanshu',
      unicode: 'e6ee',
      unicode_decimal: 59118
    },
    {
      icon_id: '23956797',
      name: '触发',
      font_class: 'chufa',
      unicode: 'e6ef',
      unicode_decimal: 59119
    },
    {
      icon_id: '23956798',
      name: '获取数据',
      font_class: 'huoqushuju',
      unicode: 'e6f0',
      unicode_decimal: 59120
    },
    {
      icon_id: '23956799',
      name: '删除数据',
      font_class: 'shanchushuju',
      unicode: 'e6f1',
      unicode_decimal: 59121
    },
    {
      icon_id: '23956800',
      name: '收起',
      font_class: 'shouqi',
      unicode: 'e6f2',
      unicode_decimal: 59122
    },
    {
      icon_id: '23956801',
      name: '审批分支',
      font_class: 'shenpifenzhi',
      unicode: 'e6f3',
      unicode_decimal: 59123
    },
    {
      icon_id: '23956802',
      name: '条件分支',
      font_class: 'tiaojianfenzhi',
      unicode: 'e6f4',
      unicode_decimal: 59124
    },
    {
      icon_id: '23956803',
      name: '新增数据',
      font_class: 'xinzengshuju',
      unicode: 'e6f5',
      unicode_decimal: 59125
    },
    {
      icon_id: '23956804',
      name: '填写',
      font_class: 'tianxie',
      unicode: 'e6f6',
      unicode_decimal: 59126
    },
    {
      icon_id: '23956805',
      name: '审批',
      font_class: 'shenpi',
      unicode: 'e6f7',
      unicode_decimal: 59127
    },
    {
      icon_id: '23956806',
      name: '子流程',
      font_class: 'ziliucheng',
      unicode: 'e6f8',
      unicode_decimal: 59128
    },
    {
      icon_id: '23956807',
      name: '延时',
      font_class: 'yanshi',
      unicode: 'e6f9',
      unicode_decimal: 59129
    },
    {
      icon_id: '23956808',
      name: '站内信',
      font_class: 'zhanneixin',
      unicode: 'e6fa',
      unicode_decimal: 59130
    },
    {
      icon_id: '23956809',
      name: '邮件',
      font_class: 'youjian',
      unicode: 'e6fb',
      unicode_decimal: 59131
    },
    {
      icon_id: '23956811',
      name: '引用逻辑',
      font_class: 'yinyongluoji',
      unicode: 'e6fd',
      unicode_decimal: 59133
    },
    {
      icon_id: '23659365',
      name: '多对一',
      font_class: 'duoduiyi',
      unicode: 'e6e4',
      unicode_decimal: 59108
    },
    {
      icon_id: '23659366',
      name: '一对一',
      font_class: 'yiduiyi',
      unicode: 'e6e5',
      unicode_decimal: 59109
    },
    {
      icon_id: '23659367',
      name: '多对多',
      font_class: 'duoduiduo',
      unicode: 'e6e6',
      unicode_decimal: 59110
    },
    {
      icon_id: '23659368',
      name: '一对多',
      font_class: 'yiduiduo',
      unicode: 'e6e7',
      unicode_decimal: 59111
    },
    {
      icon_id: '23573773',
      name: '关闭',
      font_class: 'guanbi1',
      unicode: 'e6e2',
      unicode_decimal: 59106
    },
    {
      icon_id: '23572149',
      name: '关闭',
      font_class: 'guanbi',
      unicode: 'e6e1',
      unicode_decimal: 59105
    },
    {
      icon_id: '23457241',
      name: '导入模型',
      font_class: 'daorumoxing1',
      unicode: 'e6d5',
      unicode_decimal: 59093
    },
    {
      icon_id: '23457242',
      name: '搜索',
      font_class: 'sousuo',
      unicode: 'e6d6',
      unicode_decimal: 59094
    },
    {
      icon_id: '23457244',
      name: '管理模式',
      font_class: 'guanlimoshi',
      unicode: 'e6d8',
      unicode_decimal: 59096
    },
    {
      icon_id: '23457246',
      name: '编辑',
      font_class: 'bianji',
      unicode: 'e6da',
      unicode_decimal: 59098
    },
    {
      icon_id: '23457247',
      name: '查看',
      font_class: 'chakan',
      unicode: 'e6db',
      unicode_decimal: 59099
    },
    {
      icon_id: '23457249',
      name: '更多',
      font_class: 'gengduo',
      unicode: 'e6dd',
      unicode_decimal: 59101
    },
    {
      icon_id: '23457252',
      name: '应用分组',
      font_class: 'yingyongfenzu',
      unicode: 'e6e0',
      unicode_decimal: 59104
    },
    {
      icon_id: '22720786',
      name: '删除',
      font_class: 'shanchu',
      unicode: 'e6d1',
      unicode_decimal: 59089
    },
    {
      icon_id: '22720787',
      name: '添加模型',
      font_class: 'tianjiamoxing',
      unicode: 'e6d2',
      unicode_decimal: 59090
    },
    {
      icon_id: '22720788',
      name: '导入模型',
      font_class: 'daorumoxing',
      unicode: 'e6d3',
      unicode_decimal: 59091
    },
    {
      icon_id: '22720789',
      name: '控件',
      font_class: 'kongjian',
      unicode: 'e6d4',
      unicode_decimal: 59092
    }
  ]
};

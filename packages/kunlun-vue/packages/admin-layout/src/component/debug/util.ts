interface ILoadScriptOption {
  // 给 script 标签设置 id（避免重复加载）
  id?: string;
  // 是否异步加载
  async?: boolean;
  // CORS 设置，如 'anonymous'
  crossorigin?: string
}

/**
 * 动态加载一个外部 JavaScript 脚本
 * @param {string} src - 脚本的 URL
 * @param {Object} [options] - 可选配置
 * @param {string} [options.id] - 给 script 标签设置 id（避免重复加载）
 * @param {boolean} [options.async=true] - 是否异步加载
 * @param {string} [options.crossorigin] - CORS 设置，如 'anonymous'
 * @returns {Promise<void>} 加载成功则 resolve，失败则 reject
 */
export function loadScript(src: string, options: string | ILoadScriptOption = {}) {
  // 防止重复加载（如果指定了 id 或相同 src 已存在）
  if (typeof options === 'string') {
    options = { id: options } as ILoadScriptOption;
  }
  if (!options) {
    options = {} as ILoadScriptOption
  }
  if (options.id && document.getElementById(options.id)) {
    return Promise.resolve();
  }
  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript && existingScript.hasAttribute('data-loaded')) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = options.async !== undefined ? options.async : true;

    if (options.id) {
      script.id = options.id;
    }
    if (options.crossorigin) {
      script.crossOrigin = options.crossorigin;
    }

    // 标记已加载（用于防重）
    script.setAttribute('data-loaded', 'true');

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });
}

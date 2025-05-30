function parseCurrentUrlParams(): any {
  const urlObj = new URL(window.location.href);
  const searchParams = Object.fromEntries(urlObj.searchParams.entries());

  const semicolonParams = urlObj.pathname
    .split(';')
    .slice(1)
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = value;
      return params;
    }, {});

  return { ...searchParams, ...semicolonParams };
}

function buildNewUrl(params) {
  const urlObj = new URL(window.location.href);
  const basePath = urlObj.origin + urlObj.pathname.split(';')[0]; // 保留原始路径，不包括分号参数

  const semicolonParams = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join(';');
  const newUrl = `${basePath};${semicolonParams}`;

  return newUrl;
}

function redirectToNewUrl(newParams) {
  const newUrl = buildNewUrl(newParams);
  window.location.href = newUrl;
}

let active = false;
export const setActive = (value: boolean) => {
  active = value;
};

export function createOwnSignComponent() {
  if (!active) {
    active = true;
  } else {
    return;
  }
  const ownSign = parseCurrentUrlParams().ownSign || localStorage.getItem('ownSign') || '';
  const styleObject = {
    position: 'fixed',
    height: 'min-content',
    left: '70%',
    top: '24px',
    transform: 'translate(-50%, -50%)',
    cursor: 'move',
    padding: '2px 4px',
    borderRadius: '2px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: '9999',
    userSelect: 'none',
    transition: 'box-shadow 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  };

  const applyStyles = () => {
    for (const [key, value] of Object.entries(styleObject)) {
      ownSignElement.style[key] = value;
    }
  };

  let offsetX;
  let offsetY;

  const ownSignElement = document.createElement('div');
  ownSignElement.className = 'own-sign-draggable';
  applyStyles();

  const startDrag = (e) => {
    e.preventDefault();
    const rect = ownSignElement.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
  };

  const drag = (e) => {
    styleObject.left = `${e.clientX - offsetX}px`;
    styleObject.top = `${e.clientY - offsetY}px`;
    applyStyles();
  };

  const stopDrag = () => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
  };

  const removeSign = () => {
    localStorage.removeItem('ownSign');
    ownSignElement.remove();
    const params = parseCurrentUrlParams();
    delete params.ownSign;
    redirectToNewUrl(params);
  };
  if (ownSign === 'null') {
    removeSign();
    return;
  }
  if (ownSign) {
    localStorage.setItem('ownSign', ownSign);
    applyStyles();

    ownSignElement.addEventListener('mouseover', () => {
      ownSignElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    });

    ownSignElement.addEventListener('mouseout', () => {
      ownSignElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    });

    const strongElement = document.createElement('strong');
    strongElement.textContent = 'ownSign:';
    ownSignElement.appendChild(strongElement);

    const textNode = document.createTextNode(` ${ownSign}`);
    ownSignElement.appendChild(textNode);

    const buttonElement = document.createElement('button');
    buttonElement.className = 'own-sign-delete-btn';
    buttonElement.textContent = '✖';
    buttonElement.style.background = 'transparent';
    buttonElement.style.border = 'none';
    buttonElement.style.cursor = 'pointer';
    buttonElement.addEventListener('click', removeSign);
    ownSignElement.appendChild(buttonElement);

    ownSignElement.addEventListener('mousedown', startDrag);

    document.body.appendChild(ownSignElement);
  }
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type FetchInput = string | { url: string };

interface FetchInit {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: 'include' | 'omit' | 'same-origin';
}

interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}

function createFetchResponse(url: string, status: number, statusText: string, responseText: string): FetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    url,
    text: () => Promise.resolve(responseText),
    json: () => Promise.resolve(JSON.parse(responseText))
  };
}

async function jestFetch(input: FetchInput, init?: FetchInit): Promise<FetchResponse> {
  const url = typeof input === 'string' ? input : input.url;
  const method = init?.method || 'GET';
  const headers = init?.headers || {};
  const body = init?.body;
  const credentials = init?.credentials;

  return new Promise<FetchResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    if (credentials === 'include') {
      xhr.withCredentials = true;
    }

    Object.keys(headers).forEach((key) => {
      xhr.setRequestHeader(key, headers[key]);
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 0) {
          reject(new TypeError('Network request failed'));
          return;
        }
        const response = createFetchResponse(url, xhr.status, xhr.statusText, xhr.responseText || '');
        resolve(response);
      }
    };

    xhr.onerror = () => {
      reject(new TypeError('Network request failed'));
    };

    xhr.ontimeout = () => {
      reject(new TypeError('Network request failed'));
    };

    if (body != null) {
      xhr.send(body);
    } else {
      xhr.send();
    }
  });
}

if (typeof (globalThis as any).fetch === 'undefined') {
  (globalThis as any).fetch = jestFetch;
}

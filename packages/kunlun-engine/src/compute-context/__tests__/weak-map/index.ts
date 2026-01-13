const wm = new WeakMap();
wm.set({}, 'var1');

const container: { key: object | undefined } = {
  key: { a: 1 }
};
wm.set(container.key!, 'var2');

const fn = () => {
  console.log('runner1');
};

function init(s) {
  const fn = () => {
    console.log('runner2');
  };
  register(fn, {
    name: s,
    fn: () => {
      fn();
    }
  });
}

function register(fn, s) {
  wm.set(fn, s);
}

// init('var3');
// init('var4');
register(fn, 'var5');
register(fn, 'var6');

console.log('init', wm);

export function removeReference() {
  container.key = undefined;
}

let counter = 0;

let t = setInterval(() => {
  console.log(counter, wm);
  if (counter === 3) {
    removeReference();
    console.log('removeReference');
  }
  if (counter >= 10) {
    clearInterval(t);
    console.log('clearInterval');
  }
  counter++;
}, 3000);

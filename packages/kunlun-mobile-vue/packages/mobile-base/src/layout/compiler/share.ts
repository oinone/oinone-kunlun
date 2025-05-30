import { ignorePatchProps } from './typing';

function filterProps(props) {
  const newProps = {};
  Object.keys(props).forEach((k) => {
    if (!ignorePatchProps.includes(k)) {
      newProps[k] = props[k];
    }
  });

  return newProps;
}

function isFalsy(value) {
  return value === false;
}

export { filterProps, isFalsy };

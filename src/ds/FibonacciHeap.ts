import { type Maybe, none, some } from '@/utils/Maybe';

type FibonacciTree<T> = {
  value: T;
  weight: number;
  child: FibonacciTree<T>[];
  order: number;
  addAtEnd: (t: FibonacciTree<T>) => void;
};

function ldexp(mantissa: number, exponent: number): number {
  const steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
  let result = mantissa;
  for (let i = 0; i < steps; i++)
    result *= Math.pow(2, Math.floor((exponent + i) / steps));
  return result;
}

function frexp(value: number): [number, number] {
  if (value === 0) return [value, 0];
  const data = new DataView(new ArrayBuffer(8));
  data.setFloat64(0, value);
  let bits = (data.getUint32(0) >>> 20) & 0x7ff;
  if (bits === 0) {
    // denormal
    data.setFloat64(0, value * Math.pow(2, 64)); // exp + 64
    bits = ((data.getUint32(0) >>> 20) & 0x7ff) - 64;
  }
  const exponent = bits - 1022;
  const mantissa = ldexp(value, -exponent);
  return [mantissa, exponent];
}

function floorLog(x: number): number {
  return frexp(x)[1] - 1;
}

function fibonacciTree<T>(weight: number, value: T): FibonacciTree<T> {
  let order = 0;
  const child: FibonacciTree<T>[] = [];

  return {
    value,
    child,
    weight,
    order,
    addAtEnd(t) {
      child.push(t);
      order++;
    }
  };
}

export function fibonacciHeap<T>() {
  let trees: FibonacciTree<T>[] = [];
  let least: Maybe<FibonacciTree<T>> = none();
  let count = 0;

  function insertNode(weight: number, value: T) {
    const newTree = fibonacciTree(weight, value);
    trees.push(newTree);
    if (least.map(tree => weight < tree.weight).getOrElse(() => true)) {
      least = some(newTree);
    }
    count++;
  }

  function min(): Maybe<T> {
    return least.map(tree => tree.value);
  }

  function extractMin(): Maybe<T> {
    if (least.isNone()) return none();
    const smallest = least.get();

    for (const child of smallest.child) {
      trees.push(child);
    }
    trees = trees.filter(t => t !== smallest);
    if (trees.length === 0) {
      least = none();
    } else {
      least = some(trees[0]!);
      consolidate();
    }
    count--;
    return some(smallest.value);
  }

  function consolidate() {
    const aux = new Array(floorLog(count) + 1).fill(null);

    while (trees.length > 0) {
      let x = trees[0]!;
      let order = x.order;
      trees.shift();
      while (aux[order] !== null) {
        let y = aux[order];
        if (x.weight > y.weight) {
          [x, y] = [y, x];
        }
        x.addAtEnd(y);
        aux[order] = null;
        order++;
      }
      aux[order] = x;
    }

    least = none();
    for (const k of aux) {
      if (k !== null) {
        trees.push(k);
        if (least.map(tree => k.weight < tree.weight).getOrElse(() => true)) {
          least = some(k);
        }
      }
    }
  }

  return {
    insertNode,
    min,
    extractMin,
    size: () => count,
    isEmpty: () => count === 0,
    isNotEmpty: () => count !== 0
  };
}

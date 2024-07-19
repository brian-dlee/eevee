export type V<T> = { value: T; name: string; secret: boolean };
export type VT<T> = (v: V<string | undefined>) => V<T>;
export type VRaw = V<string | undefined>;

export type BasicReader = Record<string, string | undefined>;

export interface Eevee {
  <T>(name: string, transform: VT<T>): T;
  (name: string): string | undefined;
}

export interface Reader {
  (name: string): V<string | undefined>;
}

export function ev(r: Reader | BasicReader, name: string): string | undefined;
export function ev<T>(r: Reader | BasicReader, name: string, t?: VT<T>): T;
export function ev<T>(r: Reader | BasicReader, name: string, t?: VT<T>): T | undefined {
  let v: V<string | undefined>
  if (typeof r === 'function') {
    v = r(name);
  } else {
    v = {
      value: r[name],
      name,
      secret: false,
    }
  }

  if (t) {
    return t(v).value;
  }

  return v.value as T | undefined;
};



export function bind(r: Reader, applier?: <T>(t: VT<T>) => VT<T>): Eevee {
  return <T>(name: string, transform?: VT<T>) => {
    if (applier && transform) {
      return ev(r, name, applier(transform));
    } else if (transform) {
      return ev(r, name, transform);
    } else {
      return ev(r, name);
    }
  };
}

export function must(v: VRaw): V<string> {
  if (!v.value) {
    throw new Error(`${v.name} is not defined`);
  }
  return {
    value: v.value,
    name: v.name,
    secret: v.secret,
  };
}

export function asISODate(v: V<string>): V<Date> {
  const date = new Date(v.value);
  if (date.toISOString() !== v.value) {
    throw new Error(`${v.name} is not a valid date`);
  }
  return {
    value: date,
    name: v.name,
    secret: v.secret,
  };
}

export function asDuration(v: VRaw, defaultValue = 0): V<number> {
  if (v.value === undefined) {
    return {
      value: defaultValue,
      name: v.name,
      secret: v.secret,
    };
  }

  const match = v.value?.match(/(\d+[smhDMY])+/);
  if (!match) {
    throw new Error(`${v.name} is not a valid duration`);
  }

  let duration = 0;
  for (const part of match.slice(1)) {
    const value = Number(part.slice(0, -1));
    const unit = part[-1];

    switch (unit) {
      case 's':
        duration += value * 1000;
        break;
      case 'm':
        duration += value * 60 * 1000;
        break;
      case 'h':
        duration += value * 60 * 60 * 1000;
        break;
      case 'D':
        duration += value * 24 * 60 * 60 * 1000;
        break;
      case 'M':
        duration += value * 30 * 24 * 60 * 60 * 1000;
        break;
      case 'Y':
        duration += value * 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error(
          `Invalid unit encountered: ${unit}. This is a bug, please report this.`,
        );
    }
  }

  return {
    value: duration,
    name: v.name,
    secret: v.secret,
  };
}

export function asInt(v: VRaw, defaultValue = 0): V<number> {
  if (v.value === undefined) {
    return {
      value: defaultValue,
      name: v.name,
      secret: v.secret,
    };
  }
  const intValue = Number(v.value);
  if (Number.isNaN(intValue)) {
    throw new Error(`${v.name} is not a number`);
  }
  return {
    value: intValue,
    name: v.name,
    secret: v.secret,
  };
}

export function asBool(v: VRaw, defaultValue: boolean = false): V<boolean> {
  if (v.value === undefined) {
    return {
      value: defaultValue,
      name: v.name,
      secret: v.secret,
    };
  }

  if (['yes', 'true', 'on', '1'].includes(v.value.toLowerCase())) {
    return {
      value: true,
      name: v.name,
      secret: v.secret,
    };
  }

  if (['no', 'false', 'off', '0'].includes(v.value.toLowerCase())) {
    return {
      value: false,
      name: v.name,
      secret: v.secret,
    };
  }

  throw new Error(`${v.name} is not a valid boolean value.`);
}

export function secret<T>(v: V<T>): V<T> {
  return {
    value: v.value,
    name: v.name,
    secret: true,
  };
}

type VIO<I, O> = (v: V<I>) => V<O>;

export function pipe(): VT<string | undefined>;
export function pipe<T0>(t0: VIO<string | undefined, T0>): VT<T0>;
export function pipe<T0, T1>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
): VT<T1>;
export function pipe<T0, T1, T2>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
): VT<T2>;
export function pipe<T0, T1, T2, T3>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
  t3: VIO<T2, T3>,
): VT<T3>;
export function pipe<T0, T1, T2, T3, T4>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
  t3: VIO<T2, T3>,
  t4: VIO<T3, T4>,
): VT<T4>;
export function pipe<T0, T1, T2, T3, T4, T5>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
  t3: VIO<T2, T3>,
  t4: VIO<T3, T4>,
  t5: VIO<T4, T5>,
): VT<T5>;
export function pipe<T0, T1, T2, T3, T4, T5, T6>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
  t3: VIO<T2, T3>,
  t4: VIO<T3, T4>,
  t5: VIO<T4, T5>,
  t6: VIO<T5, T6>,
): VT<T6>;
export function pipe<T0, T1, T2, T3, T4, T5, T6, T7>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
  t3: VIO<T2, T3>,
  t4: VIO<T3, T4>,
  t5: VIO<T4, T5>,
  t6: VIO<T5, T6>,
  t7: VIO<T6, T7>,
): VT<T7>;
export function pipe<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
  t3: VIO<T2, T3>,
  t4: VIO<T3, T4>,
  t5: VIO<T4, T5>,
  t6: VIO<T5, T6>,
  t7: VIO<T6, T7>,
  t8: VIO<T7, T8>,
): VT<T8>;
export function pipe<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  t0: VIO<string | undefined, T0>,
  t1: VIO<T0, T1>,
  t2: VIO<T1, T2>,
  t3: VIO<T2, T3>,
  t4: VIO<T3, T4>,
  t5: VIO<T4, T5>,
  t6: VIO<T5, T6>,
  t7: VIO<T6, T7>,
  t8: VIO<T7, T8>,
  t9: VIO<T8, T9>,
): VT<T9>;
export function pipe<T>(...ts: VT<any>[]): VT<T> {
  return (initial: V<string | undefined>) => {
    let value: V<unknown> = initial;
    for (const t of ts) {
      value = t(value as any) as V<unknown>;
    }
    return value as unknown as V<T>;
  };
}
